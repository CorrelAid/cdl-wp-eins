# CDL: Werkstattphase 1

## Setup

1. Install [Bun](https://bun.com/)
2. `bun install`
3. `bun run dev` to start development server

## Contribution

- Content is organized in mdx filed in `src/content/pages`
    - you can add new pages to the doc by adding a new .mdx
    - make sure to include frontmatter 

- To include content in the page navigation, add it to `src/lib/toc.json`
- You can check how your md looks by running `bun dev`. The page will update on every change.

### Literature & Citations

Literature is managed via a Zotero group and fetched live. To cite an item in an MDX page:

1. Find the Zotero key of the item (e.g., by looking at the `/literature` page) or its DOI.
2. Use the `Citation` component (available globally in MDX):
   ```mdx
   {/* Find the key in the browser url of the item, e.g. https://www.zotero.org/groups/6410519/cdl-wp/items/3SZ58NRP/item-list*/}
   <Citation key="3SZ58NRP" mode="na" /> 
   {/* OR */}
   <Citation doi="10.48550/ARXIV.2510.08338" mode="pa" />
   ```

**Props:**
- `key` (optional): The Zotero item key.
- `doi` (optional): The DOI of the item.
- Note: Either `key` or `doi` must be provided.
- `mode` (optional): `'pa'` (default, e.g., "(Author, Year)") or `'na'` (e.g., "Author (Year)").
- `includePages` (optional): Boolean to include page numbers.
- `pages` (optional): String for page numbers.

### Answer Type Examples

Examples for answer types (XLSForm, DDI XML, screenshots) are fetched at build time from an external [qwackback](https://github.com/CorrelAid/qwackback) API. This ensures consistency between projects that use the same example data. The API URL is configured via the `EXAMPLES_API_URL` environment variable (see `.env.example`).

# Misc

## Draft structure

- Intro