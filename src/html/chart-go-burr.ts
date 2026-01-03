import {
  BarController,
  BarElement,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  ChartConfigBuilder,
  type ChartData,
  type ChartOptions,
} from './chart/chart-config-builder';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Re-export types for backward compatibility
export type {
  ChartData,
  ChartOptions,
  EntityData,
} from './chart/chart-config-builder';

/**
 * Creates a Chart.js configuration for energy and power data
 * @param data - The power and energy data points
 * @param options - Chart configuration options
 * @returns Chart.js configuration object
 */
export function createChartConfig(
  data: ChartData,
  options: ChartOptions = {},
): ChartConfiguration {
  const builder = new ChartConfigBuilder();
  return builder.build(data, options);
}

/**
 * Creates and initializes a Chart.js instance
 * @param canvas - The canvas element to render the chart on
 * @param data - The power and energy data points
 * @param options - Chart configuration options
 * @returns The Chart.js instance
 */
export function createChart(
  canvas: HTMLCanvasElement,
  data: ChartData,
  options: ChartOptions = {},
): Chart {
  // Destroy existing chart if any
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const builder = new ChartConfigBuilder();
  const config = builder.build(data, options);
  return new Chart(canvas, config);
}

/**
 * Destroys a Chart.js instance
 * @param chart - The Chart.js instance to destroy
 */
export function destroyChart(chart?: Chart): void {
  if (chart) {
    chart.destroy();
  }
}
