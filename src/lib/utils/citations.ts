// Reading <Citation> tags from raw MDX bodies. MDX allows several spellings of the same
// attribute (key="X", key={"X"}, doi={["A", "B"]}), so every reader goes through here.

// Values of one attribute: a string literal, or a JSX expression holding a string or an array of strings.
export function citationAttr(attrsStr: string, name: string): string[] {
    const m = attrsStr.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`));
    if (!m) return [];
    if (m[1] !== undefined) return [m[1]];
    if (m[2] !== undefined) return [m[2]];
    return [...m[3].matchAll(/["']([^"']+)["']/g)].map(v => v[1]);
}

export function citationTags(body: string): string[] {
    return [...body.matchAll(/<Citation\b([^>]*?)\/?>/g)].map(m => m[1]);
}

export function usedCitations(bodies: string[]): { keys: Set<string>; dois: Set<string> } {
    const keys = new Set<string>();
    const dois = new Set<string>();
    for (const body of bodies) {
        for (const attrs of citationTags(body)) {
            citationAttr(attrs, 'key').forEach(k => keys.add(k));
            citationAttr(attrs, 'doi').forEach(d => dois.add(d));
        }
    }
    return { keys, dois };
}

// DOIs of a Zotero item: its DOI field, or a "DOI: …" line in `extra` (item types without a DOI field).
export function itemDois(item: { data: { DOI?: string; extra?: string } }): string[] {
    const dois: string[] = [];
    if (item.data.DOI) dois.push(item.data.DOI);
    const extra = item.data.extra?.match(/^DOI:\s*(.+)$/m);
    if (extra) dois.push(extra[1].trim());
    return dois;
}

export function isCited(item: { id: string; data: { DOI?: string; extra?: string } }, used: { keys: Set<string>; dois: Set<string> }): boolean {
    return used.keys.has(item.id) || itemDois(item).some(d => used.dois.has(d));
}
