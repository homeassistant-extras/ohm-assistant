import { expect } from 'chai';
import { describe, it } from 'mocha';
import type { HistoryDataPoint } from '../../../src/common/helpers';
import { ChartConfigBuilder } from '../../../src/html/chart/chart-config-builder';

describe('ChartConfigBuilder', () => {
  const mockHistoryDataPoint: HistoryDataPoint = {
    timestamp: new Date('2024-01-01T10:00:00Z'),
    value: 100,
  };

  const mockEntityData = {
    entityId: 'sensor.power',
    friendlyName: 'Power',
    data: [mockHistoryDataPoint],
  };

  const mockChartData = {
    powerData: [mockEntityData],
    energyData: [mockEntityData],
  };

  const mockData = {
    powerData: [
      {
        entityId: 'sensor.power1',
        friendlyName: 'Power 1',
        data: [
          { timestamp: new Date('2024-01-01T10:00:00Z'), value: 100 },
          { timestamp: new Date('2024-01-01T11:00:00Z'), value: 150 },
        ],
      },
    ],
    energyData: [
      {
        entityId: 'sensor.energy1',
        friendlyName: 'Energy 1',
        data: [
          { timestamp: new Date('2024-01-01T10:00:00Z'), value: 1.5 },
          { timestamp: new Date('2024-01-01T11:00:00Z'), value: 2.0 },
        ],
      },
    ],
  };

  describe('build', () => {
    it('should create chart config with default options', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);

      expect(config).to.have.property('type', 'line');
      expect(config).to.have.property('data');
      expect(config).to.have.property('options');
      expect(config.data).to.have.property('datasets');
      expect(config.data.datasets).to.be.an('array');
      expect(config.data.datasets).to.have.length(2); // 1 power + 1 energy
    });

    it('should create chart config with custom options', () => {
      const builder = new ChartConfigBuilder();
      const customOptions = {
        responsive: false,
        maintainAspectRatio: true,
        showLegend: true,
        hideXAxis: true,
        hideYAxis: true,
        lineType: 'gradient' as const,
      };

      const config = builder.build(mockData, customOptions);

      expect(config.options).to.have.property('responsive', false);
      expect(config.options).to.have.property('maintainAspectRatio', true);
      expect((config.options as any).plugins.legend).to.have.property(
        'display',
        true,
      );
      expect((config.options as any).scales.x).to.have.property(
        'display',
        false,
      );
      expect((config.options as any).scales.y).to.have.property(
        'display',
        false,
      );
    });

    it('should create power datasets correctly', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);
      const powerDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y',
      );

      expect(powerDataset).to.exist;
      expect(powerDataset).to.have.property('label', 'Power 1 (W)');
      expect(powerDataset).to.have.property('data');
      expect(powerDataset).to.have.property('borderColor');
      expect(powerDataset).to.have.property('backgroundColor');
      expect(powerDataset).to.have.property('borderWidth', 2);
      expect(powerDataset).to.have.property('fill', true);
      expect(powerDataset).to.have.property('tension', 0.4);
      expect(powerDataset).to.have.property('stepped', false);
      expect(powerDataset).to.have.property('yAxisID', 'y');
    });

    it('should create energy datasets correctly', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);
      const energyDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y1',
      );

      expect(energyDataset).to.exist;
      expect(energyDataset).to.have.property('label', 'Energy 1 (kWh)');
      expect(energyDataset).to.have.property('data');
      expect(energyDataset).to.have.property('borderColor');
      expect(energyDataset).to.have.property('backgroundColor');
      expect(energyDataset).to.have.property('borderWidth', 2);
      expect(energyDataset).to.have.property('fill', true);
      expect(energyDataset).to.have.property('tension', 0);
      expect(energyDataset).to.have.property('stepped', 'before');
      expect(energyDataset).to.have.property('yAxisID', 'y1');
    });

    it('should handle different line types', () => {
      const builder = new ChartConfigBuilder();
      const lineTypes: Array<
        'normal' | 'gradient' | 'gradient_no_fill' | 'no_fill'
      > = ['normal', 'gradient', 'gradient_no_fill', 'no_fill'];

      lineTypes.forEach((lineType) => {
        const config = builder.build(mockData, { lineType });
        const powerDataset = config.data.datasets.find(
          (d: any) => d.yAxisID === 'y',
        );
        const energyDataset = config.data.datasets.find(
          (d: any) => d.yAxisID === 'y1',
        );

        expect(powerDataset).to.exist;
        expect(energyDataset).to.exist;

        if (lineType === 'no_fill' || lineType === 'gradient_no_fill') {
          expect((powerDataset as any).fill).to.be.false;
          expect((energyDataset as any).fill).to.be.false;
        } else {
          expect((powerDataset as any).fill).to.be.true;
          expect((energyDataset as any).fill).to.be.true;
        }
      });
    });

    it('should configure x-axis (time scale) correctly', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);
      const xScale = (config.options as any).scales.x;

      expect(xScale).to.have.property('type', 'time');
      expect(xScale).to.have.property('display', true);
      expect(xScale).to.have.property('time');
      expect(xScale.time).to.have.property('unit', 'hour');
      expect(xScale.time).to.have.property('displayFormats');
      expect(xScale.time.displayFormats).to.have.property('hour', 'HH:mm');
      expect(xScale.time.displayFormats).to.have.property('day', 'MMM d');
    });

    it('should configure y-axis (power) correctly', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);
      const yScale = (config.options as any).scales.y;

      expect(yScale).to.have.property('type', 'linear');
      expect(yScale).to.have.property('display', true);
      expect(yScale).to.have.property('position', 'left');
      expect(yScale).to.have.property('title');
      expect(yScale.title).to.have.property('display', true);
      expect(yScale.title).to.have.property('text', 'Power (W)');
      expect(yScale.title).to.have.property('color', 'rgba(59, 130, 246, 0.8)');
    });

    it('should configure y1-axis (energy) correctly', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);
      const y1Scale = (config.options as any).scales.y1;

      expect(y1Scale).to.have.property('type', 'linear');
      expect(y1Scale).to.have.property('display', true);
      expect(y1Scale).to.have.property('position', 'right');
      expect(y1Scale).to.have.property('title');
      expect(y1Scale.title).to.have.property('display', true);
      expect(y1Scale.title).to.have.property('text', 'Energy (kWh)');
      expect(y1Scale.title).to.have.property(
        'color',
        'rgba(16, 185, 129, 0.8)',
      );
    });

    it('should handle empty data arrays', () => {
      const builder = new ChartConfigBuilder();
      const emptyData = {
        powerData: [],
        energyData: [],
      };

      const config = builder.build(emptyData);

      expect(config.data.datasets).to.be.an('array');
      expect(config.data.datasets).to.have.length(0);
    });

    it('should handle entities with no data', () => {
      const builder = new ChartConfigBuilder();
      const dataWithEmptyEntities = {
        powerData: [
          { entityId: 'sensor.power1', friendlyName: 'Power 1', data: [] },
          {
            entityId: 'sensor.power2',
            friendlyName: 'Power 2',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [
          { entityId: 'sensor.energy1', friendlyName: 'Energy 1', data: [] },
        ],
      };

      const config = builder.build(dataWithEmptyEntities);

      // Should only create dataset for entities with data
      expect(config.data.datasets).to.have.length(1); // Only power2 has data
      const dataset = config.data.datasets[0];
      expect(dataset).to.have.property('label', 'Power 2 (W)');
    });

    it('should configure tooltip correctly', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);
      const tooltip = (config.options as any).plugins.tooltip;

      expect(tooltip).to.have.property('backgroundColor', 'rgba(0, 0, 0, 0.8)');
      expect(tooltip).to.have.property('titleColor', '#fff');
      expect(tooltip).to.have.property('bodyColor', '#fff');
      expect(tooltip).to.have.property(
        'borderColor',
        'rgba(255, 255, 255, 0.1)',
      );
      expect(tooltip).to.have.property('borderWidth', 1);
      expect(tooltip).to.have.property('padding', 12);
      expect(tooltip).to.have.property('displayColors', true);
      expect(tooltip).to.have.property('callbacks');
      expect(tooltip.callbacks).to.have.property('label');
    });

    it('should configure interaction mode correctly', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData);
      const interaction = (config.options as any).interaction;

      expect(interaction).to.have.property('mode', 'index');
      expect(interaction).to.have.property('intersect', false);
    });

    it('should handle multiple power and energy entities', () => {
      const builder = new ChartConfigBuilder();
      const multiEntityData = {
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
          {
            entityId: 'sensor.power2',
            friendlyName: 'Power 2',
            data: [{ timestamp: new Date(), value: 200 }],
          },
        ],
        energyData: [
          {
            entityId: 'sensor.energy1',
            friendlyName: 'Energy 1',
            data: [{ timestamp: new Date(), value: 1.5 }],
          },
          {
            entityId: 'sensor.energy2',
            friendlyName: 'Energy 2',
            data: [{ timestamp: new Date(), value: 2.0 }],
          },
        ],
      };

      const config = builder.build(multiEntityData);

      expect(config.data.datasets).to.have.length(4); // 2 power + 2 energy

      const powerDatasets = config.data.datasets.filter(
        (d: any) => d.yAxisID === 'y',
      );
      const energyDatasets = config.data.datasets.filter(
        (d: any) => d.yAxisID === 'y1',
      );

      expect(powerDatasets).to.have.length(2);
      expect(energyDatasets).to.have.length(2);

      expect(powerDatasets[0]).to.have.property('label', 'Power 1 (W)');
      expect(powerDatasets[1]).to.have.property('label', 'Power 2 (W)');
      expect(energyDatasets[0]).to.have.property('label', 'Energy 1 (kWh)');
      expect(energyDatasets[1]).to.have.property('label', 'Energy 2 (kWh)');
    });

    it('should handle axis hiding options', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build(mockData, {
        hideXAxis: true,
        hideYAxis: true,
      });

      expect((config.options as any).scales.x).to.have.property(
        'display',
        false,
      );
      expect((config.options as any).scales.y).to.have.property(
        'display',
        false,
      );
      expect((config.options as any).scales.y1).to.have.property(
        'display',
        false,
      );
    });

    it('should handle legend display option', () => {
      const builder = new ChartConfigBuilder();
      const configWithLegend = builder.build(mockData, {
        showLegend: true,
      });
      const configWithoutLegend = builder.build(mockData, {
        showLegend: false,
      });

      expect((configWithLegend.options as any).plugins.legend).to.have.property(
        'display',
        true,
      );
      expect(
        (configWithoutLegend.options as any).plugins.legend,
      ).to.have.property('display', false);
    });
  });

  describe('gradient_no_fill coverage', () => {
    it('should handle gradient_no_fill line type for power', () => {
      const builder = new ChartConfigBuilder();
      const mockData = {
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [],
      };

      const config = builder.build(mockData, {
        lineType: 'gradient_no_fill',
      });
      const powerDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y',
      );

      expect(powerDataset).to.exist;
      expect((powerDataset as any).fill).to.be.false;
      expect((powerDataset as any).backgroundColor).to.equal('transparent');
    });

    it('should handle gradient_no_fill line type for energy', () => {
      const builder = new ChartConfigBuilder();
      const mockData = {
        powerData: [],
        energyData: [
          {
            entityId: 'sensor.energy1',
            friendlyName: 'Energy 1',
            data: [{ timestamp: new Date(), value: 1.5 }],
          },
        ],
      };

      const config = builder.build(mockData, {
        lineType: 'gradient_no_fill',
      });
      const energyDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y1',
      );

      expect(energyDataset).to.exist;
      expect((energyDataset as any).fill).to.be.false;
      expect((energyDataset as any).backgroundColor).to.equal('transparent');
    });
  });

  describe('tooltip callback coverage', () => {
    it('should handle tooltip label callback with valid data', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build({
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100.5 }],
          },
        ],
        energyData: [],
      });

      const tooltip = (config.options as any).plugins.tooltip;
      const callback = tooltip.callbacks.label;

      const mockContext = {
        dataset: { label: 'sensor.power1 (W)' },
        parsed: { y: 100.5 },
      };

      const result = callback(mockContext);
      expect(result).to.equal('sensor.power1 (W): 100.5');
    });

    it('should handle tooltip label callback with missing data', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build({
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [],
      });

      const tooltip = (config.options as any).plugins.tooltip;
      const callback = tooltip.callbacks.label;

      const mockContext = {
        dataset: { label: '' },
        parsed: { y: undefined },
      };

      const result = callback(mockContext);
      expect(result).to.equal(': 0');
    });
  });

  describe('x-axis tick callback coverage', () => {
    it('should handle tick callback for midnight (day display)', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build({
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [],
      });

      const xScale = (config.options as any).scales.x;
      const callback = xScale.ticks.callback;

      // Test midnight (00:00) - use local time to avoid timezone issues
      const midnightDate = new Date('2024-01-01T00:00:00');
      const result = callback(midnightDate.getTime(), 0, []);

      // The result should contain month and day information
      expect(result).to.be.a('string');
      expect(result.length).to.be.greaterThan(0);
    });

    it('should handle tick callback for regular time (time display)', () => {
      const builder = new ChartConfigBuilder();
      const config = builder.build({
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [],
      });

      const xScale = (config.options as any).scales.x;
      const callback = xScale.ticks.callback;

      // Test regular time (14:30)
      const regularDate = new Date('2024-01-01T14:30:00Z');
      const result = callback(regularDate.getTime(), 0, []);

      expect(result).to.match(/^\d{2}:\d{2}$/); // Should be in HH:mm format
    });
  });

  describe('gradient functions coverage', () => {
    it('should handle getPowerGradient with gradient_no_fill line type', () => {
      const builder = new ChartConfigBuilder();
      const mockData = {
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [],
      };

      // Mock canvas context with gradient functions
      const mockGradient = {
        addColorStop: () => {},
      };
      const mockCtx = {
        createLinearGradient: () => mockGradient,
      };
      const mockCanvas = {
        getContext: () => mockCtx,
      } as any;

      // Mock Chart.js to return a chart with our mock context
      const mockChart = {
        ctx: mockCtx,
        chartArea: { left: 0, right: 400, top: 0, bottom: 300 },
      };

      // Test gradient_no_fill line type
      const config = builder.build(mockData, {
        lineType: 'gradient_no_fill',
      });

      const powerDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y',
      );

      expect(powerDataset).to.exist;
      expect(typeof (powerDataset as any).borderColor).to.equal('function');

      // Test the borderColor function
      const borderColorFn = (powerDataset as any).borderColor;
      const mockContext = { chart: mockChart };
      const result = borderColorFn(mockContext);

      expect(result).to.exist;
    });

    it('should handle getEnergyGradient with gradient_no_fill line type', () => {
      const builder = new ChartConfigBuilder();
      const mockData = {
        powerData: [],
        energyData: [
          {
            entityId: 'sensor.energy1',
            friendlyName: 'Energy 1',
            data: [{ timestamp: new Date(), value: 1.5 }],
          },
        ],
      };

      // Mock canvas context with gradient functions
      const mockGradient = {
        addColorStop: () => {},
      };
      const mockCtx = {
        createLinearGradient: () => mockGradient,
      };
      const mockCanvas = {
        getContext: () => mockCtx,
      } as any;

      // Mock Chart.js to return a chart with our mock context
      const mockChart = {
        ctx: mockCtx,
        chartArea: { left: 0, right: 400, top: 0, bottom: 300 },
      };

      // Test gradient_no_fill line type
      const config = builder.build(mockData, {
        lineType: 'gradient_no_fill',
      });

      const energyDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y1',
      );

      expect(energyDataset).to.exist;
      expect(typeof (energyDataset as any).borderColor).to.equal('function');

      // Test the borderColor function
      const borderColorFn = (energyDataset as any).borderColor;
      const mockContext = { chart: mockChart };
      const result = borderColorFn(mockContext);

      expect(result).to.exist;
    });

    it('should handle gradient functions with normal line type', () => {
      const builder = new ChartConfigBuilder();
      const mockData = {
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [
          {
            entityId: 'sensor.energy1',
            friendlyName: 'Energy 1',
            data: [{ timestamp: new Date(), value: 1.5 }],
          },
        ],
      };

      // Test normal line type
      const config = builder.build(mockData, { lineType: 'normal' });

      const powerDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y',
      );
      const energyDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y1',
      );

      expect(powerDataset).to.exist;
      expect(energyDataset).to.exist;

      // For normal line type, borderColor should be a string, not a function
      expect((powerDataset as any).borderColor).to.be.a('string');
      expect((energyDataset as any).borderColor).to.be.a('string');
    });

    it('should handle gradient functions with gradient line type', () => {
      const builder = new ChartConfigBuilder();
      const mockData = {
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [
          {
            entityId: 'sensor.energy1',
            friendlyName: 'Energy 1',
            data: [{ timestamp: new Date(), value: 1.5 }],
          },
        ],
      };

      // Mock canvas context with gradient functions
      const mockGradient = {
        addColorStop: () => {},
      };
      const mockCtx = {
        createLinearGradient: () => mockGradient,
      };

      // Mock Chart.js to return a chart with our mock context
      const mockChart = {
        ctx: mockCtx,
        chartArea: { left: 0, right: 400, top: 0, bottom: 300 },
      };

      // Test gradient line type
      const config = builder.build(mockData, { lineType: 'gradient' });

      const powerDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y',
      );
      const energyDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y1',
      );

      expect(powerDataset).to.exist;
      expect(energyDataset).to.exist;

      // Test power backgroundColor function
      const powerBackgroundColorFn = (powerDataset as any).backgroundColor;
      const powerContext = { chart: mockChart };
      const powerResult = powerBackgroundColorFn(powerContext);
      expect(powerResult).to.exist;

      // Test energy backgroundColor function
      const energyBackgroundColorFn = (energyDataset as any).backgroundColor;
      const energyContext = { chart: mockChart };
      const energyResult = energyBackgroundColorFn(energyContext);
      expect(energyResult).to.exist;
    });

    it('should handle gradient functions with missing chartArea', () => {
      const builder = new ChartConfigBuilder();
      const mockData = {
        powerData: [
          {
            entityId: 'sensor.power1',
            friendlyName: 'Power 1',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [],
      };

      // Mock Chart.js to return a chart without chartArea
      const mockChart = {
        ctx: null,
        chartArea: null,
      };

      const config = builder.build(mockData, {
        lineType: 'gradient_no_fill',
      });

      const powerDataset = config.data.datasets.find(
        (d: any) => d.yAxisID === 'y',
      );

      expect(powerDataset).to.exist;

      // Test the borderColor function with missing chartArea
      const borderColorFn = (powerDataset as any).borderColor;
      const mockContext = { chart: mockChart };
      const result = borderColorFn(mockContext);

      // Should return the entity color when chartArea is missing
      expect(result).to.be.a('string');
    });
  });
});
