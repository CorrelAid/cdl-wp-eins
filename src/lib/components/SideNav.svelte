<script lang="ts">
    interface NavItem {
        id: string;
        slug: string;
        title: string;
        hasChildren: boolean;
        children: NavItem[];
        level: number;
    }

    interface Props {
        navItems: NavItem[];
    }

    let { navItems }: Props = $props();
    let isOpen = $state(false);

    // Initialize with all items that have children expanded by default
    // Note: We intentionally capture the initial value of navItems here
    // and don't react to changes, preserving user's expansion state
    let expandedItems = $state<Set<string>>((() => {
        const initialItems = navItems.filter(item => item.hasChildren).map(item => item.id);
        return new Set(initialItems);
    })());

    function toggleMenu() {
        isOpen = !isOpen;
    }

    function toggleSubmenu(itemId: string) {
        const newSet = new Set(expandedItems);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        expandedItems = newSet;
    }

    function closeMenu() {
        isOpen = false;
    }

    import Search from './Search.svelte';
</script>

<button id="menu-toggle" class:active={isOpen} aria-label="Toggle menu" onclick={toggleMenu}>
    <span></span>
    <span></span>
    <span></span>
</button>

<nav id="sidebar" class:open={isOpen}>
    <ul>
        <li>
            <a href="/">Home</a>
        </li>
        {#each navItems as item}
            <li class:has-children={item.hasChildren} class:expanded={expandedItems.has(item.id)}>
                <div class="nav-item-wrapper">
                    <a href={`/${item.slug}`}>{item.title}</a>
                    {#if item.hasChildren}
                        <button
                            class="toggle-btn"
                            aria-label={`Toggle ${item.title} submenu`}
                            onclick={() => toggleSubmenu(item.id)}
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12">
                                <path d="M6 9L1.5 4.5L2.55 3.45L6 6.9L9.45 3.45L10.5 4.5L6 9Z"/>
                            </svg>
                        </button>
                    {/if}
                </div>
                {#if item.hasChildren}
                    <ul class="submenu">
                        {#each item.children as child}
                            <li>
                                <a href={`/${child.slug}`}>{child.title}</a>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </li>
        {/each}
    </ul>
    <Search />
</nav>

<div
    id="overlay"
    class:visible={isOpen}
    onclick={closeMenu}
    onkeydown={(e) => e.key === 'Escape' && closeMenu()}
    role="button"
    tabindex="-1"
    aria-label="Close menu"
></div>

<style>
    /* Hamburger Menu Button */
    #menu-toggle {
        position: fixed;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        z-index: 1001;
        background: var(--color-primary);
        border: none;
        border-radius: 4px;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        transition: all 0.3s ease;
    }

    #menu-toggle span {
        display: block;
        width: 24px;
        height: 3px;
        background: var(--color-text-primary);
        border-radius: 2px;
        transition: all 0.3s ease;
    }

    #menu-toggle.active span:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }

    #menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    #menu-toggle.active span:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }

    /* Overlay */
    #overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    #overlay.visible {
        opacity: 1;
        pointer-events: auto;
    }

    /* Sidebar Navigation */
    nav {
        position: fixed;
        top: 0;
        left: -280px;
        width: 250px;
        height: 100vh;
        background: var(--color-white);
        padding: 4rem var(--spacing-sm) var(--spacing-lg);
        border-right: var(--dimension-border-width) solid var(--color-text-primary);
        overflow-y: auto;
        z-index: 1000;
        transition: left 0.3s ease;
    }

    nav.open {
        left: 0;
    }

    nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    nav li {
        margin-bottom: var(--spacing-xs);
    }

    .nav-item-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .nav-item-wrapper a {
        flex: 1;
        padding-right: 0.5rem !important;
        pointer-events: auto;
        z-index: 1;
        position: relative;
    }

    .nav-item-wrapper a:hover {
        text-decoration: underline;
    }

    .toggle-btn {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        color: var(--color-text-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        pointer-events: auto;
        z-index: 2;
    }

    .toggle-btn svg {
        width: 12px;
        height: 12px;
        fill: #86185f !important;
    }

    .toggle-btn svg path {
        fill: #86185f !important;
    }

    li.expanded .toggle-btn {
        transform: rotate(180deg);
    }

    .submenu {
        display: none;
        list-style: none;
        padding-left: var(--spacing-md);
        margin-top: 0.25rem;
    }

    li.expanded .submenu {
        display: block;
    }

    .submenu li {
        margin-bottom: 0.25rem;
    }

    .submenu a {
        font-size: 0.9em;
    }

    nav a {
        text-decoration: none;
        color: var(--color-text-primary);
        display: block;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    nav a:hover {
        background-color: var(--color-primary);
        color: var(--color-white);
    }

    /* Desktop View - Show sidebar by default */
    @media (min-width: 768px) {
        #menu-toggle {
            display: none;
        }

        #overlay {
            display: none;
        }

        nav {
            position: fixed;
            left: 0;
            top: 0;
            width: 250px;
            height: 100vh;
            flex-shrink: 0;
        }
    }
</style>
