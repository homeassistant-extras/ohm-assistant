import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { EntityConfig } from '@type/config';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export class OhmAssistantEntityDetailEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityConfig;

  public setConfig(config: EntityConfig | string): void {
    if (typeof config === 'string') {
      this._config = { entity_id: config };
    } else {
      this._config = { ...config };
    }
  }

  @property({ attribute: false })
  public set value(value: EntityConfig | string | undefined) {
    if (!value) {
      this._config = undefined;
      return;
    }
    this.setConfig(value);
  }

  public get value(): EntityConfig | undefined {
    return this._config;
  }

  private readonly _schema = (): HaFormSchema[] => [
    {
      name: 'entity_id',
      required: true,
      label:
        this.hass?.localize('ui.panel.lovelace.editor.card.generic.entity') ||
        'Entity',
      selector: {
        entity: {
          filter: {
            device_class: ['power', 'energy'],
          },
        },
      },
    },
    {
      name: 'name',
      label:
        this.hass?.localize('ui.panel.lovelace.editor.card.generic.name') ||
        'Name',
      required: false,
      selector: { text: {} },
    },
    {
      name: 'color',
      label:
        this.hass?.localize('ui.panel.lovelace.editor.card.generic.color') ||
        'Color',
      required: false,
      selector: { ui_color: {} },
    },
  ];

  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema()}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private readonly _computeLabel = (schema: HaFormSchema): string => {
    return schema.label || schema.name || '';
  };

  private _valueChanged(ev: CustomEvent): void {
    const value = ev.detail.value as EntityConfig;
    // @ts-ignore
    fireEvent(this, 'config-changed', { config: value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ohm-assistant-entity-detail-editor': OhmAssistantEntityDetailEditor;
  }
}
