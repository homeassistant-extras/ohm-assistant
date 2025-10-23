export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: HassEntityAttributes;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HassEntityAttributes {
  friendly_name?: string;
  unit_of_measurement?: string;
  device_class?: string;
  state_class?: string;
  last_reset?: string;
  [key: string]: any;
}

export interface HassEntities {
  [entity_id: string]: HassEntity;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  platform: string;
  device_id?: string;
  area_id?: string;
  labels?: string[];
  hidden?: boolean;
  disabled_by?: string;
}

export interface DeviceRegistryEntry {
  id: string;
  name: string;
  area_id?: string;
  model?: string;
  manufacturer?: string;
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  picture?: string;
}

export interface Themes {
  darkMode: boolean;
  default_theme: string;
  theme: string;
  themes: { [key: string]: any };
}

export type LocalizeFunc<T extends string> = (key: T, ...args: any[]) => string;

export interface HomeAssistant {
  states: HassEntities;
  entities: { [entity_id: string]: EntityRegistryDisplayEntry };
  devices: { [device_id: string]: DeviceRegistryEntry };
  areas: { [area_id: string]: AreaRegistryEntry };
  themes: Themes;
  locale: {
    language: string;
    number_format: string;
  };
  config: {
    latitude: number;
    longitude: number;
    elevation: number;
    unit_system: {
      length: string;
      mass: string;
      temperature: string;
      volume: string;
    };
    time_zone: string;
  };
  localize: LocalizeFunc<string>;
  callWS<T>(msg: any): Promise<T>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, any>,
    target?: any,
  ): Promise<void>;
  formatEntityState(stateObj: HassEntity, state?: string): string;
  formatEntityAttributeValue(
    stateObj: HassEntity,
    attribute: string,
    value?: any,
  ): string;
}
