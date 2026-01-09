import {
  fetchPowerEnergyData,
  getEntityColorMap,
  getEntityIds,
  type PowerEnergyData,
} from '@common/helpers';
import { hasFeature } from '@config/feature';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { Chart } from 'chart.js';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { getArea } from '../delegates/retrievers/area';
import { getDevice } from '../delegates/retrievers/device';
import { getZapped } from '../delegates/utils/get-zapped';
import {
  createChart,
  destroyChart,
  type ChartData,
} from '../html/chart-go-burr';
import { renderError } from '../html/no-good';
import { renderLegend } from '../html/watching-waiting';
import { styles } from '../styles';
import { EntityState } from '../types/entity';
const equal = require('fast-deep-equal');

/**
 * Ohm Assistant Energy & Power Card
 */
export class AreaEnergy extends LitElement {
  /**
   * The configuration for the card
   */
  @state()
  private _config!: Config;

  /**
   * Whether the card is loading
   */
  @state()
  private _loading = false;

  /**
   * The error message
   */
  @state()
  private _error?: string;

  /**
   * The power entities
   */
  @state()
  private _powerEntities: EntityState[] = [];

  /**
   * The energy entities
   */
  @state()
  private _energyEntities: EntityState[] = [];

  /**
   * Count of active lights in the area
   */
  @state()
  private _activeLights = 0;

  /**
   * Count of active switches in the area
   */
  @state()
  private _activeSwitches = 0;

  /**
   * The Home Assistant instance
   * Not marked state.
   */
  private _hass!: HomeAssistant;

  /**
   * The chart instance
   */
  private _chart?: Chart;

  /**
   * Current power and energy data for rendering
   */
  private _currentData?: PowerEnergyData;

  /**
   * Returns the component's styles
   */
  static override get styles() {
    return styles;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    if (!equal(config, this._config)) {
      this._config = config;
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    const { powerEntities, energyEntities, activeLights, activeSwitches } =
      getZapped(hass, this._config);

    if (!equal(powerEntities, this._powerEntities)) {
      this._powerEntities = powerEntities;
    }
    if (!equal(energyEntities, this._energyEntities)) {
      this._energyEntities = energyEntities;
    }
    if (activeLights !== this._activeLights) {
      this._activeLights = activeLights;
    }
    if (activeSwitches !== this._activeSwitches) {
      this._activeSwitches = activeSwitches;
    }

    this._hass = hass;
  }

  override render(): TemplateResult | typeof nothing {
    if (this._error) {
      return renderError(this._error);
    }

    return html`
      <ha-card>
        ${this._renderHeader()}
        ${this._loading
          ? html`
              <div class="loading-container">
                <div class="spinner"></div>
                <div class="loading-text">Loading history data...</div>
              </div>
            `
          : nothing}
        <div class="chart-container">
          <canvas id="energyChart"></canvas>
        </div>
        ${!this._loading &&
        renderLegend(
          this._hass,
          this._config,
          this._powerEntities,
          this._energyEntities,
          getEntityColorMap(this._config),
          this._currentData?.untrackedPowerData,
        )}
      </ha-card>
    `;
  }

  private _renderHeader(): TemplateResult | typeof nothing {
    if (hasFeature(this._config, 'hide_name')) {
      return nothing;
    }

    const area = getArea(this._hass.areas, this._config.area);
    const areaName =
      this._config.name ||
      `${area?.name || this._config.area} Energy Consumption`;

    return html`
      <div class="header">
        <h2 class="card-title">${areaName}</h2>
        <div class="status-badges">
          ${this._activeLights > 0
            ? html`
                <div class="status-item">
                  <ha-icon icon="mdi:lightbulb"></ha-icon>
                  <span class="status-count">${this._activeLights}</span>
                </div>
              `
            : nothing}
          ${this._activeSwitches > 0
            ? html`
                <div class="status-item">
                  <ha-icon icon="mdi:light-switch"></ha-icon>
                  <span class="status-count">${this._activeSwitches}</span>
                </div>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  override firstUpdated(): void {
    this._initChart();
  }

  private async _initChart(): Promise<void> {
    if (!this._hass) return;

    this._loading = true;
    this._error = undefined;

    try {
      // Determine chart type and adjust data aggregation accordingly
      const chartType = this._config.chart?.chart_type || 'line';
      // Use hourly aggregation for bar charts and stacked_line charts to reduce data points
      // Use 5-minute aggregation for regular line charts for smoother lines
      const period = chartType === 'stacked_bar' || chartType === 'stacked_line' ? 'hour' : '5minute';

      // Fetch power and energy data (include total power entity for untracked power calculation)
      const totalPowerEntityId = this._config.chart?.total_power_entity;
      const data = await fetchPowerEnergyData(
        this._hass,
        this._powerEntities,
        this._energyEntities,
        24,
        period,
        totalPowerEntityId,
      );

      if (data.powerData.length === 0 && data.energyData.length === 0) {
        const entityIds = getEntityIds(this._config);
        this._error = `No history data available for entities: ${entityIds.join(', ') || ''}`;
        return;
      }

      // Store data for rendering
      this._currentData = data;

      // Wait for next tick to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 0));

      const canvas = this.shadowRoot?.querySelector(
        '#energyChart',
      ) as HTMLCanvasElement;
      if (!canvas) {
        this._error = 'No canvas found';
        return;
      }

      // Destroy existing chart if any
      destroyChart(this._chart);
      this._chart = undefined;

      // Create chart using the new module
      const chartData: ChartData = {
        powerData: data.powerData,
        energyData: data.energyData,
        untrackedPowerData: data.untrackedPowerData,
      };

      const legendStyle = this._config.chart?.legend_style || 'entities';
      const axisStyle = this._config.chart?.axis_style || 'all';
      const entityColorMap = getEntityColorMap(this._config);

      this._chart = createChart(canvas, chartData, {
        responsive: true,
        maintainAspectRatio: false,
        showLegend: legendStyle === 'compact',
        hideXAxis: axisStyle === 'y_only' || axisStyle === 'none',
        hideYAxis: axisStyle === 'x_only' || axisStyle === 'none',
        chartType: this._config.chart?.chart_type || 'line',
        lineType: this._config.chart?.line_type || 'normal',
        entityColorMap,
      });
    } catch (error) {
      console.error('Failed to fetch history:', error);
      this._error = `Failed to load history data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      this._loading = false;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('area-energy-card-editor');
  }

  static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    // Get all area IDs and their friendly names
    const areas = Object.entries(hass.areas);

    // Find the first area that has both energy and power entities
    const matchingArea = areas.find(([areaId, area]) => {
      // Get all entities in this area
      const areaEntities = Object.entries(hass.entities).filter(
        ([entityId, entity]) => {
          const device = getDevice(hass.devices, entity.device_id);

          return [entity.area_id, device?.area_id].includes(areaId);
        },
      );

      // Check if area has a power entity
      const hasPower = areaEntities.some(
        ([entityId]) =>
          hass.states[entityId]?.attributes.device_class === 'power' &&
          hass.states[entityId]?.attributes.unit_of_measurement === 'W',
      );

      // Check if area has an energy entity
      const hasEnergy = areaEntities.some(
        ([entityId]) =>
          hass.states[entityId]?.attributes.device_class === 'energy' &&
          hass.states[entityId]?.attributes.unit_of_measurement === 'kWh',
      );

      // Return true if both entity types exist
      return hasPower && hasEnergy;
    });

    // Return the matching area ID or empty string if none found
    return {
      area: matchingArea ? matchingArea[0] : '',
    };
  }
}
