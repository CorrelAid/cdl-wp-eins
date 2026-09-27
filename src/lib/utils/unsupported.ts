// Wording for the <Unsupported> marker, shared by the component and the llm*.txt output
// so pages and agents read the same statement.

export const SUBSET_URL = 'https://github.com/CorrelAid/formtransform#supported-xlsform-subset';

export type UnsupportedVariant = 'unsupported' | 'partial' | 'intro';

export const UNSUPPORTED_LEAD: Record<UnsupportedVariant, string> = {
    unsupported:
        'Nicht unterstützt in der CDL-Pipeline: FormTransform und qwacback lehnen einen Fragebogen ab, der diese Funktion verwendet.',
    partial:
        'Nur teilweise unterstützt in der CDL-Pipeline: Was über die unterstützte Form hinausgeht, lehnen FormTransform und qwacback ab.',
    intro:
        'Hinweis zur CDL-Pipeline: Diese Seite beschreibt XLSForm allgemein. FormTransform und qwacback unterstützen nur eine Teilmenge davon und lehnen Fragebögen mit anderen Funktionen ab. Abschnitte zu nicht oder nur teilweise unterstützten Funktionen sind markiert.',
};

export const SUBSET_LINK_LABEL = 'Unterstützte XLSForm-Teilmenge';

export function unsupportedVariant(attrs: { partial?: boolean; intro?: boolean }): UnsupportedVariant {
    if (attrs.intro) return 'intro';
    if (attrs.partial) return 'partial';
    return 'unsupported';
}

// Plain-text form used in llm*.txt.
export function unsupportedText(variant: UnsupportedVariant, reason: string): string {
    const parts = [UNSUPPORTED_LEAD[variant]];
    if (reason) parts.push(reason);
    parts.push(`${SUBSET_LINK_LABEL}: ${SUBSET_URL}`);
    return parts.map(p => `> ${p}`).join('\n>\n');
}
