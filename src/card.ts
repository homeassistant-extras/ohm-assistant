import { LitElement, html, type TemplateResult } from 'lit';
import { state, property } from 'lit/decorators.js';
import { styles } from './styles';
import type { ShockingCardConfig } from '@type/config';
import type { HomeAssistant } from '@hass/types';
import {
  getEntityStateValue,
  getEntityAttribute,
  formatPower,
  formatEnergy,
} from '@common/helpers';

export class ShockingCard extends LitElement {
  @state()
  private _config!: ShockingCardConfig;

  @state()
  private _hass!: HomeAssistant;

  @property({ type: Boolean, reflect: true, attribute: 'dark-mode' })
  darkMode: boolean = false;

  static override get styles() {
    return styles;
  }

  setConfig(config: ShockingCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    this._config = {
      show_name: true,
      show_state: true,
      name: 'Electricity Usage',
      ...config,
    };
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.darkMode = hass.themes?.darkMode || false;
  }

  get hass(): HomeAssistant {
    return this._hass;
  }

  override render(): TemplateResult {
    if (!this._config || !this._hass) {
      return html``;
    }

    const { power_entity, energy_entity } = this._config;

    if (!power_entity && !energy_entity) {
      return this._renderError('No entities configured');
    }

    return html`
      <div class="card-content">
        ${this._config.show_name ? this._renderHeader() : ''}
        <div class="metrics-container">
          ${power_entity ? this._renderPowerMetric(power_entity) : ''}
          ${energy_entity ? this._renderEnergyMetric(energy_entity) : ''}
        </div>
        ${this._renderStatusBar()}
      </div>
    `;
  }

  private _renderHeader(): TemplateResult {
    return html`
      <div class="card-header">
        <h2 class="card-title">${this._config.name || 'Electricity Usage'}</h2>
      </div>
    `;
  }

  private _renderPowerMetric(entityId: string): TemplateResult {
    const powerValue = getEntityStateValue(this._hass, entityId);
    const friendlyName =
      getEntityAttribute(this._hass, entityId, 'friendly_name') || 'Power';

    if (powerValue === undefined) {
      return html`
        <div class="metric-card">
          <div class="warning">Entity unavailable: ${entityId}</div>
        </div>
      `;
    }

    return html`
      <div class="metric-card">
        <div class="metric-icon power-icon">
          <svg class="icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M11.5,20L16.36,10.27H13V4L8,13.73H11.5V20M12,2C14.75,2 17.1,3 19.05,4.95C21,6.9 22,9.25 22,12C22,14.75 21,17.1 19.05,19.05C17.1,21 14.75,22 12,22C9.25,22 6.9,21 4.95,19.05C3,17.1 2,14.75 2,12C2,9.25 3,6.9 4.95,4.95C6.9,3 9.25,2 12,2Z"
            />
          </svg>
        </div>
        <div class="metric-label">Current Power</div>
        <div class="metric-value">
          ${this._formatMetricValue(powerValue)}
          <span class="metric-unit">W</span>
        </div>
      </div>
    `;
  }

  private _renderEnergyMetric(entityId: string): TemplateResult {
    const energyValue = getEntityStateValue(this._hass, entityId);
    const friendlyName =
      getEntityAttribute(this._hass, entityId, 'friendly_name') || 'Energy';

    if (energyValue === undefined) {
      return html`
        <div class="metric-card">
          <div class="warning">Entity unavailable: ${entityId}</div>
        </div>
      `;
    }

    return html`
      <div class="metric-card">
        <div class="metric-icon energy-icon">
          <svg class="icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M3,14L3.5,14.07L8.07,9.5C7.89,8.85 8.06,8.11 8.59,7.59C9.37,6.8 10.63,6.8 11.41,7.59C11.94,8.11 12.11,8.85 11.93,9.5L14.5,12.07L15,12C15.18,12 15.35,12 15.5,12.07L19.07,8.5C19,8.35 19,8.18 19,8C19,6.89 19.89,6 21,6C22.11,6 23,6.89 23,8C23,9.11 22.11,10 21,10C20.82,10 20.65,10 20.5,9.93L16.93,13.5C17,13.65 17,13.82 17,14C17,14.85 16.54,15.58 15.85,15.88L19.07,19.07C19.18,19.03 19.3,19 19.41,19C20.05,19 20.58,19.53 20.58,20.17C20.58,20.81 20.05,21.34 19.41,21.34C18.77,21.34 18.24,20.81 18.24,20.17C18.24,20.06 18.27,19.94 18.31,19.83L15.09,16.62C14.79,16.87 14.41,17 14,17C13.59,17 13.21,16.87 12.91,16.62L10.54,19C10.58,19.11 10.61,19.22 10.61,19.34C10.61,19.98 10.08,20.51 9.44,20.51C8.8,20.51 8.27,19.98 8.27,19.34C8.27,18.7 8.8,18.17 9.44,18.17C9.56,18.17 9.67,18.2 9.78,18.24L12.15,15.87C11.57,15.27 11.57,14.3 12.15,13.7C12.47,13.38 12.89,13.23 13.32,13.23C13.75,13.23 14.17,13.38 14.5,13.7C14.82,14 15,14.45 15,14.91C15,15.36 14.82,15.81 14.5,16.13L15,16.62C15.27,16.5 15.61,16.5 15.88,16.62L19.07,13.44C19,13.29 19,13.15 19,13C19,12.15 19.46,11.42 20.15,11.12L16.93,7.93C16.82,7.97 16.7,8 16.59,8C15.95,8 15.42,7.47 15.42,6.83C15.42,6.19 15.95,5.66 16.59,5.66C17.23,5.66 17.76,6.19 17.76,6.83C17.76,6.94 17.73,7.06 17.69,7.17L20.91,10.38C21.21,10.13 21.59,10 22,10C23.11,10 24,10.89 24,12C24,13.11 23.11,14 22,14C20.89,14 20,13.11 20,12C20,11.82 20,11.65 20.07,11.5L16.5,7.93C16.35,8 16.18,8 16,8L12.43,11.57C12.5,11.72 12.5,11.86 12.5,12C12.5,12.27 12.42,12.5 12.27,12.73L14.73,15.19C14.94,15.08 15.2,15 15.5,15C16.33,15 17,15.67 17,16.5C17,17.33 16.33,18 15.5,18C14.67,18 14,17.33 14,16.5L11.5,14C11.18,14.18 10.82,14.18 10.5,14L7,17.5C7.03,17.65 7.04,17.8 7.04,18C7.04,18.88 6.29,19.63 5.41,19.63C4.53,19.63 3.78,18.88 3.78,18C3.78,17.12 4.53,16.37 5.41,16.37C5.61,16.37 5.8,16.4 5.96,16.46L9.5,12.93C9.18,12.43 9.18,11.75 9.5,11.25L5,6.75C4.81,6.92 4.59,7 4.34,7C3.6,7 3,6.4 3,5.66C3,4.92 3.6,4.32 4.34,4.32C5.08,4.32 5.68,4.92 5.68,5.66C5.68,5.91 5.59,6.13 5.43,6.32L9.93,10.82C10.43,10.5 11.11,10.5 11.61,10.82L15.18,7.25C15,6.91 15,6.5 15.18,6.16C15.5,5.45 16.41,5.16 17.12,5.5C17.83,5.82 18.12,6.73 17.78,7.44C17.62,7.78 17.3,8.03 16.94,8.16L20.16,11.38C20.39,11.15 20.68,11 21,11C21.55,11 22,11.45 22,12C22,12.55 21.55,13 21,13C20.45,13 20,12.55 20,12L16.43,8.43C16.29,8.61 16.08,8.73 15.85,8.79L12.27,12.37C12.42,12.68 12.42,13.04 12.27,13.35L14.64,15.72C14.95,15.57 15.3,15.5 15.68,15.5C16.78,15.5 17.68,16.4 17.68,17.5C17.68,18.6 16.78,19.5 15.68,19.5C14.58,19.5 13.68,18.6 13.68,17.5L11.31,15.13C11,15.28 10.64,15.28 10.33,15.13L7,18.46C7,18.64 7,18.82 6.93,19L10.15,22.22C10.64,21.73 11.43,21.73 11.92,22.22C12.41,22.71 12.41,23.5 11.92,23.99C11.43,24.48 10.64,24.48 10.15,23.99L7,20.84C6.82,20.91 6.64,20.91 6.46,20.84L3.31,23.99C2.82,24.48 2.03,24.48 1.54,23.99C1.05,23.5 1.05,22.71 1.54,22.22C2.03,21.73 2.82,21.73 3.31,22.22L6.46,19.07C6.39,18.89 6.39,18.71 6.46,18.53L3,15.07C2.65,15.18 2.27,15.18 1.92,15.07C1.21,14.75 0.92,13.84 1.26,13.13C1.6,12.42 2.51,12.13 3.22,12.47C3.56,12.63 3.81,12.95 3.94,13.31L7.4,9.85C7.18,9.36 7.18,8.78 7.4,8.29L3,3.89V14Z"
            />
          </svg>
        </div>
        <div class="metric-label">Energy Today</div>
        <div class="metric-value">
          ${this._formatMetricValue(energyValue)}
          <span class="metric-unit">kWh</span>
        </div>
      </div>
    `;
  }

  private _renderStatusBar(): TemplateResult {
    const now = new Date();
    const timeString = now.toLocaleTimeString(this._hass.locale?.language || 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return html`
      <div class="status-bar">
        <span class="status-text">Live data</span>
        <span class="last-updated">Updated at ${timeString}</span>
      </div>
    `;
  }

  private _renderError(message: string): TemplateResult {
    return html` <div class="card-content">
      <div class="error">${message}</div>
    </div>`;
  }

  private _formatMetricValue(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(2);
    }
    return value.toFixed(1);
  }

  static getConfigElement() {
    return document.createElement('shocking-card-editor');
  }

  static async getStubConfig(hass: HomeAssistant): Promise<ShockingCardConfig> {
    // Find power and energy entities automatically
    const entities = Object.keys(hass.states);

    const powerEntity = entities.find(
      (e) =>
        hass.states[e].attributes.device_class === 'power' &&
        hass.states[e].attributes.unit_of_measurement === 'W',
    );

    const energyEntity = entities.find(
      (e) =>
        hass.states[e].attributes.device_class === 'energy' &&
        hass.states[e].attributes.unit_of_measurement === 'kWh',
    );

    return {
      type: 'custom:shocking-card',
      power_entity: powerEntity,
      energy_entity: energyEntity,
      name: 'Electricity Usage',
      show_name: true,
      show_state: true,
    };
  }

  getCardSize(): number {
    return 3;
  }
}
