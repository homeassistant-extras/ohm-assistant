import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import {
  fetchEntityStatistics,
  fetchPowerEnergyData,
  fetchRecentStatistics,
  getAreaEntities,
  getEntityColorMap,
  getEntityIds,
} from '../../src/common/helpers';
import type { HomeAssistant } from '../../src/hass/types';
import type { Config } from '../../src/types/config';

describe('helpers', () => {
  let mockHass: HomeAssistant;
  let callWSStub: sinon.SinonStub;
  let consoleWarnStub: sinon.SinonStub;
  let consoleErrorStub: sinon.SinonStub;

  beforeEach(() => {
    // Create a mock Home Assistant instance
    callWSStub = sinon.stub();
    mockHass = {
      states: {},
      callWS: callWSStub,
    } as any;

    // Stub console methods to suppress output during tests
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('fetchEntityStatistics', () => {
    it('should return empty array when entity does not exist', async () => {
      const result = await fetchEntityStatistics(
        mockHass,
        'nonexistent.entity',
        new Date(),
      );

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should fetch statistics successfully with valid data', async () => {
      // Mock entity exists
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      // Mock successful API response
      const mockStatsData = {
        'sensor.test_power': [
          {
            start: 1640995200, // 2022-01-01 00:00:00 in seconds
            end: 1640995500,
            mean: 100.5,
            min: 95.0,
            max: 105.0,
          },
          {
            start: 1640995500,
            end: 1640995800,
            mean: 110.2,
            min: 108.0,
            max: 112.0,
          },
        ],
      };

      callWSStub.resolves(mockStatsData);

      const startTime = new Date('2022-01-01T00:00:00Z');
      const result = await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        startTime,
      );

      expect(result).to.be.an('array');
      expect(result).to.have.length(2);
      expect(result[0]).to.deep.include({
        value: 100.5,
      });
      expect(result[1]).to.deep.include({
        value: 110.2,
      });
      expect(result[0].timestamp).to.be.instanceOf(Date);
      expect(result[1].timestamp).to.be.instanceOf(Date);
    });

    it('should handle different value types (mean, state, sum)', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      const mockStatsData = {
        'sensor.test_power': [
          {
            start: 1640995200,
            end: 1640995500,
            mean: 100.0,
          },
          {
            start: 1640995500,
            end: 1640995800,
            state: 200.0,
          },
          {
            start: 1640995800,
            end: 1640996100,
            sum: 300.0,
          },
        ],
      };

      callWSStub.resolves(mockStatsData);

      const result = await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        new Date(),
      );

      expect(result).to.have.length(3);
      expect(result[0].value).to.equal(100.0);
      expect(result[1].value).to.equal(200.0);
      expect(result[2].value).to.equal(300.0);
    });

    it('should handle milliseconds timestamps correctly', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      const mockStatsData = {
        'sensor.test_power': [
          {
            start: 1640995200000, // Already in milliseconds
            end: 1640995500000,
            mean: 100.0,
          },
        ],
      };

      callWSStub.resolves(mockStatsData);

      const result = await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        new Date(),
      );

      expect(result).to.have.length(1);
      expect(result[0].timestamp).to.be.instanceOf(Date);
      expect(result[0].timestamp.getTime()).to.equal(1640995200000);
    });

    it('should handle seconds timestamps correctly', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      const mockStatsData = {
        'sensor.test_power': [
          {
            start: 1640995200, // In seconds
            end: 1640995500,
            mean: 100.0,
          },
        ],
      };

      callWSStub.resolves(mockStatsData);

      const result = await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        new Date(),
      );

      expect(result).to.have.length(1);
      expect(result[0].timestamp).to.be.instanceOf(Date);
      expect(result[0].timestamp.getTime()).to.equal(1640995200000);
    });

    it('should filter out invalid values', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      const mockStatsData = {
        'sensor.test_power': [
          {
            start: 1640995200,
            end: 1640995500,
            mean: 100.0,
          },
          {
            start: 1640995500,
            end: 1640995800,
            mean: NaN,
          },
          {
            start: 1640995800,
            end: 1640996100,
            mean: null,
          },
          {
            start: 1640996100,
            end: 1640996400,
            mean: 200.0,
          },
        ],
      };

      callWSStub.resolves(mockStatsData);

      const result = await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        new Date(),
      );

      expect(result).to.have.length(2);
      expect(result[0].value).to.equal(100.0);
      expect(result[1].value).to.equal(200.0);
    });

    it('should return empty array when no statistics data', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.resolves({});

      const result = await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        new Date(),
      );

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should handle API errors gracefully', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.rejects(new Error('API Error'));

      const result = await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        new Date(),
      );

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should use correct API parameters', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.resolves({});

      const startTime = new Date('2022-01-01T00:00:00Z');
      const endTime = new Date('2022-01-02T00:00:00Z');

      await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        startTime,
        endTime,
        'hour',
      );

      expect(callWSStub.calledOnce).to.be.true;
      const callArgs = callWSStub.getCall(0).args[0];
      expect(callArgs).to.deep.include({
        type: 'recorder/statistics_during_period',
        start_time: '2022-01-01T00:00:00.000Z',
        end_time: '2022-01-02T00:00:00.000Z',
        statistic_ids: ['sensor.test_power'],
        period: 'hour',
      });
    });

    it('should handle string dates correctly', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.resolves({});

      await fetchEntityStatistics(
        mockHass,
        'sensor.test_power',
        '2022-01-01T00:00:00Z',
        '2022-01-02T00:00:00Z',
      );

      expect(callWSStub.calledOnce).to.be.true;
      const callArgs = callWSStub.getCall(0).args[0];
      expect(callArgs.start_time).to.equal('2022-01-01T00:00:00Z');
      expect(callArgs.end_time).to.equal('2022-01-02T00:00:00Z');
    });

    it('should default end time to now when not provided', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.resolves({});

      const startTime = new Date('2022-01-01T00:00:00Z');
      const beforeCall = new Date();

      await fetchEntityStatistics(mockHass, 'sensor.test_power', startTime);

      const afterCall = new Date();
      const callArgs = callWSStub.getCall(0).args[0];
      const endTime = new Date(callArgs.end_time);

      expect(endTime.getTime()).to.be.at.least(beforeCall.getTime());
      expect(endTime.getTime()).to.be.at.most(afterCall.getTime());
    });
  });

  describe('fetchRecentStatistics', () => {
    it('should fetch statistics for the specified number of hours', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      const mockStatsData = {
        'sensor.test_power': [
          {
            start: 1640995200,
            end: 1640995500,
            mean: 100.0,
          },
        ],
      };

      callWSStub.resolves(mockStatsData);

      const result = await fetchRecentStatistics(
        mockHass,
        'sensor.test_power',
        24,
      );

      expect(result).to.be.an('array');
      expect(callWSStub.calledOnce).to.be.true;

      const callArgs = callWSStub.getCall(0).args[0];
      const startTime = new Date(callArgs.start_time);
      const endTime = new Date(callArgs.end_time);
      const hoursDiff =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      expect(hoursDiff).to.be.closeTo(24, 0.1);
    });

    it('should use default period of 5minute', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.resolves({});

      await fetchRecentStatistics(mockHass, 'sensor.test_power', 12);

      const callArgs = callWSStub.getCall(0).args[0];
      expect(callArgs.period).to.equal('5minute');
    });

    it('should use custom period when provided', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.resolves({});

      await fetchRecentStatistics(mockHass, 'sensor.test_power', 12, 'hour');

      const callArgs = callWSStub.getCall(0).args[0];
      expect(callArgs.period).to.equal('hour');
    });

    it('should handle different hour values correctly', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.resolves({});

      // Test 1 hour
      await fetchRecentStatistics(mockHass, 'sensor.test_power', 1);
      let callArgs = callWSStub.getCall(0).args[0];
      let startTime = new Date(callArgs.start_time);
      let endTime = new Date(callArgs.end_time);
      let hoursDiff =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).to.be.closeTo(1, 0.1);

      callWSStub.reset();

      // Test 48 hours
      await fetchRecentStatistics(mockHass, 'sensor.test_power', 48);
      callArgs = callWSStub.getCall(0).args[0];
      startTime = new Date(callArgs.start_time);
      endTime = new Date(callArgs.end_time);
      hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).to.be.closeTo(48, 0.1);
    });

    it('should return empty array when entity does not exist', async () => {
      const result = await fetchRecentStatistics(
        mockHass,
        'nonexistent.entity',
        24,
      );

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should handle API errors gracefully', async () => {
      mockHass.states['sensor.test_power'] = {
        entity_id: 'sensor.test_power',
      } as any;

      callWSStub.rejects(new Error('API Error'));

      const result = await fetchRecentStatistics(
        mockHass,
        'sensor.test_power',
        24,
      );

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });
  });

  describe('getAreaEntities', () => {
    it('should return entities that belong to the specified area by entity area_id', () => {
      const mockHass = {
        entities: {
          'sensor.living_room_power': {
            entity_id: 'sensor.living_room_power',
            area_id: 'living_room',
            device_id: 'device1',
          },
          'sensor.kitchen_power': {
            entity_id: 'sensor.kitchen_power',
            area_id: 'kitchen',
            device_id: 'device2',
          },
          'sensor.living_room_energy': {
            entity_id: 'sensor.living_room_energy',
            area_id: 'living_room',
            device_id: 'device3',
          },
        },
        devices: {
          device1: { area_id: 'living_room' },
          device2: { area_id: 'kitchen' },
          device3: { area_id: 'living_room' },
        },
      } as any;

      const result = getAreaEntities(mockHass, 'living_room');

      expect(result).to.be.an('array');
      expect(result).to.have.length(2);
      expect(result).to.include('sensor.living_room_power');
      expect(result).to.include('sensor.living_room_energy');
      expect(result).to.not.include('sensor.kitchen_power');
    });

    it('should return entities that belong to the specified area by device area_id', () => {
      const mockHass = {
        entities: {
          'sensor.device_power': {
            entity_id: 'sensor.device_power',
            area_id: null, // Entity has no area_id
            device_id: 'device1',
          },
          'sensor.other_power': {
            entity_id: 'sensor.other_power',
            area_id: 'other_area',
            device_id: 'device2',
          },
        },
        devices: {
          device1: { area_id: 'target_area' },
          device2: { area_id: 'other_area' },
        },
      } as any;

      const result = getAreaEntities(mockHass, 'target_area');

      expect(result).to.be.an('array');
      expect(result).to.have.length(1);
      expect(result).to.include('sensor.device_power');
      expect(result).to.not.include('sensor.other_power');
    });

    it('should return entities that match either entity area_id or device area_id', () => {
      const mockHass = {
        entities: {
          'sensor.entity_area_power': {
            entity_id: 'sensor.entity_area_power',
            area_id: 'target_area',
            device_id: 'device1',
          },
          'sensor.device_area_power': {
            entity_id: 'sensor.device_area_power',
            area_id: null,
            device_id: 'device2',
          },
          'sensor.both_area_power': {
            entity_id: 'sensor.both_area_power',
            area_id: 'target_area',
            device_id: 'device3',
          },
          'sensor.no_match_power': {
            entity_id: 'sensor.no_match_power',
            area_id: 'other_area',
            device_id: 'device4',
          },
        },
        devices: {
          device1: { area_id: 'other_area' },
          device2: { area_id: 'target_area' },
          device3: { area_id: 'target_area' },
          device4: { area_id: 'other_area' },
        },
      } as any;

      const result = getAreaEntities(mockHass, 'target_area');

      expect(result).to.be.an('array');
      expect(result).to.have.length(3);
      expect(result).to.include('sensor.entity_area_power');
      expect(result).to.include('sensor.device_area_power');
      expect(result).to.include('sensor.both_area_power');
      expect(result).to.not.include('sensor.no_match_power');
    });

    it('should return empty array when no entities match the area', () => {
      const mockHass = {
        entities: {
          'sensor.other_power': {
            entity_id: 'sensor.other_power',
            area_id: 'other_area',
            device_id: 'device1',
          },
        },
        devices: {
          device1: { area_id: 'other_area' },
        },
      } as any;

      const result = getAreaEntities(mockHass, 'target_area');

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should return empty array when hass has no entities', () => {
      const mockHass = {
        entities: {},
        devices: {},
      } as any;

      const result = getAreaEntities(mockHass, 'target_area');

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should handle entities with undefined area_id and device_id', () => {
      const mockHass = {
        entities: {
          'sensor.no_area_entity': {
            entity_id: 'sensor.no_area_entity',
            area_id: null,
            device_id: null,
          },
          'sensor.valid_entity': {
            entity_id: 'sensor.valid_entity',
            area_id: 'target_area',
            device_id: 'device1',
          },
        },
        devices: {
          device1: { area_id: 'target_area' },
        },
      } as any;

      const result = getAreaEntities(mockHass, 'target_area');

      expect(result).to.be.an('array');
      expect(result).to.have.length(1);
      expect(result).to.include('sensor.valid_entity');
      expect(result).to.not.include('sensor.no_area_entity');
    });

    it('should handle devices with undefined area_id', () => {
      const mockHass = {
        entities: {
          'sensor.device_no_area': {
            entity_id: 'sensor.device_no_area',
            area_id: null,
            device_id: 'device1',
          },
          'sensor.valid_entity': {
            entity_id: 'sensor.valid_entity',
            area_id: 'target_area',
            device_id: 'device2',
          },
        },
        devices: {
          device1: { area_id: null },
          device2: { area_id: 'target_area' },
        },
      } as any;

      const result = getAreaEntities(mockHass, 'target_area');

      expect(result).to.be.an('array');
      expect(result).to.have.length(1);
      expect(result).to.include('sensor.valid_entity');
      expect(result).to.not.include('sensor.device_no_area');
    });

    it('should handle missing device in devices registry', () => {
      const mockHass = {
        entities: {
          'sensor.missing_device': {
            entity_id: 'sensor.missing_device',
            area_id: null,
            device_id: 'missing_device',
          },
          'sensor.valid_entity': {
            entity_id: 'sensor.valid_entity',
            area_id: 'target_area',
            device_id: 'device1',
          },
        },
        devices: {
          device1: { area_id: 'target_area' },
        },
      } as any;

      const result = getAreaEntities(mockHass, 'target_area');

      expect(result).to.be.an('array');
      expect(result).to.have.length(1);
      expect(result).to.include('sensor.valid_entity');
      expect(result).to.not.include('sensor.missing_device');
    });
  });

  describe('fetchPowerEnergyData', () => {
    it('should include friendlyName in returned EntityData', async () => {
      const mockStatsData = {
        'sensor.power1': [{ start: 1640995200, end: 1640995500, mean: 100 }],
        'sensor.energy1': [{ start: 1640995200, end: 1640995500, mean: 1.5 }],
      };

      callWSStub.resolves(mockStatsData);

      const powerEntities = [
        {
          entity_id: 'sensor.power1',
          state: '100',
          attributes: { friendly_name: 'Kitchen Power', device_class: 'power' },
        },
      ] as any;

      const energyEntities = [
        {
          entity_id: 'sensor.energy1',
          state: '1.5',
          attributes: {
            friendly_name: 'Kitchen Energy',
            device_class: 'energy',
          },
        },
      ] as any;

      const result = await fetchPowerEnergyData(
        mockHass,
        powerEntities,
        energyEntities,
        24,
      );

      expect(result.powerData).to.have.length(1);
      expect(result.powerData[0]).to.have.property(
        'friendlyName',
        'Kitchen Power',
      );
      expect(result.powerData[0]).to.have.property('entityId', 'sensor.power1');

      expect(result.energyData).to.have.length(1);
      expect(result.energyData[0]).to.have.property(
        'friendlyName',
        'Kitchen Energy',
      );
      expect(result.energyData[0]).to.have.property(
        'entityId',
        'sensor.energy1',
      );
    });

    it('should fallback to entityId when friendly_name is not set', async () => {
      callWSStub.resolves({});

      const powerEntities = [
        {
          entity_id: 'sensor.power1',
          state: '100',
          attributes: { device_class: 'power' },
        },
      ] as any;

      const result = await fetchPowerEnergyData(
        mockHass,
        powerEntities,
        [],
        24,
      );

      expect(result.powerData).to.have.length(1);
      expect(result.powerData[0]).to.have.property(
        'friendlyName',
        'sensor.power1',
      );
    });
  });

  describe('getEntityIds', () => {
    it('should return empty array when config has no entities', () => {
      const config: Config = {
        area: 'living_room',
      };

      const result = getEntityIds(config);

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should return empty array when entities is undefined', () => {
      const config: Config = {
        area: 'living_room',
        entities: undefined,
      };

      const result = getEntityIds(config);

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should extract entity IDs from string array', () => {
      const config: Config = {
        area: 'living_room',
        entities: ['sensor.power1', 'sensor.power2', 'sensor.energy1'],
      };

      const result = getEntityIds(config);

      expect(result).to.be.an('array');
      expect(result).to.have.length(3);
      expect(result).to.deep.equal([
        'sensor.power1',
        'sensor.power2',
        'sensor.energy1',
      ]);
    });

    it('should extract entity IDs from object array', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          { entity_id: 'sensor.power1', color: '#ff0000' },
          { entity_id: 'sensor.power2', color: '#00ff00' },
          { entity_id: 'sensor.energy1', color: '#0000ff' },
        ],
      };

      const result = getEntityIds(config);

      expect(result).to.be.an('array');
      expect(result).to.have.length(3);
      expect(result).to.deep.equal([
        'sensor.power1',
        'sensor.power2',
        'sensor.energy1',
      ]);
    });

    it('should handle mixed string and object array', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          'sensor.power1',
          { entity_id: 'sensor.power2', color: '#ff0000' },
          'sensor.energy1',
          { entity_id: 'sensor.energy2', color: '#00ff00' },
        ],
      };

      const result = getEntityIds(config);

      expect(result).to.be.an('array');
      expect(result).to.have.length(4);
      expect(result).to.deep.equal([
        'sensor.power1',
        'sensor.power2',
        'sensor.energy1',
        'sensor.energy2',
      ]);
    });

    it('should handle empty entities array', () => {
      const config: Config = {
        area: 'living_room',
        entities: [],
      };

      const result = getEntityIds(config);

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should preserve order of entities', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          'sensor.first',
          { entity_id: 'sensor.second', color: '#ff0000' },
          'sensor.third',
        ],
      };

      const result = getEntityIds(config);

      expect(result[0]).to.equal('sensor.first');
      expect(result[1]).to.equal('sensor.second');
      expect(result[2]).to.equal('sensor.third');
    });
  });

  describe('getEntityColorMap', () => {
    it('should return empty object when config has no entities', () => {
      const config: Config = {
        area: 'living_room',
      };

      const result = getEntityColorMap(config);

      expect(result).to.be.an('object');
      expect(result).to.deep.equal({});
    });

    it('should return empty object when entities is undefined', () => {
      const config: Config = {
        area: 'living_room',
        entities: undefined,
      };

      const result = getEntityColorMap(config);

      expect(result).to.be.an('object');
      expect(result).to.deep.equal({});
    });

    it('should return empty object when entities are all strings', () => {
      const config: Config = {
        area: 'living_room',
        entities: ['sensor.power1', 'sensor.power2', 'sensor.energy1'],
      };

      const result = getEntityColorMap(config);

      expect(result).to.be.an('object');
      expect(result).to.deep.equal({});
    });

    it('should extract colors from object array', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          { entity_id: 'sensor.power1', color: '#ff0000' },
          { entity_id: 'sensor.power2', color: '#00ff00' },
          { entity_id: 'sensor.energy1', color: '#0000ff' },
        ],
      };

      const result = getEntityColorMap(config);

      expect(result).to.be.an('object');
      expect(result).to.deep.equal({
        'sensor.power1': '#ff0000',
        'sensor.power2': '#00ff00',
        'sensor.energy1': '#0000ff',
      });
    });

    it('should handle mixed string and object array', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          'sensor.power1', // No color
          { entity_id: 'sensor.power2', color: '#ff0000' },
          'sensor.energy1', // No color
          { entity_id: 'sensor.energy2', color: '#00ff00' },
        ],
      };

      const result = getEntityColorMap(config);

      expect(result).to.be.an('object');
      expect(result).to.deep.equal({
        'sensor.power2': '#ff0000',
        'sensor.energy2': '#00ff00',
      });
      expect(result).to.not.have.property('sensor.power1');
      expect(result).to.not.have.property('sensor.energy1');
    });

    it('should handle empty entities array', () => {
      const config: Config = {
        area: 'living_room',
        entities: [],
      };

      const result = getEntityColorMap(config);

      expect(result).to.be.an('object');
      expect(result).to.deep.equal({});
    });

    it('should handle rgba color values', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          { entity_id: 'sensor.power1', color: 'rgba(255, 0, 0, 0.8)' },
          { entity_id: 'sensor.power2', color: 'rgba(0, 255, 0, 0.8)' },
        ],
      };

      const result = getEntityColorMap(config);

      expect(result).to.deep.equal({
        'sensor.power1': 'rgba(255, 0, 0, 0.8)',
        'sensor.power2': 'rgba(0, 255, 0, 0.8)',
      });
    });

    it('should handle hex color values', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          { entity_id: 'sensor.power1', color: '#ff0000' },
          { entity_id: 'sensor.power2', color: '#00ff00' },
          { entity_id: 'sensor.power3', color: '#0000ff' },
        ],
      };

      const result = getEntityColorMap(config);

      expect(result).to.deep.equal({
        'sensor.power1': '#ff0000',
        'sensor.power2': '#00ff00',
        'sensor.power3': '#0000ff',
      });
    });

    it('should handle named color values', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          { entity_id: 'sensor.power1', color: 'red' },
          { entity_id: 'sensor.power2', color: 'blue' },
        ],
      };

      const result = getEntityColorMap(config);

      expect(result).to.deep.equal({
        'sensor.power1': 'red',
        'sensor.power2': 'blue',
      });
    });

    it('should handle duplicate entity IDs (last one wins)', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          { entity_id: 'sensor.power1', color: '#ff0000' },
          { entity_id: 'sensor.power1', color: '#00ff00' },
        ],
      };

      const result = getEntityColorMap(config);

      expect(result).to.deep.equal({
        'sensor.power1': '#00ff00',
      });
    });

    it('should only include entities with color property', () => {
      const config: Config = {
        area: 'living_room',
        entities: [
          { entity_id: 'sensor.power1', color: '#ff0000' },
          { entity_id: 'sensor.power2', color: '' }, // No color property
        ],
      };

      const result = getEntityColorMap(config);

      expect(result).to.deep.equal({
        'sensor.power1': '#ff0000',
      });
      expect(result).to.not.have.property('sensor.power2');
    });
  });
});
