import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getEntityColor } from '../../src/common/colors';

describe('colors', () => {
  describe('getEntityColor', () => {
    describe('single entity (total = 1)', () => {
      it('should return default blue color for single power entity', () => {
        const color = getEntityColor(0, 'power', 1);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should return default green color for single energy entity', () => {
        const color = getEntityColor(0, 'energy', 1);
        expect(color).to.equal('rgba(16, 185, 129, 0.8)');
      });

      it('should return default color regardless of index for single entity', () => {
        const powerColor = getEntityColor(5, 'power', 1);
        const energyColor = getEntityColor(10, 'energy', 1);

        expect(powerColor).to.equal('rgba(59, 130, 246, 0.8)');
        expect(energyColor).to.equal('rgba(16, 185, 129, 0.8)');
      });
    });

    describe('multiple power entities', () => {
      it('should return first power color for index 0', () => {
        const color = getEntityColor(0, 'power', 2);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should return second power color for index 1', () => {
        const color = getEntityColor(1, 'power', 2);
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
          const color = getEntityColor(i, 'power', 10);
          expect(color).to.equal(colors[i]);
        }
      });

      it('should wrap around power colors when index exceeds array length', () => {
        const color8 = getEntityColor(8, 'power', 10);
        const color0 = getEntityColor(0, 'power', 10);
        expect(color8).to.equal(color0);

        const color9 = getEntityColor(9, 'power', 10);
        const color1 = getEntityColor(1, 'power', 10);
        expect(color9).to.equal(color1);
      });
    });

    describe('multiple energy entities', () => {
      it('should return first energy color for index 0', () => {
        const color = getEntityColor(0, 'energy', 2);
        expect(color).to.equal('rgba(16, 185, 129, 0.8)');
      });

      it('should return second energy color for index 1', () => {
        const color = getEntityColor(1, 'energy', 2);
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
          const color = getEntityColor(i, 'energy', 10);
          expect(color).to.equal(colors[i]);
        }
      });

      it('should wrap around energy colors when index exceeds array length', () => {
        const color8 = getEntityColor(8, 'energy', 10);
        const color0 = getEntityColor(0, 'energy', 10);
        expect(color8).to.equal(color0);

        const color9 = getEntityColor(9, 'energy', 10);
        const color1 = getEntityColor(1, 'energy', 10);
        expect(color9).to.equal(color1);
      });
    });

    describe('edge cases', () => {
      it('should handle large index values correctly', () => {
        const color100 = getEntityColor(100, 'power', 10);
        const color4 = getEntityColor(4, 'power', 10); // 100 % 8 = 4
        expect(color100).to.equal(color4);

        const color100Energy = getEntityColor(100, 'energy', 10);
        const color4Energy = getEntityColor(4, 'energy', 10);
        expect(color100Energy).to.equal(color4Energy);
      });

      it('should handle zero index correctly', () => {
        const powerColor = getEntityColor(0, 'power', 5);
        const energyColor = getEntityColor(0, 'energy', 5);

        expect(powerColor).to.equal('rgba(59, 130, 246, 0.8)');
        expect(energyColor).to.equal('rgba(16, 185, 129, 0.8)');
      });

      it('should return different colors for power and energy at same index', () => {
        const powerColor = getEntityColor(0, 'power', 5);
        const energyColor = getEntityColor(0, 'energy', 5);

        expect(powerColor).to.not.equal(energyColor);
      });

      it('should handle very large total values', () => {
        const color = getEntityColor(0, 'power', 1000);
        expect(color).to.equal('rgba(59, 130, 246, 0.8)');
      });

      it('should maintain color consistency across different total values', () => {
        const color1 = getEntityColor(2, 'power', 3);
        const color2 = getEntityColor(2, 'power', 5);
        const color3 = getEntityColor(2, 'power', 10);

        expect(color1).to.equal(color2);
        expect(color2).to.equal(color3);
      });
    });

    describe('color format validation', () => {
      it('should return valid rgba color strings', () => {
        const color = getEntityColor(0, 'power', 1);
        expect(color).to.match(/^rgba\(\d+, \d+, \d+, 0\.8\)$/);
      });

      it('should have consistent alpha values', () => {
        const powerColor = getEntityColor(0, 'power', 5);
        const energyColor = getEntityColor(0, 'energy', 5);

        expect(powerColor).to.include('0.8');
        expect(energyColor).to.include('0.8');
      });

      it('should return different colors for different indices', () => {
        const colors = new Set();
        for (let i = 0; i < 8; i++) {
          colors.add(getEntityColor(i, 'power', 10));
        }
        expect(colors.size).to.equal(8);
      });
    });
  });
});
