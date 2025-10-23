import { EntityState } from '@/types/entity';
import { hasFeature } from '@config/feature';
import type { Config } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * Renders the legend for the energy and power chart
 * @param config - The configuration
 * @param powerEntities - The power entities
 * @param energyEntities - The energy entities
 * @returns HTML template for the legend or nothing if hidden
 */
export function renderLegend(
  config: Config,
  powerEntities: EntityState[],
  energyEntities: EntityState[],
): TemplateResult | typeof nothing {
  if (hasFeature(config, 'hide_legend')) {
    return nothing;
  }

  return html`
    <div class="legend-container">
      ${powerEntities.length > 0
        ? html`
            <div class="legend-item">
              <span
                class="legend-color"
                style="background: rgba(59, 130, 246, 0.8)"
              ></span>
              <span class="legend-label"
                >${powerEntities[0].attributes.friendly_name ||
                powerEntities[0].entity_id}
                (W)</span
              >
            </div>
          `
        : ''}
      ${energyEntities.length > 0
        ? html`
            <div class="legend-item">
              <span
                class="legend-color"
                style="background: rgba(16, 185, 129, 0.8)"
              ></span>
              <span class="legend-label"
                >${energyEntities[0].attributes.friendly_name ||
                energyEntities[0].entity_id}
                (kWh)</span
              >
            </div>
          `
        : ''}
    </div>
  `;
}
