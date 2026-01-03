import { getDevice } from '@/delegates/retrievers/device';
import { EntityState } from '@/types/entity';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';

export interface HistoryDataPoint {
  timestamp: Date;
  value: number;
}

/**
 * Fetch aggregated statistics for an entity
 * This uses Home Assistant's statistics API which returns data aggregated into periods
 * @param hass Home Assistant instance
 * @param entityId Entity ID to fetch statistics for
 * @param startTime Start timestamp
 * @param endTime Optional end timestamp (defaults to now)
 * @param period Aggregation period: '5minute', 'hour', 'day', 'month' (default: '5minute')
 */
export async function fetchEntityStatistics(
  hass: HomeAssistant,
  entityId: string,
  startTime: Date | string,
  endTime?: Date | string,
  period: '5minute' | 'hour' | 'day' | 'month' = '5minute',
): Promise<HistoryDataPoint[]> {
  try {
    // Convert dates to ISO strings
    const start =
      typeof startTime === 'string' ? startTime : startTime.toISOString();
    const end = endTime
      ? typeof endTime === 'string'
        ? endTime
        : endTime.toISOString()
      : new Date().toISOString();

    // Use WebSocket API for statistics
    const statsData = await hass.callWS<
      Record<
        string,
        Array<{
          start: number;
          end: number;
          mean?: number;
          min?: number;
          max?: number;
          sum?: number;
          state?: number;
        }>
      >
    >({
      type: 'recorder/statistics_during_period',
      start_time: start,
      end_time: end,
      statistic_ids: [entityId],
      period: period,
    });

    // Extract statistics for the entity
    const entityStats = statsData[entityId];
    if (!entityStats || entityStats.length === 0) {
      console.warn(`No statistics data for ${entityId}`);
      return [];
    }

    const dataPoints: HistoryDataPoint[] = [];

    for (const stat of entityStats) {
      // Use mean if available, otherwise state, otherwise sum
      const value =
        stat.mean !== undefined
          ? stat.mean
          : stat.state !== undefined
            ? stat.state
            : stat.sum !== undefined
              ? stat.sum
              : null;

      if (value !== null && !isNaN(value)) {
        // The stat.start value can be in seconds or milliseconds depending on HA version
        // Check if it's already in milliseconds (> year 2000 in seconds = 946684800)
        const timestampMs =
          stat.start > 946684800000 ? stat.start : stat.start * 1000;
        dataPoints.push({
          timestamp: new Date(timestampMs),
          value,
        });
      }
    }

    return dataPoints;
  } catch (error) {
    console.error(`Failed to fetch statistics for ${entityId}:`, error);
    return [];
  }
}

/**
 * Fetch aggregated statistics for recent hours
 * @param hass Home Assistant instance
 * @param entityId Entity ID to fetch statistics for
 * @param hours Number of hours to fetch
 * @param period Aggregation period (default: '5minute')
 */
export async function fetchRecentStatistics(
  hass: HomeAssistant,
  entityId: string,
  hours: number,
  period: '5minute' | 'hour' | 'day' | 'month' = '5minute',
): Promise<HistoryDataPoint[]> {
  const now = new Date();
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return fetchEntityStatistics(hass, entityId, start, now, period);
}

export interface EntityData {
  entityId: string;
  friendlyName: string;
  data: HistoryDataPoint[];
}

export interface PowerEnergyData {
  powerData: EntityData[];
  energyData: EntityData[];
  untrackedPowerData?: EntityData;
}

/**
 * Fetch power and energy data for the given entities
 * @param hass Home Assistant instance
 * @param powerEntities Power entities to fetch
 * @param energyEntities Energy entities to fetch
 * @param hours Number of hours to fetch (default: 24)
 * @param period Aggregation period (default: '5minute')
 * @param totalPowerEntityId Optional total power entity ID for calculating untracked power
 * @returns Power and energy data with optional untracked power data
 */
export async function fetchPowerEnergyData(
  hass: HomeAssistant,
  powerEntities: EntityState[],
  energyEntities: EntityState[],
  hours: number = 24,
  period: '5minute' | 'hour' | 'day' | 'month' = '5minute',
  totalPowerEntityId?: string,
): Promise<PowerEnergyData> {
  // Fetch data for all power and energy entities
  const powerPromises = powerEntities.map((entity) =>
    fetchRecentStatistics(hass, entity.entity_id, hours, period),
  );
  const energyPromises = energyEntities.map((entity) =>
    fetchRecentStatistics(hass, entity.entity_id, hours, period),
  );

  // Fetch total power entity data if provided
  const totalPowerPromise = totalPowerEntityId
    ? fetchRecentStatistics(hass, totalPowerEntityId, hours, period)
    : Promise.resolve([]);

  const [powerResults, energyResults, totalPowerResult] = await Promise.all([
    Promise.all(powerPromises),
    Promise.all(energyPromises),
    totalPowerPromise,
  ]);

  const result: PowerEnergyData = {
    powerData: powerEntities.map((entity, index) => ({
      entityId: entity.entity_id,
      friendlyName: entity.attributes.friendly_name || entity.entity_id,
      data: powerResults[index] || [],
    })),
    energyData: energyEntities.map((entity, index) => ({
      entityId: entity.entity_id,
      friendlyName: entity.attributes.friendly_name || entity.entity_id,
      data: energyResults[index] || [],
    })),
  };

  // Calculate untracked power if total power entity is provided
  if (totalPowerEntityId && totalPowerResult.length > 0) {
    // Create a map of timestamps to tracked power sums
    const trackedPowerByTimestamp = new Map<number, number>();

    // Sum up all tracked power entities at each timestamp
    powerResults.forEach((entityData) => {
      entityData.forEach((point) => {
        const timestamp = point.timestamp.getTime();
        const current = trackedPowerByTimestamp.get(timestamp) || 0;
        trackedPowerByTimestamp.set(timestamp, current + point.value);
      });
    });

    // Calculate untracked power: total - tracked
    const untrackedData: HistoryDataPoint[] = totalPowerResult
      .map((totalPoint) => {
        const timestamp = totalPoint.timestamp.getTime();
        const trackedSum = trackedPowerByTimestamp.get(timestamp) || 0;
        const untrackedValue = Math.max(0, totalPoint.value - trackedSum);

        return {
          timestamp: totalPoint.timestamp,
          value: untrackedValue,
        };
      })
      .filter((point) => point.value > 0); // Only include positive values

    if (untrackedData.length > 0) {
      const totalPowerEntity = hass.states?.[totalPowerEntityId];
      const friendlyName =
        totalPowerEntity?.attributes?.friendly_name || totalPowerEntityId;
      result.untrackedPowerData = {
        entityId: totalPowerEntityId,
        friendlyName: `${friendlyName} (Untracked)`,
        data: untrackedData,
      };
    }
  }

  return result;
}

/**
 * Get all entity IDs that belong to a specific area
 * @param hass Home Assistant instance
 * @param areaId The area ID to filter entities by
 * @returns Array of entity IDs in the area
 */
export const getAreaEntities = (
  hass: HomeAssistant,
  areaId: string,
): string[] => {
  const entities = Object.values(hass.entities).filter((entity) => {
    const device = getDevice(hass.devices, entity.device_id);
    const isInArea = [entity.area_id, device?.area_id].includes(areaId);
    return isInArea;
  });

  return entities.map((e) => e.entity_id);
};

/**
 * Extracts entity IDs from config, handling both string and object formats
 * @param config Configuration object
 * @returns Array of entity IDs
 */
export function getEntityIds(config: Config): string[] {
  if (!config.entities) {
    return [];
  }
  return config.entities.map((entity) =>
    typeof entity === 'string' ? entity : entity.entity_id,
  );
}

/**
 * Creates a map of entity_id → color from config
 * @param config Configuration object
 * @returns Record mapping entity IDs to their custom colors
 */
export function getEntityColorMap(config: Config): Record<string, string> {
  if (!config.entities) {
    return {};
  }
  const colorMap: Record<string, string> = {};
  config.entities.forEach((entity) => {
    if (typeof entity === 'object' && entity.color) {
      colorMap[entity.entity_id] = entity.color;
    }
  });
  return colorMap;
}
