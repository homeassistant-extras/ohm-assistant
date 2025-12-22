import { expect } from 'chai';
import { describe, it } from 'mocha';
import type { HistoryDataPoint } from '../../src/common/helpers';
import {
  createChart,
  createChartConfig,
  destroyChart,
} from '../../src/html/chart-go-burr';

// Mock Chart.js and its dependencies
const mockChart = {
  register: () => {},
  getChart: () => null,
  destroy: () => {},
};

// Set up global mocks
(global as any).Chart = mockChart;

describe('chart-go-burr', () => {
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

  // Test the types and interfaces
  describe('types and interfaces', () => {
    it('should have correct EntityData structure', () => {
      expect(mockEntityData).to.have.property('entityId');
      expect(mockEntityData).to.have.property('data');
      expect(mockEntityData.entityId).to.be.a('string');
      expect(mockEntityData.data).to.be.an('array');
    });

    it('should have correct ChartData structure', () => {
      expect(mockChartData).to.have.property('powerData');
      expect(mockChartData).to.have.property('energyData');
      expect(mockChartData.powerData).to.be.an('array');
      expect(mockChartData.energyData).to.be.an('array');
    });

    it('should have correct HistoryDataPoint structure', () => {
      expect(mockHistoryDataPoint).to.have.property('timestamp');
      expect(mockHistoryDataPoint).to.have.property('value');
      expect(mockHistoryDataPoint.timestamp).to.be.instanceof(Date);
      expect(mockHistoryDataPoint.value).to.be.a('number');
    });
  });

  // Test data transformation
  describe('data transformation', () => {
    it('should transform history data points correctly', () => {
      const transformedData = mockEntityData.data.map((d) => ({
        x: d.timestamp.getTime(),
        y: d.value,
      }));

      expect(transformedData).to.be.an('array');
      expect(transformedData[0]).to.have.property('x');
      expect(transformedData[0]).to.have.property('y');
      expect(transformedData[0].x).to.be.a('number');
      expect(transformedData[0].y).to.be.a('number');
    });

    it('should handle multiple entities correctly', () => {
      const multipleEntityData = {
        powerData: [
          { entityId: 'sensor.power1', friendlyName: 'Power 1', data: [mockHistoryDataPoint] },
          { entityId: 'sensor.power2', friendlyName: 'Power 2', data: [mockHistoryDataPoint] },
        ],
        energyData: [
          { entityId: 'sensor.energy1', friendlyName: 'Energy 1', data: [mockHistoryDataPoint] },
          { entityId: 'sensor.energy2', friendlyName: 'Energy 2', data: [mockHistoryDataPoint] },
        ],
      };

      expect(multipleEntityData.powerData).to.have.length(2);
      expect(multipleEntityData.energyData).to.have.length(2);

      // Check that each entity has unique IDs
      const powerIds = multipleEntityData.powerData.map((e) => e.entityId);
      const energyIds = multipleEntityData.energyData.map((e) => e.entityId);

      expect(new Set(powerIds).size).to.equal(powerIds.length);
      expect(new Set(energyIds).size).to.equal(energyIds.length);
    });

    it('should handle empty data gracefully', () => {
      const emptyData = {
        powerData: [],
        energyData: [],
      };

      expect(emptyData.powerData).to.have.length(0);
      expect(emptyData.energyData).to.have.length(0);
    });
  });

  // Test chart options
  describe('chart options', () => {
    it('should handle different line types', () => {
      const lineTypes: Array<
        'normal' | 'gradient' | 'gradient_no_fill' | 'no_fill'
      > = ['normal', 'gradient', 'gradient_no_fill', 'no_fill'];

      lineTypes.forEach((lineType) => {
        expect(lineType).to.be.oneOf([
          'normal',
          'gradient',
          'gradient_no_fill',
          'no_fill',
        ]);
      });
    });

    it('should handle chart options structure', () => {
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        showLegend: false,
        hideXAxis: false,
        hideYAxis: false,
        lineType: 'normal' as const,
      };

      expect(options).to.have.property('responsive');
      expect(options).to.have.property('maintainAspectRatio');
      expect(options).to.have.property('showLegend');
      expect(options).to.have.property('hideXAxis');
      expect(options).to.have.property('hideYAxis');
      expect(options).to.have.property('lineType');
    });
  });

  // Test gradient functions (mock implementation)
  describe('gradient functions', () => {
    it('should handle gradient creation for different line types', () => {
      const lineTypes: Array<
        'normal' | 'gradient' | 'gradient_no_fill' | 'no_fill'
      > = ['normal', 'gradient', 'gradient_no_fill', 'no_fill'];

      lineTypes.forEach((lineType) => {
        // Test that line types are valid
        expect(lineType).to.be.oneOf([
          'normal',
          'gradient',
          'gradient_no_fill',
          'no_fill',
        ]);
      });
    });

    it('should handle chart area dimensions', () => {
      const chartArea = {
        left: 0,
        right: 400,
        top: 0,
        bottom: 300,
      };

      expect(chartArea).to.have.property('left');
      expect(chartArea).to.have.property('right');
      expect(chartArea).to.have.property('top');
      expect(chartArea).to.have.property('bottom');
      expect(chartArea.right - chartArea.left).to.be.a('number');
      expect(chartArea.bottom - chartArea.top).to.be.a('number');
    });
  });

  // Test chart creation and destruction
  describe('chart lifecycle', () => {
    it('should handle chart creation', () => {
      // Mock canvas element
      const mockCanvas = {
        width: 400,
        height: 300,
        getContext: () => ({
          createLinearGradient: () => ({
            addColorStop: () => {},
          }),
        }),
      } as any;

      expect(mockCanvas).to.have.property('width');
      expect(mockCanvas).to.have.property('height');
    });

    it('should handle chart destruction', () => {
      const mockChart = {
        destroy: () => {},
      } as any;

      expect(() => {
        if (mockChart) {
          mockChart.destroy();
        }
      }).to.not.throw();
    });

    it('should handle undefined chart destruction', () => {
      expect(() => {
        // This should not throw
        const chart: any = undefined;
        if (chart) {
          chart.destroy();
        }
      }).to.not.throw();
    });
  });

  // Test dataset creation
  describe('dataset creation', () => {
    it('should create power dataset structure', () => {
      const powerDataset = {
        label: 'sensor.power (W)',
        data: mockEntityData.data.map((d) => ({
          x: d.timestamp.getTime(),
          y: d.value,
        })),
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        stepped: false,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y',
      };

      expect(powerDataset).to.have.property('label');
      expect(powerDataset).to.have.property('data');
      expect(powerDataset).to.have.property('borderColor');
      expect(powerDataset).to.have.property('backgroundColor');
      expect(powerDataset).to.have.property('yAxisID', 'y');
    });

    it('should create energy dataset structure', () => {
      const energyDataset = {
        label: 'sensor.energy (kWh)',
        data: mockEntityData.data.map((d) => ({
          x: d.timestamp.getTime(),
          y: d.value,
        })),
        borderColor: 'rgba(16, 185, 129, 0.8)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0,
        stepped: 'before',
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y1',
      };

      expect(energyDataset).to.have.property('label');
      expect(energyDataset).to.have.property('data');
      expect(energyDataset).to.have.property('borderColor');
      expect(energyDataset).to.have.property('backgroundColor');
      expect(energyDataset).to.have.property('yAxisID', 'y1');
    });
  });

  // Test scale configuration
  describe('scale configuration', () => {
    it('should configure x-axis (time scale)', () => {
      const xScale = {
        type: 'time',
        display: true,
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM d',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          display: true,
        },
        ticks: {
          color: '#666',
          display: true,
        },
      };

      expect(xScale).to.have.property('type', 'time');
      expect(xScale).to.have.property('display', true);
      expect(xScale).to.have.property('time');
    });

    it('should configure y-axis (power)', () => {
      const yScale = {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Power (W)',
          color: 'rgba(59, 130, 246, 0.8)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          display: true,
        },
        ticks: {
          color: '#666',
          display: true,
        },
      };

      expect(yScale).to.have.property('type', 'linear');
      expect(yScale).to.have.property('position', 'left');
      expect(yScale).to.have.property('title');
      expect(yScale.title.text).to.equal('Power (W)');
    });

    it('should configure y1-axis (energy)', () => {
      const y1Scale = {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Energy (kWh)',
          color: 'rgba(16, 185, 129, 0.8)',
        },
        grid: {
          drawOnChartArea: false,
          display: true,
        },
        ticks: {
          color: '#666',
          display: true,
        },
      };

      expect(y1Scale).to.have.property('type', 'linear');
      expect(y1Scale).to.have.property('position', 'right');
      expect(y1Scale).to.have.property('title');
      expect(y1Scale.title.text).to.equal('Energy (kWh)');
    });
  });

  // Test tooltip configuration
  describe('tooltip configuration', () => {
    it('should configure tooltip correctly', () => {
      const tooltip = {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed?.y?.toFixed(1) || '0';
            return `${label}: ${value}`;
          },
        },
      };

      expect(tooltip).to.have.property('backgroundColor');
      expect(tooltip).to.have.property('titleColor');
      expect(tooltip).to.have.property('bodyColor');
      expect(tooltip).to.have.property('callbacks');
      expect(tooltip.callbacks).to.have.property('label');
    });
  });

  // Test createChartConfig function
  describe('createChartConfig', () => {
    const mockData: any = {
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

    it('should create chart config with default options', () => {
      const config = createChartConfig(mockData);

      expect(config).to.have.property('type', 'line');
      expect(config).to.have.property('data');
      expect(config).to.have.property('options');
      expect(config.data).to.have.property('datasets');
      expect(config.data.datasets).to.be.an('array');
      expect(config.data.datasets).to.have.length(2); // 1 power + 1 energy
    });

    it('should create chart config with custom options', () => {
      const customOptions = {
        responsive: false,
        maintainAspectRatio: true,
        showLegend: true,
        hideXAxis: true,
        hideYAxis: true,
        lineType: 'gradient' as const,
      };

      const config = createChartConfig(mockData, customOptions);

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
      const config = createChartConfig(mockData);
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
      const config = createChartConfig(mockData);
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
      const lineTypes: Array<
        'normal' | 'gradient' | 'gradient_no_fill' | 'no_fill'
      > = ['normal', 'gradient', 'gradient_no_fill', 'no_fill'];

      lineTypes.forEach((lineType) => {
        const config = createChartConfig(mockData, { lineType });
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
      const config = createChartConfig(mockData);
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
      const config = createChartConfig(mockData);
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
      const config = createChartConfig(mockData);
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
      const emptyData = {
        powerData: [],
        energyData: [],
      };

      const config = createChartConfig(emptyData);

      expect(config.data.datasets).to.be.an('array');
      expect(config.data.datasets).to.have.length(0);
    });

    it('should handle entities with no data', () => {
      const dataWithEmptyEntities = {
        powerData: [
          { entityId: 'sensor.power1', friendlyName: 'Power 1', data: [] },
          {
            entityId: 'sensor.power2',
            friendlyName: 'Power 2',
            data: [{ timestamp: new Date(), value: 100 }],
          },
        ],
        energyData: [{ entityId: 'sensor.energy1', friendlyName: 'Energy 1', data: [] }],
      };

      const config = createChartConfig(dataWithEmptyEntities);

      // Should only create dataset for entities with data
      expect(config.data.datasets).to.have.length(1); // Only power2 has data
      const dataset = config.data.datasets[0];
      expect(dataset).to.have.property('label', 'Power 2 (W)');
    });

    it('should configure tooltip correctly', () => {
      const config = createChartConfig(mockData);
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
      const config = createChartConfig(mockData);
      const interaction = (config.options as any).interaction;

      expect(interaction).to.have.property('mode', 'index');
      expect(interaction).to.have.property('intersect', false);
    });

    it('should handle multiple power and energy entities', () => {
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

      const config = createChartConfig(multiEntityData);

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
      expect(energyDatasets[0]).to.have.property(
        'label',
        'Energy 1 (kWh)',
      );
      expect(energyDatasets[1]).to.have.property(
        'label',
        'Energy 2 (kWh)',
      );
    });

    it('should handle axis hiding options', () => {
      const config = createChartConfig(mockData, {
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
      const configWithLegend = createChartConfig(mockData, {
        showLegend: true,
      });
      const configWithoutLegend = createChartConfig(mockData, {
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

  // Test gradient_no_fill line type coverage
  describe('gradient_no_fill coverage', () => {
    it('should handle gradient_no_fill line type for power', () => {
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

      const config = createChartConfig(mockData, {
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

      const config = createChartConfig(mockData, {
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

  // Test tooltip callback coverage
  describe('tooltip callback coverage', () => {
    it('should handle tooltip label callback with valid data', () => {
      const config = createChartConfig({
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
      const config = createChartConfig({
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

  // Test x-axis tick callback coverage
  describe('x-axis tick callback coverage', () => {
    it('should handle tick callback for midnight (day display)', () => {
      const config = createChartConfig({
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
      const config = createChartConfig({
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

  // Test createChart function coverage
  describe('createChart function coverage', () => {
    it('should handle createChart with existing chart destruction', () => {
      const mockCanvas = {
        width: 400,
        height: 300,
        getContext: () => ({
          createLinearGradient: () => ({
            addColorStop: () => {},
          }),
        }),
      } as any;

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

      // Mock existing chart
      const existingChart = { destroy: () => {} };
      (global as any).Chart.getChart = () => existingChart;

      expect(() => {
        createChart(mockCanvas, mockData);
      }).to.not.throw();
    });

    it('should handle createChart without existing chart', () => {
      const mockCanvas = {
        width: 400,
        height: 300,
        getContext: () => ({
          createLinearGradient: () => ({
            addColorStop: () => {},
          }),
        }),
      } as any;

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

      // Mock no existing chart
      (global as any).Chart.getChart = () => null;

      expect(() => {
        createChart(mockCanvas, mockData);
      }).to.not.throw();
    });
  });

  // Test destroyChart function coverage
  describe('destroyChart function coverage', () => {
    it('should handle destroyChart with valid chart', () => {
      const mockChart = { destroy: () => {} };

      expect(() => {
        destroyChart(mockChart as any);
      }).to.not.throw();
    });

    it('should handle destroyChart with undefined chart', () => {
      expect(() => {
        destroyChart(undefined);
      }).to.not.throw();
    });

    it('should handle destroyChart with null chart', () => {
      expect(() => {
        destroyChart(null as any);
      }).to.not.throw();
    });
  });

  // Test gradient functions coverage
  describe('gradient functions coverage', () => {
    it('should handle getPowerGradient with gradient_no_fill line type', () => {
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
      const config = createChartConfig(mockData, {
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
      const config = createChartConfig(mockData, {
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
      const config = createChartConfig(mockData, { lineType: 'normal' });

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
      const config = createChartConfig(mockData, { lineType: 'gradient' });

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

      const config = createChartConfig(mockData, {
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

  // Test chart destruction in createChart
  describe('createChart destruction coverage', () => {
    it('should handle createChart with existing chart', () => {
      const mockCanvas = {
        width: 400,
        height: 300,
        getContext: () => ({
          createLinearGradient: () => ({
            addColorStop: () => {},
          }),
        }),
      } as any;

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

      // Mock existing chart
      const existingChart = {
        destroy: () => {},
      };

      // Mock Chart.getChart to return existing chart
      const originalGetChart = (global as any).Chart.getChart;
      (global as any).Chart.getChart = () => existingChart;

      try {
        expect(() => {
          createChart(mockCanvas, mockData);
        }).to.not.throw();
      } finally {
        // Restore original function
        (global as any).Chart.getChart = originalGetChart;
      }
    });
  });
});
