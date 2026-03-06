// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import { cdlTokens } from '@correlaid/cdl-design/vite-plugin';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), svelte()],
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
