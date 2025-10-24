export interface Config {
  /** Area to automatically find energy/power entities from */
  area: string;

  /** Name of the card */
  name?: string;

  /** Entities to include in the card */
  entities?: string[];

  /** Chart settings */
  chart?: ChartConfig;

  /** Features to enable or disable functionality */
  features?: Features[];
}

/** Chart configuration */
export interface ChartConfig {
  /** Legend style */
  legend_style?: LegendStyle;

  /** Axis style */
  axis_style?: AxisStyle;

  /** Line type for chart visualization */
  line_type?: LineType;
}

/** Legend style options */
export type LegendStyle = 'entities' | 'compact' | 'none';

/** Axis style options */
export type AxisStyle = 'all' | 'x_only' | 'y_only' | 'none';

/** Line type options */
export type LineType = 'normal' | 'gradient' | 'gradient_no_fill' | 'no_fill';

/** Features to enable or disable functionality */
export type Features = 'hide_name' | 'exclude_default_entities';
