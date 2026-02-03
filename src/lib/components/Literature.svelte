<script lang="ts">
    import { onMount } from 'svelte';

    interface Creator {
        name?: string;
        creatorType?: string;
    }

    interface LiteratureData {
        title?: string;
        creators?: Creator[];
        publicationTitle?: string;
        date?: string;
        DOI?: string;
        url?: string;
        zoteroKey: string;
    }

    interface LiteratureItem {
        id: string;
        data: LiteratureData;
    }

    interface Props {
        items?: LiteratureItem[];
        error?: string | null;
    }

    let { items = [], error = null }: Props = $props();

    let activeId = $state<string | null>(null);
    let copiedId = $state<string | null>(null);

    function scrollToItem(id: string) {
        const targetId = id.startsWith('#') ? id.substring(1) : id;
        const element = document.getElementById(targetId);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            activeId = targetId;
            
            // Update URL
            if (history.pushState) {
                history.pushState(null, '', `#${targetId}`);
            } else {
                window.location.hash = targetId;
            }
        }
    }

    function handleAnchorClick(e: MouseEvent, id: string) {
        e.preventDefault();
        scrollToItem(id);
        
        const fullUrl = window.location.origin + window.location.pathname + '#' + id;
        navigator.clipboard.writeText(fullUrl).then(() => {
            copiedId = id;
            setTimeout(() => {
                if (copiedId === id) copiedId = null;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy link:', err);
        });
    }

    onMount(() => {
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            // Small delay to ensure rendering
            setTimeout(() => {
               scrollToItem(hash);
            }, 100);
        }

        const handlePopState = () => {
            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                // We don't need to scroll here necessarily as browser does it, 
                // but we need to update activeId
                activeId = hash;
                // Ensure element is in view in case browser didn't scroll perfectly
                const element = document.getElementById(hash);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                activeId = null;
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    });
</script>

<div class="literature-container">
    <h1>Literature</h1>
    {#if error}
        <div class="error-message">
            <p>⚠️ Error loading literature: {error}</p>
        </div>
    {:else if items.length > 0}
        <ul class="literature-list">
            {#each items as item (item.id)}
                <li 
                    class="literature-item" 
                    class:active={activeId === item.id}
                    id={item.id}
                >
                    <a 
                        href={`#${item.id}`} 
                        class="anchor-link" 
                        aria-label="Link to this item"
                        onclick={(e) => handleAnchorClick(e, item.id)}
                    >
                        {copiedId === item.id ? '📋' : '#'}
                    </a>
                    <div class="apa-citation">
                        {#if item.data.creators && item.data.creators.length > 0}
                            <span class="apa-authors">
                                {#each item.data.creators as creator, i}
                                    <span>
                                        {creator.name}{i < item.data.creators.length - 1 ? ', ' : ''}
                                    </span>
                                {/each}
                            </span>
                        {/if}
                        
                        {#if item.data.creators && item.data.creators.length > 0 && (item.data.date || item.data.title)}
                             {' ('}
                        {/if}

                        {#if item.data.date}
                            <span class="apa-date">{item.data.date}</span>
                        {/if}

                        {#if item.data.creators && item.data.creators.length > 0 && (item.data.date || item.data.title)}
                             {'). '}
                        {/if}

                        {#if item.data.title}
                            <span class="apa-title">{item.data.title}. </span>
                        {/if}

                        {#if item.data.publicationTitle}
                            <span class="apa-source"><em>{item.data.publicationTitle}</em>.</span>
                        {/if}

                        {#if item.data.DOI}
                            <span class="apa-doi"> <a href={`https://doi.org/${item.data.DOI}`} target="_blank">https://doi.org/{item.data.DOI}</a></span>
                        {/if}

                        {#if item.data.url && !item.data.DOI}
                            <span class="apa-url"> <a href={item.data.url} target="_blank">{item.data.url}</a></span>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <p class="no-results">No literature found.</p>
    {/if}
</div>

<style>
    .literature-container {
        max-width: 1200px;
        margin: 0 auto;
        color: var(--color-text-secondary);

        h1 {
            margin-bottom: 0.5rem;
            color: var(--color-primary);
        }

        .sort-info {
            color: var(--color-text-secondary);
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
            font-style: italic;
        }

        .literature-list {
            list-style: none;
            padding: 0;

            .literature-item {
                background-color: var(--color-secondary);
                border-radius: 8px;
                padding: 1.5rem;
                padding-right: 3rem; /* Space for anchor link */
                margin-bottom: 1.5rem;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s ease;
                position: relative;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);

                    .anchor-link {
                        opacity: 1;
                    }
                }

                &.active {
                    box-shadow: inset -8px 0 0 0 white, 0 4px 8px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px) !important;
                    position: relative !important;
                    transition: all 0.3s ease !important;

                    .anchor-link {
                        opacity: 1 !important;
                        background-color: var(--color-text-primary);
                        color: var(--color-surface-1);
                    }
                }

                .anchor-link {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    background-color: var(--color-accent);
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    text-decoration: none;
                    z-index: 10;
                }

                .apa-citation {
                    font-size: 1rem;
                    line-height: 1.6;
                    color: var(--color-text);
                    margin: 0;
                    padding: 0;
                    padding-right: 1rem; /* Extra safety for long text */
                    font-family: var(--font-sans);
                    display: block;
                    border-left: 3px solid var(--color-accent);
                    padding-left: 10px;

                    .apa-authors {
                        font-weight: 600;
                        color: var(--color-text);
                    }

                    .apa-title {
                        font-style: normal;
                        font-weight: 400;
                        color: var(--color-text);
                    }

                    .apa-source {
                        font-style: italic;
                        font-weight: 400;
                        color: var(--color-text-secondary);
                    }

                    .apa-doi,
                    .apa-url {
                        color: var(--color-accent);
                        font-size: 0.9rem;
                        font-weight: 400;

                        a {
                            color: var(--color-accent);
                            text-decoration: none;
                            font-weight: 500;

                            &:hover {
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }
        }

        .no-results {
            color: var(--color-text-secondary);
            font-style: italic;
            text-align: center;
            margin-top: 2rem;
        }

        .error-message {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #ef9a9a;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 2rem;
            text-align: center;

            p {
                margin: 0.5rem 0;
            }
        }
    }

    @media (max-width: 768px) {
        .literature-container {
            padding: 1rem;

            .literature-list .literature-item {
                padding: 1rem;
            }
        }
    }
</style>