import { getEntityColor, resolveColor } from '@common/colors';
import type { HistoryDataPoint } from '@common/helpers';
import {
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

// Gradient cache for performance
let powerGradient: CanvasGradient | null = null;
let energyGradient: CanvasGradient | null = null;
let lastChartWidth = 0;
let lastChartHeight = 0;
let lastPowerLineType: string | null = null;
let lastEnergyLineType: string | null = null;

/**
 * Creates a power gradient for the chart
 */
function getPowerGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: { left: number; right: number; top: number; bottom: number },
  lineType: 'normal' | 'gradient' | 'gradient_no_fill' = 'normal',
): CanvasGradient {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;

  if (
    !powerGradient ||
    lastChartWidth !== chartWidth ||
    lastChartHeight !== chartHeight ||
    lastPowerLineType !== lineType
  ) {
    lastChartWidth = chartWidth;
    lastChartHeight = chartHeight;
    lastPowerLineType = lineType;
    powerGradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top,
    );

    if (lineType === 'gradient_no_fill') {
      // Cool colors at bottom, warm colors at top
      powerGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // Blue at bottom
      powerGradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.8)'); // Green in lower middle
      powerGradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.8)'); // Yellow in upper middle
      powerGradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)'); // Red at top
    } else {
      // Original blue gradient
      powerGradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)'); // Blue at bottom
      powerGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)'); // Blue in middle
      powerGradient.addColorStop(1, 'rgba(59, 130, 246, 1)'); // Blue at top
    }
  }
  return powerGradient;
}

/**
 * Creates an energy gradient for the chart
 */
function getEnergyGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: { left: number; right: number; top: number; bottom: number },
  lineType: 'normal' | 'gradient' | 'gradient_no_fill' = 'normal',
): CanvasGradient {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;

  if (
    !energyGradient ||
    lastChartWidth !== chartWidth ||
    lastChartHeight !== chartHeight ||
    lastEnergyLineType !== lineType
  ) {
    lastChartWidth = chartWidth;
    lastChartHeight = chartHeight;
    lastEnergyLineType = lineType;
    energyGradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top,
    );

    if (lineType === 'gradient_no_fill') {
      // Cool colors at bottom, warm colors at top
      energyGradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)'); // Cyan at bottom
      energyGradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.8)'); // Green in lower middle
      energyGradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.8)'); // Yellow in upper middle
      energyGradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)'); // Red at top
    } else {
      // Original green gradient
      energyGradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)'); // Green at bottom
      energyGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.6)'); // Green in middle
      energyGradient.addColorStop(1, 'rgba(16, 185, 129, 1)'); // Green at top
    }
  }
  return energyGradient;
}

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export interface EntityData {
  entityId: string;
  friendlyName: string;
  data: HistoryDataPoint[];
}

export interface ChartData {
  powerData: EntityData[];
  energyData: EntityData[];
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  showLegend?: boolean;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  lineType?: 'normal' | 'gradient' | 'gradient_no_fill' | 'no_fill';
  entityColorMap?: Record<string, string>;
}

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
  const { powerData, energyData } = data;
  const {
    responsive = true,
    maintainAspectRatio = false,
    showLegend = false,
    hideXAxis = false,
    hideYAxis = false,
    lineType = 'normal',
    entityColorMap = {},
  } = options;

  // Use smooth curves with stepped lines for energy data
  const powerTension = 0.4; // smooth curves for power
  const energyTension = 0; // straight lines for energy
  const powerStepped = false; // smooth for power
  const energyStepped = 'before'; // stepped for energy

  // Prepare datasets
  const datasets: any[] = [];

  // Power data - create separate dataset for each power entity
  powerData.forEach((entityData, index) => {
    if (entityData.data.length > 0) {
      const powerChartData = entityData.data.map((d) => ({
        x: d.timestamp.getTime(),
        y: d.value,
      }));

      const entityColor = resolveColor(
        getEntityColor(
          entityData.entityId,
          index,
          'power',
          powerData.length,
          entityColorMap,
        ),
      );

      datasets.push({
        label: `${entityData.friendlyName} (W)`,
        data: powerChartData,
        borderColor:
          lineType === 'gradient' || lineType === 'gradient_no_fill'
            ? function (context: any) {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return entityColor;
                }
                return getPowerGradient(ctx, chartArea, lineType);
              }
            : entityColor,
        backgroundColor:
          lineType === 'gradient'
            ? function (context: any) {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return entityColor.replace('0.8', '0.1');
                }
                return getPowerGradient(ctx, chartArea, lineType);
              }
            : lineType === 'gradient_no_fill' || lineType === 'no_fill'
              ? 'transparent'
              : entityColor.replace('0.8', '0.1'),
        borderWidth: 2,
        fill: lineType !== 'gradient_no_fill' && lineType !== 'no_fill',
        tension: powerTension,
        stepped: powerStepped,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y',
      });
    }
  });

  // Energy data - create separate dataset for each energy entity
  energyData.forEach((entityData, index) => {
    if (entityData.data.length > 0) {
      const energyChartData = entityData.data.map((d) => ({
        x: d.timestamp.getTime(),
        y: d.value,
      }));

      const entityColor = resolveColor(
        getEntityColor(
          entityData.entityId,
          index,
          'energy',
          energyData.length,
          entityColorMap,
        ),
      );

      datasets.push({
        label: `${entityData.friendlyName} (kWh)`,
        data: energyChartData,
        borderColor:
          lineType === 'gradient' || lineType === 'gradient_no_fill'
            ? function (context: any) {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return entityColor;
                }
                return getEnergyGradient(ctx, chartArea, lineType);
              }
            : entityColor,
        backgroundColor:
          lineType === 'gradient'
            ? function (context: any) {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return entityColor.replace('0.8', '0.2');
                }
                return getEnergyGradient(ctx, chartArea, lineType);
              }
            : lineType === 'gradient_no_fill' || lineType === 'no_fill'
              ? 'transparent'
              : entityColor.replace('0.8', '0.2'),
        borderWidth: 2,
        fill: lineType !== 'gradient_no_fill' && lineType !== 'no_fill',
        tension: energyTension,
        stepped: energyStepped,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y1',
      });
    }
  });

  return {
    type: 'line',
    data: { datasets },
    options: {
      responsive,
      maintainAspectRatio,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: showLegend,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed?.y?.toFixed(1) || '0';
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          display: !hideXAxis,
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm',
              day: 'MMM d',
            },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            display: !hideXAxis,
          },
          ticks: {
            color: '#666',
            display: !hideXAxis,
            callback: function (value, index, ticks) {
              const date = new Date(value);
              const hours = date.getHours();
              const minutes = date.getMinutes();

              // Show day at midnight (00:00)
              if (hours === 0 && minutes === 0) {
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }

              // Otherwise just show time
              return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            },
          },
        },
        y: {
          type: 'linear',
          display: !hideYAxis,
          position: 'left',
          title: {
            display: !hideYAxis,
            text: 'Power (W)',
            color: 'rgba(59, 130, 246, 0.8)',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            display: !hideYAxis,
          },
          ticks: {
            color: '#666',
            display: !hideYAxis,
          },
        },
        y1: {
          type: 'linear',
          display: !hideYAxis,
          position: 'right',
          title: {
            display: !hideYAxis,
            text: 'Energy (kWh)',
            color: 'rgba(16, 185, 129, 0.8)',
          },
          grid: {
            drawOnChartArea: false,
            display: !hideYAxis,
          },
          ticks: {
            color: '#666',
            display: !hideYAxis,
          },
        },
      },
    },
  };
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

  const config = createChartConfig(data, options);
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
