<script lang="ts">
    let containerWidth = $state(750);
    let container: HTMLDivElement | undefined = $state();

    $effect(() => {
        if (container) {
            // Set initial width immediately
            containerWidth = container.offsetWidth;

            const observer = new ResizeObserver((entries) => {
                containerWidth = entries[0].contentRect.width;
            });
            observer.observe(container);
            return () => observer.disconnect();
        }
    });

    // Function to create hexagon (bolt) path
    function createHexagon(cx: number, cy: number, size: number): string {
        const angles = [0, 60, 120, 180, 240, 300];
        const points = angles.map(angle => {
            const rad = (angle * Math.PI) / 180;
            const x = cx + size * Math.cos(rad);
            const y = cy + size * Math.sin(rad);
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')} Z`;
    }

    const boltSize = 15;
    const boltHoleSize = 5.5;
</script>

<div bind:this={container} class="title-line-container">
    <svg xmlns="http://www.w3.org/2000/svg" width="{containerWidth}" height="70" viewBox="0 0 {containerWidth} 70" fill="none">
        <!-- White line connecting the dots -->
        <path
            stroke="var(--color-white)"
            stroke-width="3.5"
            d="M{containerWidth - 20} 25 L{(containerWidth / 4)*3} 52 L20 25"
            fill="none"
        />
        <!-- Bolt 1: Middle -->
        <path d={createHexagon((containerWidth / 4)*3, 52, boltSize)} fill="var(--color-text-primary)" />
        <path d={createHexagon((containerWidth / 4)*3, 52, boltHoleSize)} fill="var(--color-background-primary)" />
        <!-- Bolt 2: Left -->
        <path d={createHexagon(20, 25, boltSize)} fill="var(--color-text-primary)" />
        <path d={createHexagon(20, 25, boltHoleSize)} fill="var(--color-background-primary)" />
        <!-- Bolt 3: Right -->
        <path d={createHexagon(containerWidth - 20, 25, boltSize)} fill="var(--color-text-primary)" />
        <path d={createHexagon(containerWidth - 20, 25, boltHoleSize)} fill="var(--color-background-primary)" />
    </svg>
</div>

<style>
    .title-line-container {
        width: 100%;
        height: 70px;
        margin-top: var(--dimension-spacing-sm);
        margin-bottom: var(--dimension-spacing-md);
        color: var(--color-text-primary);
    }

    svg {
        width: 100%;
        height: 100%;
    }

</style>
