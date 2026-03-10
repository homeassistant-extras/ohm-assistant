import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { EntityConfig } from '@type/config';
import type { CSSResult, TemplateResult } from 'lit';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export interface SubElementEditorConfig {
  index?: number;
  elementConfig?: EntityConfig | string;
  field: 'entities';
  type: 'entity';
}

declare global {
  interface HASSDomEvents {
    'go-back': undefined;
  }
}

export class OhmAssistantSubElementEditor extends LitElement {
  public hass!: HomeAssistant;

  @property({ attribute: false }) public config!: SubElementEditorConfig;

  protected override render(): TemplateResult {
    return html`
      <div class="header">
        <div class="back-title">
          <ha-icon-button-prev
            .label=${this.hass.localize('ui.common.back')}
            @click=${this._goBack}
          ></ha-icon-button-prev>
          <span slot="title">
            ${this.hass.localize(
              'ui.panel.lovelace.editor.sub-element-editor.types.row',
            )}
          </span>
        </div>
      </div>
      <div class="editor">
        <ohm-assistant-entity-detail-editor
          .hass=${this.hass}
          .value=${this.config.elementConfig}
          @config-changed=${this._handleConfigChanged}
        ></ohm-assistant-entity-detail-editor>
      </div>
    `;
  }

  private _handleConfigChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = ev.detail.config;
    // @ts-ignore
    fireEvent(this, 'config-changed', { config: value });
  }

  private _goBack(): void {
    fireEvent(this, 'go-back');
  }

  static override readonly styles: CSSResult = css`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--divider-color);
    }

    .back-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .editor {
      padding: 16px;
    }

    ha-icon-button-prev {
      color: var(--primary-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ohm-assistant-sub-element-editor': OhmAssistantSubElementEditor;
  }
}
