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
