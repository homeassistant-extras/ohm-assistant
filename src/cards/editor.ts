import type { SubElementEditorConfig } from '@cards/components/editor/sub-element-editor';
import { getAreaPowerEnergyEntities } from '@common/helpers';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityConfig } from '@type/config';
import { LitElement, html, nothing, css, type CSSResult, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { fireEvent } from '../hass/common/dom/fire_event';
import type { HaFormSchema } from '../hass/components/ha-form/types';

export class AreaEnergyEditor extends LitElement {
  static override readonly styles: CSSResult = css`
    .entities-tab {
      padding: 16px 0;
      gap: 16px;
      display: flex;
      flex-direction: column;
    }

    .entities-tab ha-form {
      padding: 16px 0;
    }
  `;
  @state()
  private _config!: Config;

  @state()
  private _hass!: HomeAssistant;

  @state()
  private _subElementEditorConfig?: SubElementEditorConfig;

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

    if (this._subElementEditorConfig) {
      return html`
        <ohm-assistant-sub-element-editor
          .hass=${this._hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        ></ohm-assistant-sub-element-editor>
      `;
    }

    const availableEntities =
      this._config.area && this._hass.entities
        ? getAreaPowerEnergyEntities(this._hass, this._config.area)
        : undefined;

    return html`
      <div class="entities-tab">
        <ha-form
          .hass=${this._hass}
          .data=${this._config}
          .schema=${this._getAreaSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <ohm-assistant-entities-row-editor
          .hass=${this._hass}
          .entities=${this._config.entities}
          .availableEntities=${availableEntities}
          label=${this._hass.localize(
            'ui.panel.lovelace.editor.card.generic.entities',
          ) || 'Entities'}
          @value-changed=${this._entitiesRowChanged}
          @edit-detail-element=${this._editDetailElement}
        ></ohm-assistant-entities-row-editor>
        <ha-form
          .hass=${this._hass}
          .data=${this._config}
          .schema=${this._getRestSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }

  private _getAreaSchema(): HaFormSchema[] {
    return [
      {
        name: 'area',
        label: 'Area',
        required: true,
        selector: { area: {} },
      },
    ];
  }

  private _getRestSchema(): HaFormSchema[] {
    return [
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
        name: 'chart',
        label: 'Chart',
        type: 'expandable' as const,
        icon: 'mdi:chart-line',
        schema: [
          {
            name: 'total_power_entity',
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
                  {
                    label: 'Stacked Line',
                    value: 'stacked_line',
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

  private readonly _computeLabel = (schema: HaFormSchema): string => {
    return schema.label || schema.name;
  };

  private _valueChanged(ev: CustomEvent): void {
    const formValue = ev.detail.value as Partial<Config>;
    const config: Config = { ...this._config, ...formValue };
    if (this._config.entities !== undefined) {
      config.entities = this._config.entities;
    }
    this._config = config;
    // @ts-ignore
    fireEvent(this, 'config-changed', { config });
  }

  private _entitiesRowChanged(ev: CustomEvent): void {
    const value = ev.detail.value;
    if (!Array.isArray(value)) {
      return;
    }
    this._config = { ...this._config, entities: value };
    // @ts-ignore
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _editDetailElement(ev: CustomEvent): void {
    this._subElementEditorConfig = { ...ev.detail.subElementConfig };
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this._subElementEditorConfig) {
      return;
    }

    const value = ev.detail.config as EntityConfig | string;
    const index = this._subElementEditorConfig.index!;
    const newEntities = (this._config.entities || []).concat();

    if (value) {
      newEntities[index] = value;
      this._subElementEditorConfig = {
        ...this._subElementEditorConfig,
        elementConfig: value,
      };
    } else {
      newEntities.splice(index, 1);
      this._subElementEditorConfig = undefined;
    }

    this._config = { ...this._config, entities: newEntities };

    if (!value) {
      this._goBack();
    }

    // @ts-ignore
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }
}
