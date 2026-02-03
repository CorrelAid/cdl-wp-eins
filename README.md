# CDL: Werkstattphase 1

## Setup

1. Install [Bun](https://bun.com/)
2. `bun install`
3. `bun run dev` to start development server

## Contribution

- Content is organized in mdx filed in `src/content/pages`
    - you can add new pages to the doc by adding a new .mdx
    - make sure to include frontmatter 

- To include content in the page navigation, add it to `src/toc.json`
- You can check how your md looks by running `bun dev`. The page will update on every change.

### Literature & Citations

Literature is managed via a Zotero group and fetched live. To cite an item in an MDX page:

1. Find the Zotero key of the item (e.g., by looking at the `/literature` page) or its DOI.
2. Use the `Citation` component (available globally in MDX):
   ```mdx
   <Citation key="3SZ58NRP" mode="narrative" />
   {/* OR */}
   <Citation doi="10.48550/ARXIV.2510.08338" mode="parenthetical" />
   ```

**Props:**
- `key` (optional): The Zotero item key.
- `doi` (optional): The DOI of the item.
- Note: Either `key` or `doi` must be provided.
- `mode` (optional): `'parenthetical'` (default, e.g., "(Author, Year)") or `'narrative'` (e.g., "Author (Year)").
- `includePages` (optional): Boolean to include page numbers.
- `pages` (optional): String for page numbers.