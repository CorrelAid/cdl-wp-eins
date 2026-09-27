// Site consistency checks, run after `bun run build`:
//   1. every tool in toc.json has a snippet (de + en), and every snippet has a tool
//   2. internal links in dist/ (HTML pages and llm*.txt) point at existing pages and anchors
//
// Usage: bun run check:site [--only=snippets|links]

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import toc from '../src/lib/toc.json';

const ROOT = join(import.meta.dir, '..');
const SNIPPETS = join(ROOT, 'src/content/snippets');
const DIST = process.env.DIST_DIR ?? join(ROOT, 'dist');
const SITE_ORIGIN = 'https://umfragen.civic-data.de';
const SNIPPET_LOCALES = ['de', 'en'];

// Snippet directories without a toc.json tool entry, and why they exist.
const SNIPPET_ALLOWLIST: Record<string, string> = {
    liability: 'fetched by formtransform-app, qwac and formulaid, not shown on /tools',
};

// --- 1. toc.json <-> snippet directories ---

function checkSnippets(): string[] {
    const errors: string[] = [];
    const toolIds = new Set(toc.tools.map(t => t.id));
    const dirs = readdirSync(SNIPPETS).filter(d => statSync(join(SNIPPETS, d)).isDirectory());

    for (const id of toolIds) {
        for (const locale of SNIPPET_LOCALES) {
            if (!existsSync(join(SNIPPETS, id, `${locale}.html`))) {
                errors.push(`toc.json tool "${id}" has no src/content/snippets/${id}/${locale}.html`);
            }
        }
    }
    for (const dir of dirs) {
        if (!toolIds.has(dir) && !(dir in SNIPPET_ALLOWLIST)) {
            errors.push(`src/content/snippets/${dir}/ has no toc.json tool entry (add one, or allowlist it in scripts/check-site.ts with a reason)`);
        }
    }
    return errors;
}

// --- 2. internal links over dist/ ---

function walk(dir: string): string[] {
    return readdirSync(dir).flatMap(name => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? walk(path) : [path];
    });
}

// Resolve a site path to the built file that serves it, if any.
function resolveTarget(pathname: string): string | null {
    const p = decodeURIComponent(pathname).replace(/^\/+/, '');
    const candidates = [join(DIST, p), join(DIST, p, 'index.html'), join(DIST, `${p}.html`)];
    return candidates.find(c => existsSync(c) && statSync(c).isFile()) ?? null;
}

const idCache = new Map<string, Set<string>>();
function idsOf(file: string): Set<string> {
    let ids = idCache.get(file);
    if (!ids) {
        const html = readFileSync(file, 'utf8');
        ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => decodeHtml(m[1])));
        idCache.set(file, ids);
    }
    return ids;
}

function decodeHtml(s: string): string {
    return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// Turn a raw link into { path, hash } when it points inside the site, else null.
function internal(raw: string, fromPath: string): { path: string; hash: string } | null {
    const href = decodeHtml(raw.trim());
    if (!href || /^(mailto|tel|javascript|data):/i.test(href)) return null;
    let url: URL;
    try {
        url = new URL(href, `${SITE_ORIGIN}${fromPath}`);
    } catch {
        return null;
    }
    if (url.origin !== SITE_ORIGIN) return null;
    return { path: url.pathname, hash: url.hash.slice(1) };
}

function sitePathOf(file: string): string {
    const rel = '/' + relative(DIST, file).split('\\').join('/');
    return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

function checkLinks(): string[] {
    if (!existsSync(DIST)) return ['dist/ not found: run `bun run build` first'];
    const errors: string[] = [];
    // Without Zotero access (e.g. a fork's pull request has no secrets) /quellen renders no entries,
    // so its citation anchors can't be checked.
    const quellen = resolveTarget('/quellen');
    const skipQuellenAnchors = quellen !== null && readFileSync(quellen, 'utf8').includes('Error loading quellen');
    if (skipQuellenAnchors) console.log('note /quellen has no entries (Zotero unavailable): skipping its anchors');
    const files = walk(DIST).filter(f => f.endsWith('.html') || /\/llm[^/]*\.txt$/.test(f));

    for (const file of files) {
        const from = sitePathOf(file);
        const text = readFileSync(file, 'utf8');
        const hrefs = file.endsWith('.html')
            ? [...text.matchAll(/<a\b[^>]*?\shref=["']([^"']*)["']/g)].map(m => m[1])
            : [...text.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]);

        for (const raw of new Set(hrefs)) {
            const link = internal(raw, from);
            if (!link) continue;
            // Same-page links in llm*.txt refer to anchors of the source page, not of the txt file
            if (!file.endsWith('.html') && raw.startsWith('#')) continue;
            const target = resolveTarget(link.path);
            if (!target) {
                errors.push(`${from}: link to missing page ${raw}`);
                continue;
            }
            if (skipQuellenAnchors && target === quellen) continue;
            if (link.hash && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(link.hash))) {
                errors.push(`${from}: link to missing anchor ${raw}`);
            }
        }
    }
    return errors;
}

// --- main ---

const only = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length);
const checks: Array<[string, () => string[]]> = [
    ['toc.json <-> snippets', checkSnippets],
    ['internal links in dist/', checkLinks],
];

let failed = false;
for (const [name, run] of checks) {
    if (only && !name.includes(only)) continue;
    const errors = run();
    if (errors.length === 0) {
        console.log(`ok   ${name}`);
    } else {
        failed = true;
        console.log(`FAIL ${name} (${errors.length})`);
        for (const e of errors) console.log(`     ${e}`);
    }
}
process.exit(failed ? 1 : 0);
