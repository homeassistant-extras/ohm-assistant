import type { EntityState } from '@/types/entity';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { Config } from '@type/config';
import memoizeOne from 'memoize-one';

/**
 * Retrieves the state of an entity
 *
 * @param states - The states registry
 * @param entityId - The ID of the entity
 * @param config - Optional config for custom entity names
 * @returns The entity's state or undefined
 */
export const getState = memoizeOne(
  (
    states: Record<string, any>,
    entityId: string,
    config?: Config,
  ): EntityState | undefined => {
    if (!entityId) return undefined;

    const state = states[entityId];
    if (!state) return undefined;

    const domain = computeDomain(state.entity_id);
    let attributes = state.attributes;

    // Apply custom name from config when entity has one defined
    if (config?.entities) {
      const entityConfig = config.entities.find(
        (e) => typeof e === 'object' && e.entity_id === entityId && e.name,
      );
      if (entityConfig && typeof entityConfig === 'object') {
        attributes = { ...attributes, friendly_name: entityConfig.name };
      }
    }

    return {
      state: state.state,
      attributes,
      entity_id: state.entity_id,
      domain,
    };
  },
);
