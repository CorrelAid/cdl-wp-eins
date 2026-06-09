import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pages = defineCollection({
    loader: glob({
        pattern: "**/*.mdx",
        base: "./src/content/pages",
        generateId: ({ entry }) => {
            // Use filename without extension as the slug/id
            return entry.replace(/\.mdx$/, '');
        }
    }),
    schema: z.object({
        pageTitle: z.string(),
        tocTitle: z.string().optional(),
        teaser: z.string().default("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
    }).transform((data) => ({
        ...data,
        tocTitle: data.tocTitle ?? data.pageTitle
    }))
});

export const collections = { pages };   