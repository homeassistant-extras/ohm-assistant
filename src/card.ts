import { fetchPowerEnergyData, type PowerEnergyData } from '@common/helpers';
import { hasFeature } from '@config/feature';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { Chart } from 'chart.js';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { getArea } from './delegates/retrievers/area';
import { getDevice } from './delegates/retrievers/device';
import { getZapped } from './delegates/utils/get-zapped';
import {
  createChart,
  destroyChart,
  type ChartData,
} from './html/chart-go-burr';
import { renderError } from './html/no-good';
import { renderLegend } from './html/watching-waiting';
import { styles } from './styles';
import { EntityState } from './types/entity';
const equal = require('fast-deep-equal');

/**
 * Shocking Energy & Power Card
 */
export class Shocking extends LitElement {
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
    const { powerEntities, energyEntities } = getZapped(hass, this._config);

    if (!equal(powerEntities, this._powerEntities)) {
      this._powerEntities = powerEntities;
    }
    if (!equal(energyEntities, this._energyEntities)) {
      this._energyEntities = energyEntities;
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
        ${!this._loading && this._currentData
          ? renderLegend(
              this._config,
              this._powerEntities,
              this._energyEntities,
            )
          : ''}
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
      <div>
        <h2 class="card-title">${areaName}</h2>
      </div>
    `;
  }

  override firstUpdated(): void {
    this._initChart();
  }

  private async _initChart(): Promise<void> {
    console.log('initChart');
    if (!this._hass) return;

    this._loading = true;
    this._error = undefined;

    try {
      // Fetch power and energy data
      const data = await fetchPowerEnergyData(
        this._hass,
        this._config,
        24,
        '5minute',
      );

      if (data.powerData.length === 0 && data.energyData.length === 0) {
        this._error = `No history data available for entities: ${this._config.entities?.join(', ') || ''}`;
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
      };

      this._chart = createChart(canvas, chartData, {
        responsive: true,
        maintainAspectRatio: false,
        showLegend: false,
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
    return document.createElement('shocking-card-editor');
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
