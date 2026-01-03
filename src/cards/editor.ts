import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { fireEvent } from '../hass/common/dom/fire_event';
import { HaFormSchema } from '../hass/components/ha-form/types';

export class AreaEnergyEditor extends LitElement {
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

    const schema = this._getSchema();

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

  private _getSchema(): HaFormSchema[] {
    return [
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
        type: 'expandable' as const,
        flatten: true,
        icon: 'mdi:devices',
        schema: [
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
            name: 'chart.total_power_entity',
            label: 'Total Power Entity (for untracked power)',
            required: false,
            selector: {
              entity: {
                filter: {
                  device_class: 'power',
                },
              },
            },
          },
        ],
      },
      {
        name: 'chart',
        label: 'Chart',
        type: 'expandable' as const,
        icon: 'mdi:chart-line',
        schema: [
          {
            name: 'chart_type',
            label: 'Chart Type',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  {
                    label: 'Line (Default)',
                    value: 'line',
                  },
                  {
                    label: 'Stacked Bar',
                    value: 'stacked_bar',
                  },
                ],
              },
            },
          },
          {
            name: 'line_type',
            label: 'Line Type',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  {
                    label: 'Normal (Default)',
                    value: 'normal',
                  },
                  {
                    label: 'Gradient',
                    value: 'gradient',
                  },
                  {
                    label: 'Gradient No Fill',
                    value: 'gradient_no_fill',
                  },
                  {
                    label: 'No Fill',
                    value: 'no_fill',
                  },
                ],
              },
            },
          },
          {
            name: 'legend_style',
            label: 'Legend Style',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  {
                    label: 'Entities (Default)',
                    value: 'entities',
                  },
                  {
                    label: 'Compact',
                    value: 'compact',
                  },
                  {
                    label: 'None',
                    value: 'none',
                  },
                ],
              },
            },
          },
          {
            name: 'axis_style',
            label: 'Axis Style',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  {
                    label: 'All (Default)',
                    value: 'all',
                  },
                  {
                    label: 'X Only',
                    value: 'x_only',
                  },
                  {
                    label: 'Y Only',
                    value: 'y_only',
                  },
                  {
                    label: 'None',
                    value: 'none',
                  },
                ],
              },
            },
          },
        ],
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
                    label: 'Hide Name',
                    value: 'hide_name',
                  },
                  {
                    label: 'Exclude Default Entities',
                    value: 'exclude_default_entities',
                  },
                ],
              },
            },
          },
        ],
      },
    ];
  }

  private _computeLabel = (schema: HaFormSchema): string => {
    return schema.label || schema.name;
  };

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value as Config;
    // @ts-ignore
    fireEvent(this, 'config-changed', { config });
  }
}
