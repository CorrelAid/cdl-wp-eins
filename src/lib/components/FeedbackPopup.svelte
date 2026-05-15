<script lang="ts">
    import { onMount } from 'svelte';

    interface Props {
        storageKey?: string;
    }

    let { storageKey = 'cdl-feedback-popup-dismissed' }: Props = $props();

    let visible = $state(false);
    let entered = $state(false);
    let footerVisible = $state(false);
    let navOpen = $state(false);

    onMount(() => {
        if (typeof window === 'undefined') return;
        try {
            if (sessionStorage.getItem(storageKey) === '1') return;
        } catch (_) {}

        const trigger = () => {
            visible = true;
            requestAnimationFrame(() => {
                entered = true;
            });
            cleanupTriggers();
        };

        const opts: AddEventListenerOptions = { once: true, passive: true };
        window.addEventListener('scroll', trigger, opts);
        window.addEventListener('click', trigger, opts);
        window.addEventListener('keydown', trigger, opts);
        window.addEventListener('touchstart', trigger, opts);

        function cleanupTriggers() {
            window.removeEventListener('scroll', trigger);
            window.removeEventListener('click', trigger);
            window.removeEventListener('keydown', trigger);
            window.removeEventListener('touchstart', trigger);
        }

        let observer: IntersectionObserver | undefined;
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    footerVisible = entries.some((e) => e.isIntersecting);
                },
                { rootMargin: '0px' },
            );
        }

        const attachFooter = () => {
            footerVisible = false;
            if (!observer) return;
            observer.disconnect();
            const footer = document.querySelector('.site-footer');
            if (footer) observer.observe(footer);
        };

        attachFooter();
        document.addEventListener('astro:page-load', attachFooter);

        let navObserver: MutationObserver | undefined;
        const attachNav = () => {
            navOpen = false;
            navObserver?.disconnect();
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;
            const update = () => {
                navOpen = sidebar.classList.contains('open');
            };
            update();
            navObserver = new MutationObserver(update);
            navObserver.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        };

        attachNav();
        document.addEventListener('astro:page-load', attachNav);

        return () => {
            cleanupTriggers();
            observer?.disconnect();
            navObserver?.disconnect();
            document.removeEventListener('astro:page-load', attachFooter);
            document.removeEventListener('astro:page-load', attachNav);
        };
    });

    function close() {
        try {
            sessionStorage.setItem(storageKey, '1');
        } catch (_) {}
        entered = false;
        setTimeout(() => {
            visible = false;
        }, 300);
    }
</script>

{#if visible}
    <aside
        class="bubble"
        class:entered={entered && !footerVisible && !navOpen}
        class:hidden={footerVisible || navOpen}
        role="complementary"
        aria-labelledby="feedback-popup-title"
    >
        <button type="button" class="close" onclick={close} aria-label="Schließen">×</button>
        <h2 id="feedback-popup-title">Umfragenbox eingesetzt? Feedback? Erfahrungen?</h2>
        <p>
            Eure Rückmeldungen bringen uns und andere weiter: Welche Tools
            konntet Ihr brauchen? Was hat geklappt, was war schwierig? Gern
            würden wir Euch kurz dazu interviewen. Meldet Euch bitte unter
            <a href="mailto:mail@civic-data.de">mail@civic-data.de</a>!
        </p>
    </aside>
{/if}

<style>
    .bubble {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        max-width: 24rem;
        width: calc(100% - 3rem);
        background-color: white;
        color: var(--color-text-primary);
        border: var(--dimension-border-width) solid var(--color-text-primary);
        border-radius: var(--radius-lg, 14px);
        padding: 1.25rem 1.5rem;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
        font-family: var(--font-family-body);
        z-index: 9999;
        transform: translateY(calc(100% + 2rem));
        opacity: 0;
        transition:
            transform 0.65s cubic-bezier(0.22, 1.2, 0.36, 1),
            opacity 0.5s ease;
    }

    .bubble.entered {
        transform: translateY(0);
        opacity: 1;
    }

    .bubble.hidden {
        pointer-events: none;
    }

    .bubble h2 {
        font-family: var(--font-family-heading);
        font-size: 1.1rem;
        margin: 0 2rem 0.5rem 0;
        line-height: 1.25;
    }

    .bubble p {
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;
    }

    .close {
        position: absolute;
        top: 0.25rem;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        color: var(--color-text-primary);
        padding: 0.25rem 0.5rem;
    }

    @media (max-width: 480px) {
        .bubble {
            bottom: 0.75rem;
            right: 0.75rem;
            left: 0.75rem;
            width: auto;
            max-width: none;
        }
    }
</style>
