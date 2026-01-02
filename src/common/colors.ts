const homeAssistantColors = new Set([
  'primary',
  'accent',
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'light-grey',
  'grey',
  'dark-grey',
  'blue-grey',
  'black',
  'white',
  'disabled',
]);

/**
 * Processes Home Assistant color - if color is a Home Assistant color name,
 * returns the CSS variable, otherwise returns the raw color
 * @param color - The color to process
 * @returns CSS color string (either var(--color-color) or the raw color)
 */
function processHomeAssistantColor(color: string): string {
  if (homeAssistantColors.has(color)) {
    return `var(--${color}-color)`;
  }
  return color;
}

/**
 * Resolves CSS variables to actual color values
 * This is needed for Chart.js which doesn't support CSS variables
 * @param color - The color string (may contain CSS variables)
 * @returns The resolved color value
 */
export function resolveColor(color: string): string {
  // If it's not a CSS variable, return as-is
  if (!color.startsWith('var(--')) {
    return color;
  }

  // Fallback for non-browser environments
  if (
    typeof document === 'undefined' ||
    typeof getComputedStyle === 'undefined'
  ) {
    return color;
  }

  // Extract the CSS variable name (e.g., "var(--primary-color)" -> "--primary-color")
  const varName = color.slice(4, -1); // Remove "var(" and ")"
  const style = getComputedStyle(document.body);
  const resolvedColor = style.getPropertyValue(varName).trim();
  // Return original color if variable is empty or doesn't exist (getPropertyValue returns empty string)
  return resolvedColor || color;
}

/**
 * Generates colors for multiple entities of the same type
 * @param entityId - The entity ID to get color for
 * @param index - The index of the entity
 * @param type - The type of entity ('power' or 'energy')
 * @param total - Total number of entities of this type
 * @param colorMap - Optional map of entity_id → color for custom colors
 * @returns CSS color string
 */
export function getEntityColor(
  entityId: string,
  index: number,
  type: 'power' | 'energy',
  total: number,
  colorMap?: Record<string, string>,
): string {
  // Check for custom color first
  if (colorMap?.[entityId]) {
    return processHomeAssistantColor(colorMap[entityId]);
  }
  if (total === 1) {
    // Default colors for single entities
    return type === 'power'
      ? 'rgba(59, 130, 246, 0.8)'
      : 'rgba(16, 185, 129, 0.8)';
  }

  if (type === 'power') {
    // Different colors for power entities
    const powerColors = [
      'rgba(59, 130, 246, 0.8)', // Blue (first/default)
      'rgba(239, 68, 68, 0.8)', // Red
      'rgba(245, 158, 11, 0.8)', // Orange
      'rgba(139, 92, 246, 0.8)', // Purple
      'rgba(236, 72, 153, 0.8)', // Pink
      'rgba(34, 197, 94, 0.8)', // Green
      'rgba(6, 182, 212, 0.8)', // Cyan
      'rgba(168, 85, 247, 0.8)', // Violet
    ];
    return powerColors[index % powerColors.length];
  } else {
    // Different colors for energy entities
    const energyColors = [
      'rgba(16, 185, 129, 0.8)', // Green (first/default)
      'rgba(239, 68, 68, 0.8)', // Red
      'rgba(59, 130, 246, 0.8)', // Blue
      'rgba(245, 158, 11, 0.8)', // Orange
      'rgba(139, 92, 246, 0.8)', // Purple
      'rgba(236, 72, 153, 0.8)', // Pink
      'rgba(6, 182, 212, 0.8)', // Cyan
      'rgba(168, 85, 247, 0.8)', // Violet
    ];
    return energyColors[index % energyColors.length];
  }
}
