<script lang="ts">
    interface NavItem {
        id: string;
        slug: string;
        title: string;
        hasChildren: boolean;
        isLink: boolean;
        children: NavItem[];
        level: number;
    }

    interface Props {
        navItems: NavItem[];
        currentPath: string;
    }

    let { navItems, currentPath: initialPath }: Props = $props();

    // Track current path reactively so it updates when the component
    // persists across Astro client-side navigations.
    let activePath = $state(initialPath);
    $effect(() => {
        activePath = window.location.pathname;
        const onNavigate = () => { activePath = window.location.pathname; };
        document.addEventListener('astro:page-load', onNavigate);
        return () => document.removeEventListener('astro:page-load', onNavigate);
    });

    function isActive(slug: string): boolean {
        const path = activePath.replace(/^\/|\/$/g, '');
        return path === slug;
    }
    let isOpen = $state(false);

    // Initialize state directly from localStorage if available (browser-only)
    const isBrowser = typeof window !== "undefined";

    let isManualOpen = $state(
        isBrowser
            ? localStorage.getItem("sidenav_manual_open") !== "false"
            : true,
    );
    let isToolboxOpen = $state(
        isBrowser
            ? localStorage.getItem("sidenav_toolbox_open") !== "false"
            : false,
    );

    let expandedItems = $state<Set<string>>(
        (() => {
            if (isBrowser) {
                const saved = localStorage.getItem("sidenav_expanded_items");
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            return new Set(parsed);
                        }
                    } catch (e) {
                        console.error(
                            "Error parsing sidenav_expanded_items",
                            e,
                        );
                    }
                }
            }
            return new Set();
        })(),
    );

    $effect(() => {
        localStorage.setItem("sidenav_manual_open", isManualOpen.toString());
    });

    $effect(() => {
        localStorage.setItem("sidenav_toolbox_open", isToolboxOpen.toString());
    });

    $effect(() => {
        localStorage.setItem(
            "sidenav_expanded_items",
            JSON.stringify([...expandedItems]),
        );
    });

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

    import Search from "./Search.svelte";
    import logo from "@lib/svg/logo.svg?raw";


</script>


<button
    id="menu-toggle"
    class:active={isOpen}
    aria-label="Toggle menu"
    onclick={toggleMenu}
>
    <span></span>
    <span></span>
    <span></span>
</button>

<nav id="sidebar" class:open={isOpen}>
    <div class="sidebar-header">
        <a href="/" onclick={closeMenu} class="logo-link">
            <div class="logo-comb">
                <div class="logo">{@html logo}</div>
                <span class="site-title">Umfragenwerkstatt</span>
            </div>
        </a>
        <hr />
    </div>

    <a href="/" onclick={closeMenu} class="overview-link" class:active={isActive('')}>Übersicht</a>

    <div class="section">
        <button
            class="section-header"
            onclick={() => (isManualOpen = !isManualOpen)}
            aria-expanded={isManualOpen}
        >
            Inhaltsverzeichnis 
            <svg
                class="chevron"
                class:rotated={isManualOpen}
                width="12"
                height="12"
                viewBox="0 0 12 12"
            >
                <path
                    d="M6 9L1.5 4.5L2.55 3.45L6 6.9L9.45 3.45L10.5 4.5L6 9Z"
                />
            </svg>
        </button>
        <div class="section-body" class:hidden={!isManualOpen}>
            <div class="section-content indented">
                <ul>
                    {#each navItems as item}
                        <li
                            class:has-children={item.hasChildren}
                            class:expanded={expandedItems.has(item.id)}
                        >
                            <div class="nav-item-wrapper">
                                {#if item.isLink}
                                    <a href={`/${item.slug}`} class:active={isActive(item.slug)}>{item.title}</a>
                                {:else}
                                    <button class="category-label"
                                        onclick={() => toggleSubmenu(item.id)}
                                        >{item.title}</button
                                    >
                                {/if}
                                {#if item.hasChildren}
                                    <button
                                        class="toggle-btn"
                                        aria-label={`Toggle ${item.title} submenu`}
                                        onclick={() => toggleSubmenu(item.id)}
                                    >
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                        >
                                            <path
                                                d="M6 9L1.5 4.5L2.55 3.45L6 6.9L9.45 3.45L10.5 4.5L6 9Z"
                                            />
                                        </svg>
                                    </button>
                                {/if}
                            </div>
                            {#if item.hasChildren}
                                <ul class="submenu">
                                    {#each item.children as child}
                                        <li>
                                            <a href={`/${child.slug}`} class:active={isActive(child.slug)}
                                                >{child.title}</a
                                            >
                                        </li>
                                    {/each}
                                </ul>
                            {/if}
                        </li>
                    {/each}
                </ul>
            </div>
            <a href="/pdf" class="book-link">
                <svg
                    class="book-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                    ><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                    ></path><path
                        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    ></path></svg
                >
                Als Buch anzeigen
            </a>
        </div>
    </div>

    <a href="/tools" class:active={isActive("tools")} class="section-header-link" onclick={closeMenu}>Tools</a>

    <a href="/llm.txt" class="llm-link" target="_blank" rel="noopener noreferrer">llm.txt</a>

    {#snippet externalLinkIcon()}
        <svg
            class="external-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            ><path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
            ></path><polyline points="15 3 21 3 21 9"
            ></polyline><line x1="10" y1="14" x2="21" y2="3"
            ></line></svg
        >
    {/snippet}

    <div class="search-container">
        <Search />
    </div>
</nav>

<div
    id="overlay"
    class:visible={isOpen}
    onclick={closeMenu}
    onkeydown={(e) => e.key === "Escape" && closeMenu()}
    role="button"
    tabindex="-1"
    aria-label="Close menu"
></div>

<style>
    /* #tools {
        padding-top: 10px;
    } */
    /* Hamburger Menu Button */
    #menu-toggle {
        position: fixed;
        top: calc((var(--dimension-header-height, 64px) - 40px) / 2);
        right: var(--spacing-sm);
        z-index: 1003; /* Above Header (1002) */
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
        height: 100vh;
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
        padding: 2rem var(--spacing-sm) var(--spacing-lg);
        border-right: var(--dimension-border-width) solid
            var(--color-text-primary);
        overflow-y: auto;
        z-index: 1000;
        transition: left 0.3s ease;
        display: flex;
        flex-direction: column;
    }

    nav.open {
        left: 0;
    }

    .logo-link {
        text-decoration: none;
        color: inherit;
        display: block;
    }

    .logo-link:hover {
        background-color: transparent !important;
        color: inherit !important;
    }

    .logo-comb {
        padding-bottom: var(--spacing-sm);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    .sidebar-header {
        margin-bottom: 1.5rem;
    }

    nav hr {
        border: none;
        border-top: var(--dimension-border-width) solid var(--color-text-primary);
        margin: 0;
    }

    .logo {
        height: 60px;
        margin-bottom: 0.5rem;
    }

    .logo :global(svg) {
        height: 100%;
        width: auto;
        overflow: visible;
    }

    .site-title {
        font-weight: 900;
        font-size: 1.2rem;
        line-height: 1.2;
        font-family: var(--font-family-heading);
    }

    .overview-link {
        display: block;
        padding: 0.25rem 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: bold;
        font-size: 1.1rem;
        color: var(--color-text-primary);
        text-decoration: none;
        border-radius: 4px;
    }

    .overview-link:hover {
        color: var(--color-text-primary-darker);
    }

    .section {
        margin-bottom: 0.5rem;
    }

    .section-header-link {
        display: block;
        padding: 0.25rem 0.5rem;
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }

    .section-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: none;
        border: none;
        padding: 0.25rem 0.5rem;
        font-weight: bold;
        font-size: 1.1rem;
        color: var(--color-text-primary);
        cursor: pointer;
        text-align: left;
    }

    .section-header:hover {
        color: var(--color-text-primary-darker);
    }

    .book-link {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        padding: 0.2rem 0.5rem;
        margin-top: 0.1rem;
        color: var(--color-text-primary);
        opacity: 0.7;
        text-decoration: none;
        border-radius: 4px;
        transition: opacity 0.2s ease, background-color 0.2s ease;
    }

    .book-link:hover {
        opacity: 1;
        background-color: var(--color-text-primary-darker);
        color: var(--color-white);
    }

    .book-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
    }

    .chevron {
        transition: transform 0.2s ease;
        fill: currentColor;
    }

    .chevron.rotated {
        transform: rotate(180deg);
    }

    .section-body.hidden {
        display: none;
    }

    .section-content {
        margin-bottom: 0.5rem;
        margin-top: 0.5rem;
    }

    .section-content.indented {
        padding-left: 0.25rem;
        margin-left: 0.75rem;
        border-left: var(--dimension-border-width) solid
            var(--color-text-primary);
    }

    nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    nav li {
        margin-bottom: 0;
    }

    .nav-item-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .nav-item-wrapper a {
        flex: 1;
        padding: 0.35rem 0.5rem !important;
        pointer-events: auto;
        z-index: 1;
        position: relative;
    }

    .nav-item-wrapper a:hover {
        text-decoration: underline;
    }

    .category-label {
        flex: 1;
        padding: 0.35rem 0.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 0.95rem;
        line-height: 1.4;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        border-radius: 4px;
        font-family: inherit;
    }

    .category-label:hover {
        color: var(--color-text-primary-darker);
    }

    .toggle-btn {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
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
        fill: var(--color-text-primary) !important;
    }

    .toggle-btn svg path {
        fill: var(--color-text-primary) !important;
    }

    li.expanded .toggle-btn {
        transform: rotate(180deg);
    }

    .submenu {
        display: none;
        list-style: none;
        padding-left: 0.25rem;
        margin-left: 0.5rem;
        margin-top: 0.125rem;
        margin-bottom: 0.5rem;
        border-left: var(--dimension-border-width) solid
            var(--color-text-primary);
    }

    li.expanded .submenu {
        display: block;
    }

    .submenu li {
        margin-bottom: 0;
    }

    .submenu a {
        font-size: 0.9em;
        padding: 0.3rem 0.5rem !important;
    }

    nav a {
        text-decoration: none;
        color: var(--color-text-primary);
        display: block;
        padding: 0.35rem 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        line-height: 1.4;
    }

    nav a:hover {
        color: var(--color-text-primary-darker);
    }

    nav a.active {
        font-weight: 700;
        background-color: var(--color-primary);
        color: var(--color-white);
    }


    .llm-link {
        display: block;
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        font-family: var(--font-family-mono);
        opacity: 0.5;
        margin-bottom: 0.25rem;
    }

    .llm-link:hover {
        opacity: 1;
    }

    .search-container {
        margin-top: auto;
        padding-top: 1rem;
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
            transition: none; /* Disable sliding animation on desktop navigation */
        }
    }
</style>
