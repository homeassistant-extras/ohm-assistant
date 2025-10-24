import { hasFeature } from '@/config/feature';
import { EntityState } from '@/types/entity';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { getDevice } from '../retrievers/device';
import { getState } from '../retrievers/state';

interface ZappedResult {
  powerEntities: EntityState[];
  energyEntities: EntityState[];
}

export const getZapped = (
  hass: HomeAssistant,
  config: Config,
): ZappedResult => {
  const skipDefaultEntities = hasFeature(config, 'exclude_default_entities');

  // Separate entities by device class
  const powerEntities: EntityState[] = [];
  const energyEntities: EntityState[] = [];

  // Process all entities in the area
  Object.values(hass.entities).forEach((entity) => {
    // Check if this entity is explicitly configured
    const isConfigEntity = config.entities?.includes(entity.entity_id);

    const device = getDevice(hass.devices, entity.device_id);
    const isInArea = [entity.area_id, device?.area_id].includes(config.area);

    // If it's not a config entity, not in the area skip it
    // If it's a config entity, always include it since the user has explicitly included it
    if (!isConfigEntity && !isInArea) return;

    const state = getState(hass.states, entity.entity_id);
    if (!state) return;

    if (isConfigEntity && state.attributes.device_class === 'power') {
      powerEntities.push(state);
      return;
    } else if (isConfigEntity && state.attributes.device_class === 'energy') {
      energyEntities.push(state);
      return;
    }

    // If we're skipping default entities, don't process further
    if (skipDefaultEntities) return;

    if (state.attributes.device_class === 'power') {
      powerEntities.push(state);
    } else if (state.attributes.device_class === 'energy') {
      energyEntities.push(state);
    }
  });

  return {
    powerEntities,
    energyEntities,
  };
};
