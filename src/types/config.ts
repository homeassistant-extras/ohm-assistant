export interface ShockingCardConfig {
  type: string;
  power_entity?: string;
  energy_entity?: string;
  name?: string;
  show_name?: boolean;
  show_state?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}
