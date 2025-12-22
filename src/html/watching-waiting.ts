import { EntityState } from '@/types/entity';
import { getEntityColor } from '@common/colors';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './state-display';

/**
 * Renders the legend for the energy and power chart
 * @param hass - The Home Assistant instance
 * @param config - The configuration
 * @param powerEntities - The power entities
 * @param energyEntities - The energy entities
 * @param entityColorMap - Map of entity_id → color for custom colors
 * @returns HTML template for the legend or nothing if hidden
 */
export function renderLegend(
  hass: HomeAssistant,
  config: Config,
  powerEntities: EntityState[],
  energyEntities: EntityState[],
  entityColorMap: Record<string, string> = {},
): TemplateResult | typeof nothing {
  if (!((config.chart?.legend_style || 'entities') === 'entities')) {
    return nothing;
  }

  return html`
    <div class="legend-container">
      ${powerEntities.map(
        (entity, index) => html`
          <div class="legend-item">
            <div>
              <span
                class="legend-color"
                style="background: ${getEntityColor(
                  entity.entity_id,
                  index,
                  'power',
                  powerEntities.length,
                  entityColorMap,
                )}"
              ></span>
              <span class="legend-label"
                >${entity.attributes.friendly_name || entity.entity_id}
                (W)</span
              >
            </div>
            ${stateDisplay(hass, entity)}
          </div>
        `,
      )}
      ${energyEntities.map(
        (entity, index) => html`
          <div class="legend-item">
            <div>
              <span
                class="legend-color"
                style="background: ${getEntityColor(
                  entity.entity_id,
                  index,
                  'energy',
                  energyEntities.length,
                  entityColorMap,
                )}"
              ></span>
              <span class="legend-label"
                >${entity.attributes.friendly_name || entity.entity_id}
                (kWh)</span
              >
            </div>
            ${stateDisplay(hass, entity)}
          </div>
        `,
      )}
    </div>
  `;
}
