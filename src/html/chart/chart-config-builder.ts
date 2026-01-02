import { getEntityColor, resolveColor } from '@common/colors';
import type { HistoryDataPoint } from '@common/helpers';
import type { ChartConfiguration } from 'chart.js';

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
 * Builder class for creating Chart.js configurations for energy and power data
 */
export class ChartConfigBuilder {
  // Gradient cache for performance
  private powerGradient: CanvasGradient | null = null;
  private energyGradient: CanvasGradient | null = null;
  private lastChartWidth = 0;
  private lastChartHeight = 0;
  private lastPowerLineType: string | null = null;
  private lastEnergyLineType: string | null = null;

  /**
   * Creates a power gradient for the chart
   */
  private getPowerGradient(
    ctx: CanvasRenderingContext2D,
    chartArea: { left: number; right: number; top: number; bottom: number },
    lineType: 'normal' | 'gradient' | 'gradient_no_fill' = 'normal',
  ): CanvasGradient {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;

    if (
      !this.powerGradient ||
      this.lastChartWidth !== chartWidth ||
      this.lastChartHeight !== chartHeight ||
      this.lastPowerLineType !== lineType
    ) {
      this.lastChartWidth = chartWidth;
      this.lastChartHeight = chartHeight;
      this.lastPowerLineType = lineType;
      this.powerGradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top,
      );

      if (lineType === 'gradient_no_fill') {
        // Cool colors at bottom, warm colors at top
        this.powerGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // Blue at bottom
        this.powerGradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.8)'); // Green in lower middle
        this.powerGradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.8)'); // Yellow in upper middle
        this.powerGradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)'); // Red at top
      } else {
        // Original blue gradient
        this.powerGradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)'); // Blue at bottom
        this.powerGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)'); // Blue in middle
        this.powerGradient.addColorStop(1, 'rgba(59, 130, 246, 1)'); // Blue at top
      }
    }
    return this.powerGradient;
  }

  /**
   * Creates an energy gradient for the chart
   */
  private getEnergyGradient(
    ctx: CanvasRenderingContext2D,
    chartArea: { left: number; right: number; top: number; bottom: number },
    lineType: 'normal' | 'gradient' | 'gradient_no_fill' = 'normal',
  ): CanvasGradient {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;

    if (
      !this.energyGradient ||
      this.lastChartWidth !== chartWidth ||
      this.lastChartHeight !== chartHeight ||
      this.lastEnergyLineType !== lineType
    ) {
      this.lastChartWidth = chartWidth;
      this.lastChartHeight = chartHeight;
      this.lastEnergyLineType = lineType;
      this.energyGradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top,
      );

      if (lineType === 'gradient_no_fill') {
        // Cool colors at bottom, warm colors at top
        this.energyGradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)'); // Cyan at bottom
        this.energyGradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.8)'); // Green in lower middle
        this.energyGradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.8)'); // Yellow in upper middle
        this.energyGradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)'); // Red at top
      } else {
        // Original green gradient
        this.energyGradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)'); // Green at bottom
        this.energyGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.6)'); // Green in middle
        this.energyGradient.addColorStop(1, 'rgba(16, 185, 129, 1)'); // Green at top
      }
    }
    return this.energyGradient;
  }

  /**
   * Creates a Chart.js configuration for energy and power data
   * @param data - The power and energy data points
   * @param options - Chart configuration options
   * @returns Chart.js configuration object
   */
  build(data: ChartData, options: ChartOptions = {}): ChartConfiguration {
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

    // Capture 'this' for use in callbacks
    const builder = this;

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
                  return builder.getPowerGradient(ctx, chartArea, lineType);
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
                  return builder.getPowerGradient(ctx, chartArea, lineType);
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
                  return builder.getEnergyGradient(ctx, chartArea, lineType);
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
                  return builder.getEnergyGradient(ctx, chartArea, lineType);
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
}

