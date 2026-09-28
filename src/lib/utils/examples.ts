// Question-type examples from qwacback (`/api/examples/{id}`). Every page, the PDF and each
// llm*.txt endpoint render the same examples, so fetch each id once per process and share it:
// a build then sends one request per example instead of one per render, which keeps qwacback's
// rate limit (429) out of reach. A failed fetch returns null so callers can degrade instead of
// failing the whole build.

import { TTLCache } from '@isaacs/ttlcache';
import { EXAMPLES_API_URL } from 'astro:env/server';

export interface Example {
    xlsform: { survey: Record<string, string>[]; choices?: Record<string, string>[] };
    ddi?: string;
    limesurveySrc?: string;
    koboSrc?: string;
}

// Long enough to cover a build, short enough that `bun run dev` picks up qwacback changes.
const cache = new TTLCache<string, Promise<Example | null>>({ ttl: 10 * 60 * 1000 });

const MAX_ATTEMPTS = 3;

async function load(id: string): Promise<Example | null> {
    const url = `${EXAMPLES_API_URL}/api/examples/${id}`;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const res = await fetch(url);
            if (res.ok) return (await res.json()) as Example;
            if (res.status !== 429 && res.status < 500) {
                console.warn(`[examples] ${id}: ${res.status} ${res.statusText}`);
                return null;
            }
            if (attempt === MAX_ATTEMPTS) {
                console.warn(`[examples] ${id}: ${res.status} ${res.statusText} after ${attempt} attempts`);
                return null;
            }
            const retryAfter = Number(res.headers.get('retry-after'));
            const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
            await new Promise(resolve => setTimeout(resolve, Math.min(wait, 10_000)));
        } catch (e) {
            if (attempt === MAX_ATTEMPTS) {
                console.warn(`[examples] ${id}: ${e}`);
                return null;
            }
        }
    }
    return null;
}

export function getExample(id: string): Promise<Example | null> {
    let pending = cache.get(id);
    if (!pending) {
        pending = load(id);
        cache.set(id, pending);
        // Don't keep a failure around; the next render may succeed.
        pending.then(result => { if (!result) cache.delete(id); });
    }
    return pending;
}
