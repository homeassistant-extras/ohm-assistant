import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { fireEvent } from './hass/common/dom/fire_event';
import { HaFormSchema } from './hass/components/ha-form/types';

export class ShockingEditor extends LitElement {
  @state()
  private _config!: Config;

  @state()
  private _hass!: HomeAssistant;

  setConfig(config: Config): void {
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
        name: 'area',
        label: 'Area',
        required: true,
        selector: { area: {} },
      },
      {
        name: 'content',
        label: 'Content',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:text-short',
        schema: [
          {
            name: 'name',
            label: 'Card Name',
            selector: { text: {} },
          },
        ],
      },

      {
        name: 'entities',
        label: 'Entities',
        required: true,
        selector: {
          entity: {
            multiple: true,
            filter: {
              device_class: ['power', 'energy'],
            },
          },
        },
      },
      {
        name: 'features',
        label: 'Features',
        type: 'expandable' as const,
        flatten: true,
        icon: 'mdi:list-box',
        schema: [
          {
            name: 'features',
            label: 'Features',
            required: false,
            selector: {
              select: {
                multiple: true,
                mode: 'list' as const,
                options: [
                  {
                    label: 'Hide Legend',
                    value: 'hide_legend',
                  },
                  {
                    label: 'Hide Name',
                    value: 'hide_name',
                  },
                ],
              },
            },
          },
        ],
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
    const config = ev.detail.value as Config;
    fireEvent(this, 'config-changed', { config });
  }
}
