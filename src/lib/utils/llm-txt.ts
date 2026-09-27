import { getCollection } from 'astro:content';
// @ts-ignore
import { getLiveCollection } from 'astro:content';
import { EXAMPLES_API_URL } from 'astro:env/server';
import toc from '@lib/toc.json';
import { unsupportedText, unsupportedVariant } from '@lib/utils/unsupported';
import { citationAttr, itemDois } from '@lib/utils/citations';

export type ExampleFormat = 'none' | 'xlsform' | 'ddi';

// --- Citation resolution ---

interface ZoteroItem {
    id: string;
    data: {
        creators?: Array<{ name?: string; lastName?: string }>;
        date?: string;
        DOI?: string;
        extra?: string;
    };
}

function formatAuthors(creators: ZoteroItem['data']['creators']): string {
    if (!creators || creators.length === 0) return '';
    const getName = (c: { name?: string; lastName?: string }) => c.lastName || c.name || '';
    if (creators.length === 1) return getName(creators[0]);
    if (creators.length === 2) return `${getName(creators[0])} & ${getName(creators[1])}`;
    return `${getName(creators[0])} et al.`;
}

function formatYear(date?: string): string {
    if (!date) return '';
    const m = date.match(/(\d{4})/);
    return m ? m[1] : date;
}

function resolveCitation(
    quellen: ZoteroItem[],
    attrs: { keys: string[]; dois: string[]; mode?: string }
): string {
    const items = [
        ...attrs.keys.map(k => quellen.find(q => q.id === k)),
        ...attrs.dois.map(d => quellen.find(q => itemDois(q).includes(d))),
    ].filter((item): item is ZoteroItem => item !== undefined);

    if (items.length === 0) return '[Citation]';

    const cite = (item: ZoteroItem) => {
        const authors = formatAuthors(item.data.creators);
        const year = formatYear(item.data.date);
        return attrs.mode === 'na' ? `${authors} (${year})` : `${authors}, ${year}`;
    };

    if (attrs.mode === 'na') return items.map(cite).join('; ');
    return `(${items.map(cite).join('; ')})`;
}

// --- Table formatting ---

function formatTextTable(headers: string[], rows: string[][]): string {
    const allRows = [headers, ...rows];
    const colWidths = headers.map((h, i) =>
        Math.max(h.length, ...rows.map(r => (r[i] || '').length))
    );
    const sep = colWidths.map(w => '-'.repeat(w)).join(' | ');
    const lines = allRows.map(row =>
        row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ')
    );
    return [lines[0], sep, ...lines.slice(1)].join('\n');
}

function formatRecordTable(sheetName: string, records: Record<string, string>[]): string {
    if (!records || records.length === 0) return '';
    const headers = [...new Set(records.flatMap(r => Object.keys(r)))];
    const rows = records.map(r => headers.map(h => r[h] ?? ''));
    return `**${sheetName}:**\n\`\`\`\n${formatTextTable(headers, rows)}\n\`\`\``;
}

// --- QuestionTypeBlock rendering ---

async function fetchExample(exampleId: string, format: ExampleFormat): Promise<string> {
    try {
        const res = await fetch(`${EXAMPLES_API_URL}/api/examples/${exampleId}`);
        if (!res.ok) return `[Example "${exampleId}" unavailable]`;
        const data = await res.json();

        const parts: string[] = [];

        if (format !== 'ddi') {
            if (data.xlsform?.survey) {
                parts.push(formatRecordTable('XLSForm survey', data.xlsform.survey));
            }
            if (data.xlsform?.choices?.length > 0) {
                parts.push(formatRecordTable('XLSForm choices', data.xlsform.choices));
            }
        }

        if (format !== 'xlsform') {
            if (data.ddi) {
                parts.push(`**DDI Codebook:**\n\`\`\`xml\n${data.ddi.trim()}\n\`\`\``);
            }
        }

        return parts.join('\n\n');
    } catch {
        return `[Example "${exampleId}" unavailable]`;
    }
}

// --- XlsFormDisplay inline rendering ---

function renderInlineXlsForm(jsxContent: string): string {
    try {
        const fn = new Function(`return ${jsxContent}`);
        const worksheets = fn() as Array<{
            id?: string;
            title: string;
            headers: string[];
            data: string[][];
        }>;

        return worksheets
            .map(ws => `**${ws.title}:**\n\`\`\`\n${formatTextTable(ws.headers, ws.data)}\n\`\`\``)
            .join('\n\n');
    } catch {
        return '[XLSForm display]';
    }
}

// --- Content processing ---

async function processContent(body: string, quellen: ZoteroItem[], format: ExampleFormat): Promise<string> {
    let content = body;

    // Remove import statements
    content = content.replace(/^import\s+.*$/gm, '');

    // Resolve Citations (self-closing)
    content = content.replace(
        /<Citation\s+([\s\S]*?)\/>/g,
        (_match, attrsStr: string) => resolveCitation(quellen, {
            keys: citationAttr(attrsStr, 'key'),
            dois: citationAttr(attrsStr, 'doi'),
            mode: citationAttr(attrsStr, 'mode')[0],
        })
    );

    // Replace Praxisbeispiel blocks with quoted content
    content = content.replace(
        /<Praxisbeispiel>([\s\S]*?)<\/Praxisbeispiel>/g,
        (_match, inner: string) => {
            const trimmed = inner.trim();
            const quoted = trimmed.split('\n').map(line => `> ${line}`).join('\n');
            return `> **Praxisbeispiel:**\n${quoted}`;
        }
    );

    // Replace Unsupported markers with their plain-text statement
    const unsupportedAttrs = (attrsStr: string) => ({
        partial: /\bpartial\b/.test(attrsStr),
        intro: /\bintro\b/.test(attrsStr),
    });
    content = content.replace(
        /<Unsupported\b([^>]*?)\/>/g,
        (_match, attrsStr: string) => unsupportedText(unsupportedVariant(unsupportedAttrs(attrsStr)), '')
    );
    content = content.replace(
        /<Unsupported\b([^>]*)>([\s\S]*?)<\/Unsupported>/g,
        (_match, attrsStr: string, inner: string) =>
            unsupportedText(unsupportedVariant(unsupportedAttrs(attrsStr)), inner.trim().replace(/\s*\n\s*/g, ' '))
    );

    // Replace XlsFormDisplay with inline data (only for xlsform format)
    if (format === 'xlsform') {
        content = content.replace(
            /<XlsFormDisplay\s+worksheets=\{(\[[\s\S]*?\])}\s*\/>/g,
            (_match, wsContent: string) => renderInlineXlsForm(wsContent)
        );
    } else {
        content = content.replace(
            /<XlsFormDisplay\s+worksheets=\{(\[[\s\S]*?\])}\s*\/>/g,
            ''
        );
    }

    // Collect QuestionTypeBlock example IDs and fetch them (skip for 'none')
    if (format === 'none') {
        content = content.replace(/<QuestionTypeBlock\s+exampleId="([^"]+)"\s*\/>/g, '');
    } else {
        const exampleMatches = [...content.matchAll(/<QuestionTypeBlock\s+exampleId="([^"]+)"\s*\/>/g)];
        const exampleResults = new Map<string, string>();

        await Promise.all(
            [...new Set(exampleMatches.map(m => m[1]))].map(async id => {
                exampleResults.set(id, await fetchExample(id, format));
            })
        );

        content = content.replace(
            /<QuestionTypeBlock\s+exampleId="([^"]+)"\s*\/>/g,
            (_match, id: string) => exampleResults.get(id) || `[Example "${id}" unavailable]`
        );
    }

    // Clean up any remaining JSX expressions
    content = content.replace(/\{[^}]*\}/g, '');

    // Collapse multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    return content.trim();
}

// --- Route builder ---

interface TocSection {
    label: string;
    children: string[];
    // Pages left out of methodology-only output (e.g. the XLSForm specification)
    excludeFromMethodology?: string[];
}

export interface LlmTxtOptions {
    // Leave out the pages each section lists in `excludeFromMethodology`
    methodologyOnly?: boolean;
}

function sectionChildren(section: TocSection, options: LlmTxtOptions): string[] {
    if (!options.methodologyOnly) return section.children;
    const excluded = new Set(section.excludeFromMethodology ?? []);
    return section.children.filter(child => !excluded.has(child));
}

function getOrderedSlugs(options: LlmTxtOptions): string[] {
    const slugs: string[] = [];
    for (const item of toc.sections) {
        if (typeof item === 'string') {
            slugs.push(item);
        } else {
            const section = item as TocSection;
            for (const child of sectionChildren(section, options)) {
                slugs.push(child);
            }
        }
    }
    return slugs;
}

const FORMAT_LABELS: Record<ExampleFormat, string> = {
    none: 'No examples included.',
    xlsform: 'Examples include XLSForm tables only (DDI Codebook excluded).',
    ddi: 'Examples include DDI Codebook XML only (XLSForm excluded).',
};

function getSlugsForPhases(maxPhases: number, options: LlmTxtOptions): string[] {
    const slugs: string[] = [];
    let phaseIndex = 0;
    for (const item of toc.sections) {
        if (typeof item === 'string') continue; // skip 'quellen' etc.
        const section = item as TocSection;
        phaseIndex++;
        if (phaseIndex > maxPhases) break;
        for (const child of sectionChildren(section, options)) {
            slugs.push(child);
        }
    }
    return slugs;
}

export async function buildLlmTxt(format: ExampleFormat, maxPhases?: number, options: LlmTxtOptions = {}): Promise<Response> {
    const pages = await getCollection('pages');
    const pageMap = new Map(pages.map(p => [p.id, p]));
    const orderedSlugs = maxPhases !== undefined ? getSlugsForPhases(maxPhases, options) : getOrderedSlugs(options);

    // Load Zotero references
    let quellen: ZoteroItem[] = [];
    try {
        const result = await getLiveCollection('quellen');
        quellen = result.entries || [];
    } catch (e) {
        console.error('Failed to load quellen for llm.txt:', e);
    }

    // Build table of contents
    const tocLines: string[] = [];
    let sectionIndex = 0;
    for (const item of toc.sections) {
        if (typeof item === 'string') {
            if (maxPhases !== undefined) continue;
            const page = pageMap.get(item);
            if (page) {
                tocLines.push(`- ${page.data.tocTitle}`);
            }
        } else {
            sectionIndex++;
            if (maxPhases !== undefined && sectionIndex > maxPhases) break;
            const section = item as TocSection;
            tocLines.push(`\n${sectionIndex}. ${section.label}`);
            for (const child of sectionChildren(section, options)) {
                const page = pageMap.get(child);
                if (page) {
                    tocLines.push(`   - ${page.data.tocTitle}`);
                }
            }
        }
    }

    // Build page contents with resolved components
    const pageContents: string[] = [];
    for (const slug of orderedSlugs) {
        const page = pageMap.get(slug);
        if (!page || !page.body) continue;

        const processed = await processContent(page.body, quellen, format);
        pageContents.push(processed);
    }

    const intro = `# Civic Data Lab Umfragenwerkstatt — llm.txt

> This file contains the full text content of the "Civic Data Lab Umfragenwerkstatt",
> a guide for survey methodology and tools developed by CorrelAid's Civic Data Labs.
> It covers the complete survey lifecycle: conception, questionnaire design, data collection,
> data preparation & analysis, and translating results into action.
> The content is primarily in German.
> ${FORMAT_LABELS[format]}${options.methodologyOnly ? '\n> Methodology only: the XLSForm specification is left out.' : ''}
>
> Source: https://umfragen.civic-data.de/

## Table of Contents

${tocLines.join('\n')}

---
`;

    const body = pageContents.join('\n\n---\n\n');

    return new Response(`${intro}\n\n${body}\n`, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
