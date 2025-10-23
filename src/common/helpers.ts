import type { HomeAssistant, HassEntity } from '@hass/types';

export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...options,
  }).format(value);
};

export const getEntityState = (
  hass: HomeAssistant,
  entityId: string,
): HassEntity | undefined => {
  return hass.states[entityId];
};

export const getEntityStateValue = (
  hass: HomeAssistant,
  entityId: string,
): number | undefined => {
  const state = getEntityState(hass, entityId);
  if (!state) return undefined;

  const value = parseFloat(state.state);
  return isNaN(value) ? undefined : value;
};

export const getEntityAttribute = (
  hass: HomeAssistant,
  entityId: string,
  attribute: string,
): any => {
  const state = getEntityState(hass, entityId);
  return state?.attributes[attribute];
};

export const formatPower = (watts: number, locale: string = 'en-US'): string => {
  if (watts >= 1000) {
    return `${formatNumber(watts / 1000, locale)} kW`;
  }
  return `${formatNumber(watts, locale)} W`;
};

export const formatEnergy = (kWh: number, locale: string = 'en-US'): string => {
  if (kWh >= 1000) {
    return `${formatNumber(kWh / 1000, locale)} MWh`;
  }
  return `${formatNumber(kWh, locale)} kWh`;
};

export const calculateCost = (
  kWh: number,
  costPerKWh: number,
  locale: string = 'en-US',
): string => {
  const cost = kWh * costPerKWh;
  return formatNumber(cost, locale, {
    style: 'currency',
    currency: 'USD',
  });
};
