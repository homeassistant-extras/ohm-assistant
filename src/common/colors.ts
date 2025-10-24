/**
 * Generates colors for multiple entities of the same type
 * @param index - The index of the entity
 * @param type - The type of entity ('power' or 'energy')
 * @param total - Total number of entities of this type
 * @returns CSS color string
 */
export function getEntityColor(
  index: number,
  type: 'power' | 'energy',
  total: number,
): string {
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
