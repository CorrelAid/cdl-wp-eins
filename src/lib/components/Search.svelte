<script lang="ts">
    import { onMount } from 'svelte';
    let query = $state('');

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('q');
        if (q) query = q;
    });

    function handleSubmit(e: Event) {
        e.preventDefault();
        if (query.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    }
</script>

<form class="search-container" onsubmit={handleSubmit}>
    <div class="input-wrapper">
        <input 
            type="search" 
            name="q"
            placeholder="Search docs..." 
            bind:value={query}
        />
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    </div>
    <button type="submit" class="submit-btn" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    </button>
</form>

<style>
    .search-container {
        display: flex;
        gap: 0.5rem;
        width: 100%;
        margin-top: var(--dimension-spacing-md);
        margin-bottom: var(--dimension-spacing-md);
    }

    .input-wrapper {
        position: relative;
        flex: 1;
    }

    input {
        width: 100%;
        padding: 0.5rem 0.5rem 0.5rem 2rem;
        border: 1px solid var(--color-border, #ccc);
        border-radius: 4px;
        background: var(--color-surface, #fff);
        color: var(--color-text-primary);
        font-family: inherit;
        font-size: 0.9rem;
    }

    input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
    }

    .search-icon {
        position: absolute;
        left: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1rem;
        height: 1rem;
        color: var(--color-text-secondary, #666);
        pointer-events: none;
    }

    .submit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        background: var(--color-primary);
        color: var(--color-white);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .submit-btn:hover {
        background: var(--color-primary-dark, #6a134b);
    }

    .submit-btn svg {
        width: 1.25rem;
        height: 1.25rem;
    }
</style>
