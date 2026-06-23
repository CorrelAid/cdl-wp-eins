<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Chart,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    BarController,
    LineController,
    LineElement,
    PointElement,
    ArcElement,
    DoughnutController,
    ScatterController
  } from 'chart.js';

  Chart.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    BarController,
    LineController,
    LineElement,
    PointElement,
    ArcElement,
    DoughnutController,
    ScatterController
  );

  interface Props {
    type: 'bar' | 'line' | 'doughnut' | 'scatter';
    data: {
      labels?: string[];
      datasets: {
        label: string;
        data: number[] | { x: number; y: number }[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
      }[];
    };
    options?: Record<string, unknown>;
    height?: number;
  }

  let { type, data, options = {}, height = 300 }: Props = $props();
  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
    };

    new Chart(ctx, {
      type,
      data: JSON.parse(JSON.stringify(data)),
      options: { ...defaultOptions, ...options },
    });
  });
</script>

<div class="chart-container" style="height: {height}px">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-container {
    background: var(--color-white);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    margin-bottom: 2rem;
  }

  .chart-container canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
</style>
