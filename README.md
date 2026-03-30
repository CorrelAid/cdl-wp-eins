# CDL: Werkstattbox 1 (Umfragenwerkstatt)

[![AI-Assisted](https://img.shields.io/badge/AI--assisted-Claude%20Code-blueviolet?logo=anthropic&logoColor=white)](./AI_DISCLOSURE.md)

## Setup

1. Install [Bun](https://bun.com/)
2. `bun install`
3. Copy `.env.example` to `.env` and fill in the values (see below)
4. `bun run dev` to start development server

## Environment Variables

| Variable | Description |
|---|---|
| `ZOTERO_API_KEY` | API key for the Zotero account. Generate one at [zotero.org/settings/keys](https://www.zotero.org/settings/keys). |
| `ZOTERO_GROUP_ID` | Numeric ID of the Zotero group library. Find it in the URL when viewing the group on zotero.org (e.g. `https://www.zotero.org/groups/<ID>/...`). |
| `EXAMPLES_API_URL` | Base URL of the [qwackback](https://github.com/CorrelAid/qwackback) API that serves XLSForm examples. Set to `http://localhost:8090` for local development. |

The app builds without `ZOTERO_API_KEY`/`ZOTERO_GROUP_ID` — citations will simply be empty. `EXAMPLES_API_URL` is required at build time wherever `<QuestionTypeBlock>` is used in content.

## Contribution

- Content is organized in mdx filed in `src/content/pages`
    - you can add new pages to the doc by adding a new .mdx
    - make sure to include frontmatter 

- To include content in the page navigation, add it to `src/lib/toc.json`
- You can check how your md looks by running `bun dev`. The page will update on every change.

### Quellen & Citations

Quellen is managed via a Zotero group and fetched live. To cite an item in an MDX page:

1. Find the Zotero key of the item (e.g., by looking at the `/quellen` page) or its DOI.
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

### Tool Snippets

HTML fragments in `src/content/snippets/` contain short descriptions for individual tools (e.g. FormulAid, QWAC). Each file is a `<section>` of prose that can be embedded into any page.

When the site is deployed, every snippet is also served as a plain HTML file at `/snippets/<filename>`, for example:

```
https://your-domain.example/snippets/formulaid.html
https://your-domain.example/snippets/qwac.html
```

External applications can fetch these URLs to embed up-to-date descriptions without duplicating content:

```js
const res = await fetch('https://your-domain.example/snippets/formulaid.html');
document.querySelector('#description').innerHTML = await res.text();
```

To add a new snippet, create an `.html` file in `src/content/snippets/` — it will be served automatically.

### LLM.txt

The site exposes machine-readable plain-text versions of its content for LLM consumption at the following routes:

| Route | Description |
|---|---|
| `/llm.txt` | Full content, no examples |
| `/llm-xlsform.txt` | Full content with XLSForm table examples |
| `/llm-ddi.txt` | Full content with DDI Codebook XML examples |
| `/llm-phases12-xlsform.txt` | First two phases (Konzeption + Fragebogendesign) with XLSForm examples only |

Each file includes a table of contents, resolved citations, and rendered prose. Examples are fetched from the `EXAMPLES_API_URL` at build time (same as `<QuestionTypeBlock>` — variants without examples do not require this).

### Answer Type Examples

Examples for answer types (XLSForm, DDI XML, screenshots) are fetched at build time from an external [qwackback](https://github.com/CorrelAid/qwackback) API. This ensures consistency between projects that use the same example data. The API URL is configured via the `EXAMPLES_API_URL` environment variable (see `.env.example`).

# Misc

## Draft structure

- Intro