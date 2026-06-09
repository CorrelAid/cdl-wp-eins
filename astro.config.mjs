// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import { cdlTokens } from '@correlaid/cdl-design/vite-plugin';

import svelte from '@astrojs/svelte';

// Disallow h1 (`#`) in content: the page title is rendered from frontmatter `pageTitle`.
function remarkNoH1() {
  /** @param {any} tree @param {any} file */
  return (tree, file) => {
    for (const node of tree.children ?? []) {
      if (node.type === 'heading' && node.depth === 1) {
        const line = node.position?.start?.line;
        throw new Error(
          `H1 (\`#\`) not allowed in ${file.path}${line ? `:${line}` : ''}. ` +
          `The page title comes from frontmatter \`pageTitle\`; use \`##\` or deeper for content headings.`
        );
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), svelte()],
  markdown: {
    remarkPlugins: [remarkNoH1]
  },
  experimental: {
    liveContentCollections: true
  },
  env: {
    schema: {
      ZOTERO_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: false
      }),
      ZOTERO_GROUP_ID: envField.string({
        context: "server",
        access: "secret",
        optional: false
      }),
      EXAMPLES_API_URL: envField.string({
        context: "server",
        access: "secret",
        optional: false,
        default: "https://qwacback.correlaid.org"
      })
    }
  },
  vite: {
    plugins: [cdlTokens()]
  }
});
