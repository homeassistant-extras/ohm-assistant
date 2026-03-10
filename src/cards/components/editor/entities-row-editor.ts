import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { EntityConfig } from '@type/config';
import {
  css,
  html,
  LitElement,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

declare global {
  interface HASSDomEvents {
    'value-changed': {
      value: (EntityConfig | string)[];
    };
    'edit-detail-element': {
      subElementConfig: {
        index: number;
        type: 'entity';
        elementConfig: EntityConfig | string;
        field: 'entities';
      };
    };
  }
}

type EntityRowItem = EntityConfig | string;

export class OhmAssistantEntitiesRowEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public entities?: EntityRowItem[];

  @property() public label?: string;

  @property({ attribute: false }) public availableEntities?: string[];

  private _getKey(item: EntityRowItem, index: number): string {
    const entityId = this._getEntityId(item);
    return `${entityId}-${index}`;
  }

  private _getEntityId(item: EntityRowItem): string {
    if (typeof item === 'string') {
      return item;
    }
    return item.entity_id;
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass) {
      return nothing;
    }

    const items = this.entities || [];

    return html`
      <label>
        ${this.label ||
        `${this.hass.localize(
          'ui.panel.lovelace.editor.card.generic.entities',
        )} (${this.hass.localize(
          'ui.panel.lovelace.editor.card.config.optional',
        )})`}
      </label>
      <ha-sortable handle-selector=".handle" @item-moved=${this._rowMoved}>
        <div class="entities">
          ${repeat(
            items,
            (item, index) => this._getKey(item, index),
            (item, index) => html`
              <div class="entity">
                <div class="handle">
                  <ha-icon icon="mdi:drag"></ha-icon>
                </div>
                <ha-entity-picker
                  allow-custom-entity
                  hide-clear-icon
                  .hass=${this.hass}
                  .value=${this._getEntityId(item)}
                  .index=${index}
                  .includeEntities=${this.availableEntities}
                  @value-changed=${this._valueChanged}
                ></ha-entity-picker>
                <ha-icon-button
                  .label=${this.hass!.localize(
                    'ui.components.entity.entity-picker.clear',
                  )}
                  class="remove-icon"
                  .index=${index}
                  @click=${this._removeRow}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </ha-icon-button>
                <ha-icon-button
                  .label=${this.hass!.localize(
                    'ui.components.entity.entity-picker.edit',
                  )}
                  class="edit-icon"
                  .index=${index}
                  @click=${this._editRow}
                >
                  <ha-icon icon="mdi:pencil"></ha-icon>
                </ha-icon-button>
              </div>
            `,
          )}
        </div>
      </ha-sortable>
      <ha-entity-picker
        class="add-entity"
        .hass=${this.hass}
        .includeEntities=${this.availableEntities}
        @value-changed=${this._addEntity}
      ></ha-entity-picker>
    `;
  }

  private async _addEntity(ev: CustomEvent): Promise<void> {
    ev.stopPropagation();
    const value = ev.detail.value;
    if (value === '') {
      return;
    }

    const newConfigEntities = [...(this.entities || []), value];
    (ev.target as any).value = '';
    fireEvent(this, 'value-changed', { value: newConfigEntities });
  }

  private _removeRow(ev: CustomEvent): void {
    const index = (ev.currentTarget as any).index;

    const newConfigEntities = (this.entities || []).concat();
    newConfigEntities.splice(index, 1);
    fireEvent(this, 'value-changed', { value: newConfigEntities });
  }

  private _updateItemInArray(
    array: EntityRowItem[],
    index: number,
    value: string,
  ): EntityRowItem[] {
    const newArray = array.concat();
    if (value === '' || value === undefined) {
      newArray.splice(index, 1);
    } else {
      const currentItem = newArray[index];
      if (typeof currentItem === 'string') {
        newArray[index] = value;
      } else {
        newArray[index] = {
          ...currentItem,
          entity_id: value,
        };
      }
    }
    return newArray;
  }

  private _valueChanged(ev: CustomEvent): void {
    const value = ev.detail.value;
    const index = (ev.target as any).index;

    const newConfigEntities = this._updateItemInArray(
      this.entities || [],
      index,
      value,
    );
    fireEvent(this, 'value-changed', { value: newConfigEntities });
  }

  private _editRow(ev: CustomEvent): void {
    const index = (ev.currentTarget as any).index;
    const items = this.entities || [];
    const elementConfig = items[index] as EntityConfig | string;

    fireEvent(this, 'edit-detail-element', {
      subElementConfig: {
        index,
        type: 'entity',
        elementConfig,
        field: 'entities',
      },
    });
  }

  private _rowMoved(ev: CustomEvent): void {
    ev.stopPropagation();
    const { oldIndex, newIndex } = ev.detail;

    const items = this.entities || [];
    const newItems = items.concat();

    const [movedItem] = newItems.splice(oldIndex, 1);
    if (movedItem !== undefined) {
      newItems.splice(newIndex, 0, movedItem);
      fireEvent(this, 'value-changed', { value: newItems });
    }
  }

  static override readonly styles: CSSResult = css`
    ha-entity-picker {
      margin-top: 8px;
    }
    .add-entity {
      display: block;
      margin-left: 31px;
      margin-right: 71px;
      margin-inline-start: 31px;
      margin-inline-end: 71px;
      direction: var(--direction);
      padding-bottom: 20px;
    }
    .entities {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .entity {
      display: flex;
      align-items: center;
    }

    .entity .handle {
      padding-right: 8px;
      cursor: move;
      cursor: grab;
      padding-inline-end: 8px;
      padding-inline-start: initial;
      direction: var(--direction);
    }
    .entity .handle > * {
      pointer-events: none;
    }

    .entity ha-entity-picker {
      flex-grow: 1;
      min-width: 0;
    }

    .remove-icon,
    .edit-icon {
      --mdc-icon-button-size: 36px;
      color: var(--secondary-text-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ohm-assistant-entities-row-editor': OhmAssistantEntitiesRowEditor;
  }
}
