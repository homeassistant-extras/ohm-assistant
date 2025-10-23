import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { fireEvent } from '@common/fire-event';
import type { ShockingCardConfig } from '@type/config';
import type { HomeAssistant } from '@hass/types';

interface HaFormSchema {
  name: string;
  label?: string;
  required?: boolean;
  selector: any;
}

export class ShockingCardEditor extends LitElement {
  @state()
  private _config!: ShockingCardConfig;

  @state()
  private _hass!: HomeAssistant;

  setConfig(config: ShockingCardConfig): void {
    this._config = config;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
  }

  get hass(): HomeAssistant {
    return this._hass;
  }

  override render(): TemplateResult | typeof nothing {
    if (!this._hass || !this._config) {
      return nothing;
    }

    const schema: HaFormSchema[] = [
      {
        name: 'name',
        label: 'Card Name',
        selector: { text: {} },
      },
      {
        name: 'power_entity',
        label: 'Power Entity (W)',
        required: false,
        selector: {
          entity: {
            filter: {
              device_class: 'power',
            },
          },
        },
      },
      {
        name: 'energy_entity',
        label: 'Energy Entity (kWh)',
        required: false,
        selector: {
          entity: {
            filter: {
              device_class: 'energy',
            },
          },
        },
      },
      {
        name: 'show_name',
        label: 'Show Card Name',
        selector: { boolean: {} },
      },
      {
        name: 'show_state',
        label: 'Show State',
        selector: { boolean: {} },
      },
    ];

    return html`
      <ha-form
        .hass=${this._hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _computeLabel = (schema: HaFormSchema): string => {
    return schema.label || schema.name;
  };

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value as ShockingCardConfig;
    fireEvent(this, 'config-changed', { config });
  }
}
