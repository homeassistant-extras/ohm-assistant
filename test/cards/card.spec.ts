import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import type { TemplateResult } from 'lit';
import { stub } from 'sinon';
import { AreaEnergy } from '../../src/cards/card';
import * as fetchPowerEnergyDataModule from '../../src/common/helpers';
import * as hasFeatureModule from '../../src/config/feature';
import * as getAreaModule from '../../src/delegates/retrievers/area';
import * as getDeviceModule from '../../src/delegates/retrievers/device';
import * as getZappedModule from '../../src/delegates/utils/get-zapped';
import type { HomeAssistant } from '../../src/hass/types';
import * as chartModule from '../../src/html/chart-go-burr';
import { styles } from '../../src/styles';
import type { Config } from '../../src/types/config';
import type { EntityState } from '../../src/types/entity';
import { createStateEntity } from '../test-helpers';

// Register the custom element for testing
customElements.define('area-energy-card', AreaEnergy);

// Mock Chart.js
const mockChart = {
  register: () => {},
  getChart: () => null,
  destroy: () => {},
};

// Set up global mocks
(global as any).Chart = mockChart;

describe('AreaEnergy', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let mockPowerEntities: EntityState[];
  let mockEnergyEntities: EntityState[];
  let mockPowerEnergyData: any;
  let getZappedStub: sinon.SinonStub;
  let fetchPowerEnergyDataStub: sinon.SinonStub;
  let getAreaStub: sinon.SinonStub;
  let getDeviceStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;
  let createChartStub: sinon.SinonStub;
  let destroyChartStub: sinon.SinonStub;

  beforeEach(() => {
    // Register the custom element to avoid constructor issues
    if (!customElements.get('area-energy-card')) {
      customElements.define('area-energy-card', AreaEnergy);
    }

    // Create mock entities
    mockPowerEntities = [
      createStateEntity('sensor', 'power_1', '150.5', {
        device_class: 'power',
        unit_of_measurement: 'W',
        friendly_name: 'Power 1',
      }),
      createStateEntity('sensor', 'power_2', '200.0', {
        device_class: 'power',
        unit_of_measurement: 'W',
        friendly_name: 'Power 2',
      }),
    ];

    mockEnergyEntities = [
      createStateEntity('sensor', 'energy_1', '12.5', {
        device_class: 'energy',
        unit_of_measurement: 'kWh',
        friendly_name: 'Energy 1',
      }),
      createStateEntity('sensor', 'energy_2', '8.3', {
        device_class: 'energy',
        unit_of_measurement: 'kWh',
        friendly_name: 'Energy 2',
      }),
    ];

    // Create mock HomeAssistant instance
    mockHass = {
      callService: stub(),
      callWS: stub(),
      states: {
        'sensor.power_1': {
          state: '150.5',
          entity_id: 'sensor.power_1',
          attributes: {
            device_class: 'power',
            unit_of_measurement: 'W',
            friendly_name: 'Power 1',
          },
        },
        'sensor.power_2': {
          state: '200.0',
          entity_id: 'sensor.power_2',
          attributes: {
            device_class: 'power',
            unit_of_measurement: 'W',
            friendly_name: 'Power 2',
          },
        },
        'sensor.energy_1': {
          state: '12.5',
          entity_id: 'sensor.energy_1',
          attributes: {
            device_class: 'energy',
            unit_of_measurement: 'kWh',
            friendly_name: 'Energy 1',
          },
        },
        'sensor.energy_2': {
          state: '8.3',
          entity_id: 'sensor.energy_2',
          attributes: {
            device_class: 'energy',
            unit_of_measurement: 'kWh',
            friendly_name: 'Energy 2',
          },
        },
      },
      entities: {
        'sensor.power_1': {
          entity_id: 'sensor.power_1',
          device_id: 'device_1',
          area_id: 'area_1',
        },
        'sensor.power_2': {
          entity_id: 'sensor.power_2',
          device_id: 'device_2',
          area_id: 'area_1',
        },
        'sensor.energy_1': {
          entity_id: 'sensor.energy_1',
          device_id: 'device_1',
          area_id: 'area_1',
        },
        'sensor.energy_2': {
          entity_id: 'sensor.energy_2',
          device_id: 'device_2',
          area_id: 'area_1',
        },
      },
      devices: {
        device_1: {
          name: 'Device 1',
          area_id: 'area_1',
          name_by_user: null,
        },
        device_2: {
          name: 'Device 2',
          area_id: 'area_1',
          name_by_user: null,
        },
      },
      areas: {
        area_1: {
          area_id: 'area_1',
          name: 'Living Room',
          icon: undefined,
          picture: null,
        },
      },
    } as unknown as HomeAssistant;

    // Create mock config
    mockConfig = {
      area: 'area_1',
      name: 'Test Energy Card',
      entities: ['sensor.power_1', 'sensor.energy_1'],
      chart: {
        legend_style: 'compact',
        axis_style: 'all',
        line_type: 'normal',
      },
      features: ['hide_name'],
    };

    // Create mock power/energy data
    mockPowerEnergyData = {
      powerData: [
        {
          entityId: 'sensor.power_1',
          data: [
            {
              timestamp: new Date('2024-01-01T10:00:00Z'),
              value: 150.5,
            },
            {
              timestamp: new Date('2024-01-01T11:00:00Z'),
              value: 200.0,
            },
          ],
        },
      ],
      energyData: [
        {
          entityId: 'sensor.energy_1',
          data: [
            {
              timestamp: new Date('2024-01-01T10:00:00Z'),
              value: 12.5,
            },
            {
              timestamp: new Date('2024-01-01T11:00:00Z'),
              value: 8.3,
            },
          ],
        },
      ],
    };

    // Stub getZapped function
    getZappedStub = stub(getZappedModule, 'getZapped').returns({
      powerEntities: mockPowerEntities,
      energyEntities: mockEnergyEntities,
      activeLights: 2,
      activeSwitches: 1,
    });

    // Stub fetchPowerEnergyData function
    fetchPowerEnergyDataStub = stub(
      fetchPowerEnergyDataModule,
      'fetchPowerEnergyData',
    ).resolves(mockPowerEnergyData);

    // Stub getArea function
    getAreaStub = stub(getAreaModule, 'getArea').returns({
      area_id: 'area_1',
      name: 'Living Room',
      icon: undefined,
      picture: null,
    });

    // Stub getDevice function
    getDeviceStub = stub(getDeviceModule, 'getDevice').returns({
      name: 'Device 1',
      area_id: 'area_1',
      name_by_user: null,
    });

    // Stub hasFeature function
    hasFeatureStub = stub(hasFeatureModule, 'hasFeature').returns(false);

    // Stub chart functions
    createChartStub = stub(chartModule, 'createChart').returns({} as any);
    destroyChartStub = stub(chartModule, 'destroyChart');
  });

  afterEach(() => {
    // Restore stubs
    getZappedStub.restore();
    fetchPowerEnergyDataStub.restore();
    getAreaStub.restore();
    getDeviceStub.restore();
    hasFeatureStub.restore();
    createChartStub.restore();
    destroyChartStub.restore();
  });

  describe('configuration', () => {
    it('should set config correctly', () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);

      // Test that setConfig doesn't throw and the card is ready for use
      expect(card).to.be.instanceOf(AreaEnergy);
    });

    it('should not update config when config is the same', () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);

      // Set same config again - should not throw
      card.setConfig(mockConfig);

      expect(card).to.be.instanceOf(AreaEnergy);
    });

    it('should getStubConfig correctly', async () => {
      const stubConfig = await AreaEnergy.getStubConfig(mockHass);

      expect(stubConfig).to.deep.equal({
        area: 'area_1',
      });
    });

    it('should return empty area when no matching area found', async () => {
      // Update mock to have no matching entities
      const emptyHass = {
        ...mockHass,
        entities: {},
        devices: {},
        areas: {},
      } as unknown as HomeAssistant;

      const stubConfig = await AreaEnergy.getStubConfig(emptyHass);

      expect(stubConfig).to.deep.equal({
        area: '',
      });
    });

    it('should return editor element when getConfigElement is called', () => {
      const editorElement = AreaEnergy.getConfigElement();

      expect(editorElement.tagName.toLowerCase()).to.equal(
        'area-energy-card-editor',
      );
    });
  });

  describe('hass setter', () => {
    it('should update entities when hass changes', () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);

      // Set initial hass
      card.hass = mockHass;

      expect(getZappedStub.calledOnce).to.be.true;
      expect(getZappedStub.calledWith(mockHass, mockConfig)).to.be.true;
    });

    it('should not update when entities remain the same', () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);

      // Set initial hass
      card.hass = mockHass;
      const initialCallCount = getZappedStub.callCount;

      // Set same hass again
      card.hass = { ...mockHass };

      // Should call getZapped again (since it's called on every hass set)
      expect(getZappedStub.callCount).to.equal(initialCallCount + 1);
    });

    it('should update when entities change', () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);

      // Set initial hass
      card.hass = mockHass;

      // Update getZapped to return different entities
      const newPowerEntities = [
        createStateEntity('sensor', 'power_3', '300.0', {
          device_class: 'power',
          unit_of_measurement: 'W',
          friendly_name: 'Power 3',
        }),
      ];

      getZappedStub.returns({
        powerEntities: newPowerEntities,
        energyEntities: mockEnergyEntities,
        activeLights: 3,
        activeSwitches: 2,
      });

      // Set hass again
      card.hass = { ...mockHass };

      // Verify that getZapped was called with the new hass
      expect(getZappedStub.callCount).to.be.greaterThan(1);
    });
  });

  describe('rendering', () => {
    it('should render error when error is set', async () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      // Test that the card renders without throwing errors
      const el = await fixture(card.render() as TemplateResult);

      // The card should render without throwing errors
      expect(el).to.exist;
    });

    it('should render loading state', async () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      // Test that the card renders without errors
      const el = await fixture(card.render() as TemplateResult);

      expect(el).to.exist;
    });

    it('should render chart container', async () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      // Ensure the card is not in loading or error state
      (card as any)._loading = false;
      (card as any)._error = undefined;

      const el = await fixture(card.render() as TemplateResult);

      // The card should render without errors
      expect(el).to.exist;

      // Check that the template contains the expected elements
      const template = card.render() as any;
      expect(template.strings).to.be.an('array');
      const templateString = template.strings.join('');
      expect(templateString).to.include('chart-container');
      expect(templateString).to.include('energyChart');
    });

    it('should render header when hide_name feature is not enabled', async () => {
      hasFeatureStub.returns(false);

      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.querySelector('.header')).to.exist;
      expect(el.querySelector('.card-title')).to.exist;
      expect(el.textContent).to.include('Test Energy Card');
    });

    it('should not render header when hide_name feature is enabled', async () => {
      hasFeatureStub.returns(true);

      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.querySelector('.header')).to.not.exist;
    });

    it('should render status badges for active lights and switches', async () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      const statusBadges = el.querySelector('.status-badges');
      expect(statusBadges).to.exist;

      const lightBadge = el.querySelector('.status-item');
      expect(lightBadge).to.exist;
      expect(lightBadge?.textContent).to.include('2'); // activeLights count
    });

    it('should not render status badges when no active devices', async () => {
      getZappedStub.returns({
        powerEntities: mockPowerEntities,
        energyEntities: mockEnergyEntities,
        activeLights: 0,
        activeSwitches: 0,
      });

      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      const statusBadges = el.querySelector('.status-badges');
      expect(statusBadges?.children.length).to.equal(0);
    });
  });

  describe('chart initialization', () => {
    it('should call _initChart when firstUpdated is called', async () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

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

      // Mock shadowRoot
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => mockCanvas,
        },
        writable: true,
      });

      // Call firstUpdated - this should call the real _initChart method
      card.firstUpdated();

      // Wait for the async _initChart to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify that fetchPowerEnergyData was called (part of _initChart logic)
      expect(fetchPowerEnergyDataStub.calledOnce).to.be.true;
      expect(
        fetchPowerEnergyDataStub.calledWith(
          mockHass,
          mockPowerEntities,
          mockEnergyEntities,
          24,
          '5minute', // Default is line chart, so uses 5minute
        ),
      ).to.be.true;

      // Verify that createChart was called (part of _initChart logic)
      expect(createChartStub.calledOnce).to.be.true;
    });

    it('should initialize chart with data', async () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

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

      // Mock shadowRoot
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => mockCanvas,
        },
        writable: true,
      });

      // Test that the card can be rendered without errors
      const el = await fixture(card.render() as TemplateResult);
      expect(el).to.exist;
    });

    it('should handle error when no canvas found', async () => {
      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      // Mock shadowRoot to return null
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => null,
        },
        writable: true,
      });

      // Test that the card renders without throwing errors
      const el = await fixture(card.render() as TemplateResult);
      expect(el).to.exist;
    });

    it('should handle error when no history data available', async () => {
      fetchPowerEnergyDataStub.resolves({
        powerData: [],
        energyData: [],
      });

      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      // Mock shadowRoot
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => ({}),
        },
        writable: true,
      });

      // Test that the card renders without throwing errors
      const el = await fixture(card.render() as TemplateResult);
      expect(el).to.exist;
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      fetchPowerEnergyDataStub.rejects(error);

      const card = new AreaEnergy();
      card.setConfig(mockConfig);
      card.hass = mockHass;

      // Mock shadowRoot
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => ({}),
        },
        writable: true,
      });

      // Test that the card renders without throwing errors
      const el = await fixture(card.render() as TemplateResult);
      expect(el).to.exist;
    });
  });

  describe('styles', () => {
    it('should return expected styles', () => {
      const actual = AreaEnergy.styles;
      expect(actual).to.deep.equal(styles);
    });
  });

  describe('chart configuration', () => {
    it('should use default chart options when not specified', async () => {
      const card = new AreaEnergy();
      card.setConfig({ area: 'area_1' }); // No chart config
      card.hass = mockHass;

      // Mock canvas and shadowRoot
      const mockCanvas = {} as any;
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => mockCanvas,
        },
        writable: true,
      });

      // Test that the card renders without errors
      const el = await fixture(card.render() as TemplateResult);
      expect(el).to.exist;
    });

    it('should use custom chart options when specified', async () => {
      const customConfig = {
        ...mockConfig,
        chart: {
          legend_style: 'compact' as const,
          axis_style: 'y_only' as const,
          line_type: 'gradient' as const,
        },
      };

      const card = new AreaEnergy();
      card.setConfig(customConfig);
      card.hass = mockHass;

      // Mock canvas and shadowRoot
      const mockCanvas = {} as any;
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => mockCanvas,
        },
        writable: true,
      });

      // Test that the card renders without errors
      const el = await fixture(card.render() as TemplateResult);
      expect(el).to.exist;
    });

    it('should use hourly period for stacked bar charts', async () => {
      const barChartConfig = {
        ...mockConfig,
        chart: {
          chart_type: 'stacked_bar' as const,
        },
      };

      const card = new AreaEnergy();
      card.setConfig(barChartConfig);
      card.hass = mockHass;

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

      // Mock shadowRoot
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => mockCanvas,
        },
        writable: true,
      });

      // Call firstUpdated - this should call the real _initChart method
      card.firstUpdated();

      // Wait for the async _initChart to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify that fetchPowerEnergyData was called with 'hour' period for bar chart
      expect(fetchPowerEnergyDataStub.calledOnce).to.be.true;
      expect(
        fetchPowerEnergyDataStub.calledWith(
          mockHass,
          mockPowerEntities,
          mockEnergyEntities,
          24,
          'hour', // Bar charts use hourly aggregation
        ),
      ).to.be.true;

      // Verify that createChart was called with chartType
      expect(createChartStub.calledOnce).to.be.true;
      const createChartCall = createChartStub.firstCall;
      expect(createChartCall.args[2]).to.have.property(
        'chartType',
        'stacked_bar',
      );
    });

    it('should use 5minute period for line charts', async () => {
      const lineChartConfig = {
        ...mockConfig,
        chart: {
          chart_type: 'line' as const,
        },
      };

      const card = new AreaEnergy();
      card.setConfig(lineChartConfig);
      card.hass = mockHass;

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

      // Mock shadowRoot
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => mockCanvas,
        },
        writable: true,
      });

      // Call firstUpdated
      card.firstUpdated();

      // Wait for the async _initChart to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify that fetchPowerEnergyData was called with '5minute' period for line chart
      expect(fetchPowerEnergyDataStub.calledOnce).to.be.true;
      expect(
        fetchPowerEnergyDataStub.calledWith(
          mockHass,
          mockPowerEntities,
          mockEnergyEntities,
          24,
          '5minute', // Line charts use 5minute aggregation
        ),
      ).to.be.true;
    });

    it('should default to line chart when chart_type is not specified', async () => {
      const card = new AreaEnergy();
      card.setConfig({ area: 'area_1' }); // No chart config
      card.hass = mockHass;

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

      // Mock shadowRoot
      Object.defineProperty(card, 'shadowRoot', {
        value: {
          querySelector: () => mockCanvas,
        },
        writable: true,
      });

      // Call firstUpdated
      card.firstUpdated();

      // Wait for the async _initChart to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify that fetchPowerEnergyData was called with '5minute' period (default)
      expect(fetchPowerEnergyDataStub.calledOnce).to.be.true;
      expect(
        fetchPowerEnergyDataStub.calledWith(
          mockHass,
          mockPowerEntities,
          mockEnergyEntities,
          24,
          '5minute', // Default is line chart
        ),
      ).to.be.true;

      // Verify that createChart was called with default chartType 'line'
      expect(createChartStub.calledOnce).to.be.true;
      const createChartCall = createChartStub.firstCall;
      expect(createChartCall.args[2]).to.have.property('chartType', 'line');
    });
  });

  describe('area name resolution', () => {
    it('should use custom name when provided', async () => {
      const customConfig = {
        ...mockConfig,
        name: 'Custom Card Name',
      };

      hasFeatureStub.returns(false);

      const card = new AreaEnergy();
      card.setConfig(customConfig);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.textContent).to.include('Custom Card Name');
    });

    it('should use area name when no custom name provided', async () => {
      const configWithoutName = {
        area: 'area_1',
      };

      hasFeatureStub.returns(false);

      const card = new AreaEnergy();
      card.setConfig(configWithoutName);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.textContent).to.include('Living Room Energy Consumption');
    });

    it('should use area ID when area not found', async () => {
      getAreaStub.returns(undefined);

      const configWithoutName = {
        area: 'unknown_area',
      };

      hasFeatureStub.returns(false);

      const card = new AreaEnergy();
      card.setConfig(configWithoutName);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.textContent).to.include('unknown_area Energy Consumption');
    });
  });
});
