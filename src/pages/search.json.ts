
import { getCollection } from 'astro:content';

export async function GET() {
    const pages = await getCollection('pages');
    
    const documents = pages.map(page => {
        // Simple markdown stripper: remove headers, list markers, links, etc.
        // This doesn't need to be perfect, just reduce noise.
        const cleanContent = page.body
            ? page.body
                .replace(/#{1,6}\s+/g, '') // Remove headers
                .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
                .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Remove links
                .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1') // Remove images
                .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove code blocks (optional, sometimes we want to search code)
                .replace(/^\s*[-+*]\s+/gm, '') // Remove list items
                .replace(/\n/g, ' ') // Replace newlines with spaces
            : '';

        return {
            id: page.id,
            title: page.data.tocTitle,
            teaser: page.data.teaser,
            content: cleanContent
        };
    });

    return new Response(JSON.stringify(documents), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
