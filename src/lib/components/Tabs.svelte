<script lang="ts">
    interface Tab {
        title: string;
        content: string;
    }

    interface Props {
        tabs: Tab[];
        activeTab?: number;
    }

    let props = $props<Props>();
    let currentTab = $state(props.activeTab || 0);

    function setTab(index: number) {
        currentTab = index;
    }
</script>

<div class="tabs-wrapper">
    <div class="tabs-bar" role="tablist">
        {#each props.tabs as tab, index}
            <button
                class="tab-button"
                class:active={currentTab === index}
                role="tab"
                aria-selected={currentTab === index}
                aria-controls="tabpanel-{index}"
                onclick={() => setTab(index)}
            >
                {tab.title}
            </button>
        {/each}
    </div>
    <hr class="tab-rule" />
    <div class="panels-grid">
        {#each props.tabs as tab, index}
            <div
                class="tab-panel"
                class:active={currentTab === index}
                role="tabpanel"
                id="tabpanel-{index}"
                aria-hidden={currentTab !== index}
            >
                {@html tab.content}
            </div>
        {/each}
    </div>
</div>

<style>
    .tabs-wrapper {
        margin: var(--spacing-lg) 0;
    }

    .tabs-bar {
        display: flex;
        gap: var(--spacing-lg);
        overflow-x: auto;
    }

    .tab-rule {
        border: none;
        border-top: var(--dimension-border-width) solid var(--color-text-primary);
        margin: 0 0 var(--spacing-base);
        opacity: 0.3;
    }

    .tab-button {
        padding: var(--spacing-xs) 0;
        border: none;
        background: transparent;
        cursor: pointer;
        font-family: var(--font-family-body);
        font-size: 1rem;
        color: var(--color-text-primary);
        white-space: nowrap;
        opacity: 0.5;
        border-bottom: 2px solid transparent;
        margin-bottom: -1.5px;
        transition: opacity 0.15s ease;
    }

    .tab-button:hover {
        opacity: 0.8;
    }

    .tab-button.active {
        opacity: 1;
        font-weight: var(--font-weight-semibold);
        border-bottom-color: var(--color-text-primary);
    }

    .panels-grid {
        display: grid;
    }

    .tab-panel {
        grid-area: 1 / 1;
        overflow-x: auto;
        visibility: hidden;
        pointer-events: none;
    }

    .tab-panel.active {
        visibility: visible;
        pointer-events: auto;
    }

    .tab-panel :global(pre) {
        margin: 0;
        border-radius: var(--radius-lg);
        overflow-x: auto;
    }
</style>
