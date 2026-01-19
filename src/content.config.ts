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
        tocTitle: z.string(),
        teaser: z.string().default("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
    })
});

export const collections = { pages };   