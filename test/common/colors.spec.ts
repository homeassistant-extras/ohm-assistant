import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { getEntityColor, resolveColor } from '../../src/common/colors';

describe('colors', () => {
  describe('getEntityColor', () => {
    describe('single entity (total = 1)', () => {
      it('should return default blue color for single power entity', () => {
        const color = getEntityColor('sensor.power1', 0, 'power', 1);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should return default green color for single energy entity', () => {
        const color = getEntityColor('sensor.energy1', 0, 'energy', 1);
        expect(color).to.equal('rgba(16, 185, 129, 0.8)');
      });

      it('should return default color regardless of index for single entity', () => {
        const powerColor = getEntityColor('sensor.power1', 5, 'power', 1);
        const energyColor = getEntityColor('sensor.energy1', 10, 'energy', 1);

        expect(powerColor).to.equal('rgba(59, 130, 246, 0.8)');
        expect(energyColor).to.equal('rgba(16, 185, 129, 0.8)');
      });
    });

    describe('multiple power entities', () => {
      it('should return first power color for index 0', () => {
        const color = getEntityColor('sensor.power1', 0, 'power', 2);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should return second power color for index 1', () => {
        const color = getEntityColor('sensor.power2', 1, 'power', 2);
        expect(color).to.equal('rgba(239, 68, 68, 0.8)');
      });

      it('should cycle through power colors correctly', () => {
        const colors = [
          'rgba(59, 130, 246, 0.8)', // Blue (index 0)
          'rgba(239, 68, 68, 0.8)', // Red (index 1)
          'rgba(245, 158, 11, 0.8)', // Orange (index 2)
          'rgba(139, 92, 246, 0.8)', // Purple (index 3)
          'rgba(236, 72, 153, 0.8)', // Pink (index 4)
          'rgba(34, 197, 94, 0.8)', // Green (index 5)
          'rgba(6, 182, 212, 0.8)', // Cyan (index 6)
          'rgba(168, 85, 247, 0.8)', // Violet (index 7)
        ];

        for (let i = 0; i < colors.length; i++) {
          const color = getEntityColor(`sensor.power${i}`, i, 'power', 10);
          expect(color).to.equal(colors[i]);
        }
      });

      it('should wrap around power colors when index exceeds array length', () => {
        const color8 = getEntityColor('sensor.power8', 8, 'power', 10);
        const color0 = getEntityColor('sensor.power0', 0, 'power', 10);
        expect(color8).to.equal(color0);

        const color9 = getEntityColor('sensor.power9', 9, 'power', 10);
        const color1 = getEntityColor('sensor.power1', 1, 'power', 10);
        expect(color9).to.equal(color1);
      });
    });

    describe('multiple energy entities', () => {
      it('should return first energy color for index 0', () => {
        const color = getEntityColor('sensor.energy1', 0, 'energy', 2);
        expect(color).to.equal('rgba(16, 185, 129, 0.8)');
      });

      it('should return second energy color for index 1', () => {
        const color = getEntityColor('sensor.energy2', 1, 'energy', 2);
        expect(color).to.equal('rgba(239, 68, 68, 0.8)');
      });

      it('should cycle through energy colors correctly', () => {
        const colors = [
          'rgba(16, 185, 129, 0.8)', // Green (index 0)
          'rgba(239, 68, 68, 0.8)', // Red (index 1)
          'rgba(59, 130, 246, 0.8)', // Blue (index 2)
          'rgba(245, 158, 11, 0.8)', // Orange (index 3)
          'rgba(139, 92, 246, 0.8)', // Purple (index 4)
          'rgba(236, 72, 153, 0.8)', // Pink (index 5)
          'rgba(6, 182, 212, 0.8)', // Cyan (index 6)
          'rgba(168, 85, 247, 0.8)', // Violet (index 7)
        ];

        for (let i = 0; i < colors.length; i++) {
          const color = getEntityColor(`sensor.energy${i}`, i, 'energy', 10);
          expect(color).to.equal(colors[i]);
        }
      });

      it('should wrap around energy colors when index exceeds array length', () => {
        const color8 = getEntityColor('sensor.energy8', 8, 'energy', 10);
        const color0 = getEntityColor('sensor.energy0', 0, 'energy', 10);
        expect(color8).to.equal(color0);

        const color9 = getEntityColor('sensor.energy9', 9, 'energy', 10);
        const color1 = getEntityColor('sensor.energy1', 1, 'energy', 10);
        expect(color9).to.equal(color1);
      });
    });

    describe('edge cases', () => {
      it('should handle large index values correctly', () => {
        const color100 = getEntityColor('sensor.power100', 100, 'power', 10);
        const color4 = getEntityColor('sensor.power4', 4, 'power', 10); // 100 % 8 = 4
        expect(color100).to.equal(color4);

        const color100Energy = getEntityColor('sensor.energy100', 100, 'energy', 10);
        const color4Energy = getEntityColor('sensor.energy4', 4, 'energy', 10);
        expect(color100Energy).to.equal(color4Energy);
      });

      it('should handle zero index correctly', () => {
        const powerColor = getEntityColor('sensor.power1', 0, 'power', 5);
        const energyColor = getEntityColor('sensor.energy1', 0, 'energy', 5);

        expect(powerColor).to.equal('rgba(59, 130, 246, 0.8)');
        expect(energyColor).to.equal('rgba(16, 185, 129, 0.8)');
      });

      it('should return different colors for power and energy at same index', () => {
        const powerColor = getEntityColor('sensor.power1', 0, 'power', 5);
        const energyColor = getEntityColor('sensor.energy1', 0, 'energy', 5);

        expect(powerColor).to.not.equal(energyColor);
      });

      it('should handle very large total values', () => {
        const color = getEntityColor('sensor.power1', 0, 'power', 1000);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should maintain color consistency across different total values', () => {
        const color1 = getEntityColor('sensor.power3', 2, 'power', 3);
        const color2 = getEntityColor('sensor.power3', 2, 'power', 5);
        const color3 = getEntityColor('sensor.power3', 2, 'power', 10);

        expect(color1).to.equal(color2);
        expect(color2).to.equal(color3);
      });
    });

    describe('color format validation', () => {
      it('should return valid rgba color strings', () => {
        const color = getEntityColor('sensor.power1', 0, 'power', 1);
        expect(color).to.match(/^rgba\(\d+, \d+, \d+, 0\.8\)$/);
      });

      it('should have consistent alpha values', () => {
        const powerColor = getEntityColor('sensor.power1', 0, 'power', 5);
        const energyColor = getEntityColor('sensor.energy1', 0, 'energy', 5);

        expect(powerColor).to.include('0.8');
        expect(energyColor).to.include('0.8');
      });

      it('should return different colors for different indices', () => {
        const colors = new Set();
        for (let i = 0; i < 8; i++) {
          colors.add(getEntityColor(`sensor.power${i}`, i, 'power', 10));
        }
        expect(colors.size).to.equal(8);
      });
    });

    describe('custom colors', () => {
      it('should return custom color when provided in colorMap', () => {
        const colorMap = { 'sensor.power1': '#ff0000' };
        const color = getEntityColor('sensor.power1', 0, 'power', 1, colorMap);
        expect(color).to.equal('#ff0000');
      });

      it('should fall back to default color when not in colorMap', () => {
        const colorMap = { 'sensor.power2': '#ff0000' };
        const color = getEntityColor('sensor.power1', 0, 'power', 1, colorMap);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should handle empty colorMap', () => {
        const color = getEntityColor('sensor.power1', 0, 'power', 1, {});
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should handle undefined colorMap', () => {
        const color = getEntityColor('sensor.power1', 0, 'power', 1);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should convert Home Assistant color names to CSS variables', () => {
        const colorMap = { 'sensor.power1': 'primary' };
        const color = getEntityColor('sensor.power1', 0, 'power', 1, colorMap);
        expect(color).to.equal('var(--primary-color)');
      });

      it('should convert accent color to CSS variable', () => {
        const colorMap = { 'sensor.energy1': 'accent' };
        const color = getEntityColor('sensor.energy1', 0, 'energy', 1, colorMap);
        expect(color).to.equal('var(--accent-color)');
      });

      it('should convert various Home Assistant colors to CSS variables', () => {
        const haColors = ['red', 'blue', 'green', 'yellow', 'purple'];
        haColors.forEach((haColor) => {
          const colorMap = { 'sensor.power1': haColor };
          const color = getEntityColor('sensor.power1', 0, 'power', 1, colorMap);
          expect(color).to.equal(`var(--${haColor}-color)`);
        });
      });

      it('should not convert non-HA colors to CSS variables', () => {
        const colorMap = { 'sensor.power1': 'custom-color' };
        const color = getEntityColor('sensor.power1', 0, 'power', 1, colorMap);
        expect(color).to.equal('custom-color');
      });

      it('should handle rgba colors without conversion', () => {
        const colorMap = { 'sensor.power1': 'rgba(255, 0, 0, 0.8)' };
        const color = getEntityColor('sensor.power1', 0, 'power', 1, colorMap);
        expect(color).to.equal('rgba(255, 0, 0, 0.8)');
      });

      it('should handle hex colors without conversion', () => {
        const colorMap = { 'sensor.power1': '#ff0000' };
        const color = getEntityColor('sensor.power1', 0, 'power', 1, colorMap);
        expect(color).to.equal('#ff0000');
      });
    });
  });

  describe('resolveColor', () => {
    describe('non-CSS variable colors', () => {
      it('should return hex colors as-is', () => {
        const color = resolveColor('#ff0000');
        expect(color).to.equal('#ff0000');
      });

      it('should return rgba colors as-is', () => {
        const color = resolveColor('rgba(255, 0, 0, 0.8)');
        expect(color).to.equal('rgba(255, 0, 0, 0.8)');
      });

      it('should return rgb colors as-is', () => {
        const color = resolveColor('rgb(255, 0, 0)');
        expect(color).to.equal('rgb(255, 0, 0)');
      });

      it('should return named colors as-is', () => {
        const color = resolveColor('blue');
        expect(color).to.equal('blue');
      });
    });

    describe('CSS variable colors', () => {
      beforeEach(() => {
        // Set up CSS variables for testing
        document.documentElement.style.setProperty('--primary-color', 'rgb(41, 189, 245)');
        document.documentElement.style.setProperty('--accent-color', 'rgb(255, 152, 0)');
        document.documentElement.style.setProperty('--red-color', 'rgb(244, 67, 54)');
        document.documentElement.style.setProperty('--empty-color', '');
      });

      afterEach(() => {
        // Clean up CSS variables
        document.documentElement.style.removeProperty('--primary-color');
        document.documentElement.style.removeProperty('--accent-color');
        document.documentElement.style.removeProperty('--red-color');
        document.documentElement.style.removeProperty('--empty-color');
      });

      it('should resolve CSS variables to their computed values', () => {
        const color = resolveColor('var(--primary-color)');
        expect(color).to.equal('rgb(41, 189, 245)');
      });

      it('should resolve different CSS variables correctly', () => {
        const accentColor = resolveColor('var(--accent-color)');
        expect(accentColor).to.equal('rgb(255, 152, 0)');

        const redColor = resolveColor('var(--red-color)');
        expect(redColor).to.equal('rgb(244, 67, 54)');
      });

      it('should return original color if CSS variable is empty', () => {
        const color = resolveColor('var(--empty-color)');
        expect(color).to.equal('var(--empty-color)');
      });

      it('should return original color if CSS variable does not exist', () => {
        const color = resolveColor('var(--nonexistent-color)');
        expect(color).to.equal('var(--nonexistent-color)');
      });
    });

    describe('edge cases', () => {
      it('should handle malformed CSS variable syntax', () => {
        const color = resolveColor('var(primary-color)'); // Missing --
        expect(color).to.equal('var(primary-color)');
      });

      it('should handle CSS variables with whitespace', () => {
        document.documentElement.style.setProperty('--test-color', 'rgb(100, 100, 100)');
        const color = resolveColor('var(--test-color)');
        expect(color).to.equal('rgb(100, 100, 100)');
        document.documentElement.style.removeProperty('--test-color');
      });
    });
  });
});
