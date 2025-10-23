export interface Config {
  /** Area to automatically find energy/power entities from */
  area: string;
  entities?: string[];
  name?: string;

  /** Features to enable or disable functionality */
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features = 'hide_legend' | 'hide_name';
