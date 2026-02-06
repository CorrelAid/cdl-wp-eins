<script lang="ts">
    import MiniSearch from 'minisearch';
    import { onMount } from 'svelte';
    import Card from './Card.svelte';

    let results = $state<any[]>([]);
    let isLoading = $state(true);
    let error = $state<string | null>(null);
    let query = $state('');

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        query = urlParams.get('q') || '';

        if (!query) {
            isLoading = false;
            return;
        }

        try {
            const response = await fetch('/search.json');
            if (!response.ok) throw new Error('Failed to load search index');
            const documents = await response.json();
            
            const miniSearch = new MiniSearch({
                fields: ['title', 'content', 'teaser'],
                storeFields: ['title', 'teaser', 'id', 'content'], // Store content to show snippets if needed
                searchOptions: {
                    boost: { title: 2 },
                    fuzzy: 0.2,
                    prefix: true
                }
            });
            
            miniSearch.addAll(documents);
            results = miniSearch.search(query);
        } catch (e) {
            console.error('Error loading search index:', e);
            error = 'Failed to load search results. Please try again later.';
        } finally {
            isLoading = false;
        }
    });

    // Helper to extract a snippet around the match (simplified)
    function getSnippet(content: string, term: string) {
       // Ideally we'd use the match data from minisearch, but for now simple truncating
       // or just showing the teaser is often enough. 
       // Let's stick to showing the teaser and maybe the start of content if no teaser.
       return content.slice(0, 200) + '...';
    }
</script>

<div class="search-results-page">
    {#if isLoading}
        <div class="loading">Loading search results...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else if !query}
        <div class="no-query">Please enter a search term in the sidebar.</div>
    {:else if results.length === 0}
        <div class="no-results">No results found for "{query}".</div>
    {:else}
        <div class="results-header">Found {results.length} result{results.length === 1 ? '' : 's'} for "{query}"</div>
        <ul class="results-list">
            {#each results as result}
                <li>
                    <Card>
                        <a href={`/${result.id}`} class="result-link">
                            <article>
                                <h3>{result.title}</h3>
                                <p class="teaser">
                                    {result.teaser || getSnippet(result.content, query)}
                                </p>
                            </article>
                        </a>
                    </Card>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .search-results-page {
        padding: var(--spacing-md) 0;
    }

    .loading, .error, .no-query, .no-results {
        padding: var(--spacing-lg);
        text-align: center;
        color: var(--color-text-secondary);
        font-style: italic;
    }

    .error {
        color: var(--color-danger, #d32f2f);
    }

    .results-header {
        margin-bottom: var(--spacing-lg);
        font-weight: bold;
        color: var(--color-text-primary);
    }

    .results-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .results-list li {
        margin-bottom: 0; /* Card handles margin */
    }

    .result-link {
        display: block;
        text-decoration: none;
        color: inherit;
        /* Expand link to fill the Card (Card padding is 1.5rem) */
        margin: -1.5rem;
        padding: 1.5rem;
        border-radius: 8px; /* Match card radius */
        height: 100%;
    }

    /* Remove specific border-bottom from list items as Card has its own style */
    
    h3 {
        margin-top: 0;
        margin-bottom: var(--spacing-sm);
        color: var(--color-text-secondary);
    }

    .result-link:hover h3 {
        text-decoration: underline;
    }

    .teaser {
        margin: 0;
        color: var(--color-text-secondary);
        opacity: 0.9;
        line-height: 1.6;
    }
</style>
