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

export interface ChartData {
  powerData: HistoryDataPoint[];
  energyData: HistoryDataPoint[];
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  showLegend?: boolean;
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
  } = options;

  // Prepare datasets
  const datasets = [];

  // Power data (last 24 hours) - shown as a line
  if (powerData.length > 0) {
    const powerChartData = powerData.map((d) => ({
      x: d.timestamp.getTime(),
      y: d.value,
    }));
    datasets.push({
      label: 'Power (W)',
      data: powerChartData,
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      yAxisID: 'y',
    });
  }

  // Energy data (last 24 hours, 5-min aggregated) - shown as bars/line
  if (energyData.length > 0) {
    const energyChartData = energyData.map((d) => ({
      x: d.timestamp.getTime(),
      y: d.value,
    }));
    datasets.push({
      label: 'Energy (kWh)',
      data: energyChartData,
      borderColor: 'rgba(16, 185, 129, 0.8)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      yAxisID: 'y1',
    });
  }

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
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm',
              day: 'MMM d',
            },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#666',
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
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Power (W)',
            color: 'rgba(59, 130, 246, 0.8)',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#666',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Energy (kWh)',
            color: 'rgba(16, 185, 129, 0.8)',
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#666',
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
