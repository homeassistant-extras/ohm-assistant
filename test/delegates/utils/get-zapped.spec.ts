import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { getZapped } from '../../../src/delegates/utils/get-zapped';
import type { HomeAssistant } from '../../../src/hass/types';
import type { Config } from '../../../src/types/config';
import { createState, createStateEntity } from '../../test-helpers';

// Helper function to create mock entity registry entry
const createMockEntity = (
  entityId: string,
  areaId: string,
  deviceId: string,
) => ({
  entity_id: entityId,
  name: entityId,
  device_id: deviceId,
  area_id: areaId,
  labels: [],
  platform: 'test',
});

// Helper function to create mock device registry entry
const createMockDevice = (deviceId: string, areaId: string) => ({
  id: deviceId,
  area_id: areaId,
  name: deviceId,
  name_by_user: null,
});

describe('getZapped', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getDeviceStub: sinon.SinonStub;
  let getStateStub: sinon.SinonStub;
  let stateActiveStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;

  beforeEach(() => {
    // Create mock Home Assistant instance
    mockHass = {
      entities: {},
      devices: {},
      states: {},
    } as any;

    // Create mock config
    mockConfig = {
      area: 'living_room',
      entities: [],
    };

    // Stub the imported functions
    getDeviceStub = sinon.stub();
    getStateStub = sinon.stub();
    stateActiveStub = sinon.stub();
    hasFeatureStub = sinon.stub();

    // Import and stub the modules
    const getZappedModule = require('../../../src/delegates/utils/get-zapped');
    const deviceModule = require('../../../src/delegates/retrievers/device');
    const stateModule = require('../../../src/delegates/retrievers/state');
    const stateActiveModule = require('../../../src/hass/common/entity/state_active');
    const featureModule = require('../../../src/config/feature');

    sinon.stub(deviceModule, 'getDevice').callsFake(getDeviceStub);
    sinon.stub(stateModule, 'getState').callsFake(getStateStub);
    sinon.stub(stateActiveModule, 'stateActive').callsFake(stateActiveStub);
    sinon.stub(featureModule, 'hasFeature').callsFake(hasFeatureStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('basic functionality', () => {
    it('should return empty arrays when no entities exist', () => {
      hasFeatureStub.returns(false);

      const result = getZapped(mockHass, mockConfig);

      expect(result).to.deep.equal({
        powerEntities: [],
        energyEntities: [],
        activeLights: 0,
        activeSwitches: 0,
      });
    });

    it('should process power entities from area', () => {
      hasFeatureStub.returns(false);

      const powerEntity = createMockEntity(
        'sensor.living_room_power',
        'living_room',
        'device1',
      );
      const powerState = createStateEntity(
        'sensor',
        'living_room_power',
        'on',
        {
          device_class: 'power',
        },
      );

      mockHass.entities = { 'sensor.living_room_power': powerEntity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };
      mockHass.states = {
        'sensor.living_room_power': createState('sensor', 'living_room_power'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(powerState);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(1);
      expect(result.powerEntities[0]).to.deep.equal(powerState);
      expect(result.energyEntities).to.have.length(0);
    });

    it('should process energy entities from area', () => {
      hasFeatureStub.returns(false);

      const energyEntity = createMockEntity(
        'sensor.living_room_energy',
        'living_room',
        'device1',
      );
      const energyState = createStateEntity(
        'sensor',
        'living_room_energy',
        'on',
        {
          device_class: 'energy',
        },
      );

      mockHass.entities = { 'sensor.living_room_energy': energyEntity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };
      mockHass.states = {
        'sensor.living_room_energy': createState(
          'sensor',
          'living_room_energy',
        ),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(energyState);

      const result = getZapped(mockHass, mockConfig);

      expect(result.energyEntities).to.have.length(1);
      expect(result.energyEntities[0]).to.deep.equal(energyState);
      expect(result.powerEntities).to.have.length(0);
    });

    it('should process both power and energy entities', () => {
      hasFeatureStub.returns(false);

      const powerEntity = createMockEntity(
        'sensor.living_room_power',
        'living_room',
        'device1',
      );
      const energyEntity = createMockEntity(
        'sensor.living_room_energy',
        'living_room',
        'device2',
      );

      const powerState = createStateEntity(
        'sensor',
        'living_room_power',
        'on',
        {
          device_class: 'power',
        },
      );

      const energyState = createStateEntity(
        'sensor',
        'living_room_energy',
        'on',
        {
          device_class: 'energy',
        },
      );

      mockHass.entities = {
        'sensor.living_room_power': powerEntity,
        'sensor.living_room_energy': energyEntity,
      };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
        device2: createMockDevice('device2', 'living_room'),
      };
      mockHass.states = {
        'sensor.living_room_power': createState('sensor', 'living_room_power'),
        'sensor.living_room_energy': createState(
          'sensor',
          'living_room_energy',
        ),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.onFirstCall().returns(powerState);
      getStateStub.onSecondCall().returns(energyState);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(1);
      expect(result.energyEntities).to.have.length(1);
      expect(result.powerEntities[0]).to.deep.equal(powerState);
      expect(result.energyEntities[0]).to.deep.equal(energyState);
    });
  });

  describe('area filtering', () => {
    it('should only include entities from the specified area', () => {
      hasFeatureStub.returns(false);

      const livingRoomEntity = createMockEntity(
        'sensor.living_room_power',
        'living_room',
        'device1',
      );
      const kitchenEntity = createMockEntity(
        'sensor.kitchen_power',
        'kitchen',
        'device2',
      );

      const livingRoomState = createStateEntity(
        'sensor',
        'living_room_power',
        'on',
        {
          device_class: 'power',
        },
      );

      const kitchenState = createStateEntity('sensor', 'kitchen_power', 'on', {
        device_class: 'power',
      });

      mockHass.entities = {
        'sensor.living_room_power': livingRoomEntity,
        'sensor.kitchen_power': kitchenEntity,
      };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
        device2: createMockDevice('device2', 'kitchen'),
      };
      mockHass.states = {
        'sensor.living_room_power': createState('sensor', 'living_room_power'),
        'sensor.kitchen_power': createState('sensor', 'kitchen_power'),
      };

      getDeviceStub
        .onFirstCall()
        .returns(createMockDevice('device1', 'living_room'));
      getDeviceStub
        .onSecondCall()
        .returns(createMockDevice('device2', 'kitchen'));
      getStateStub.onFirstCall().returns(livingRoomState);
      getStateStub.onSecondCall().returns(kitchenState);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(1);
      expect(result.powerEntities[0]).to.deep.equal(livingRoomState);
    });

    it('should include entities by device area_id when entity area_id is null', () => {
      hasFeatureStub.returns(false);

      const entity = createMockEntity('sensor.device_power', null, 'device1');
      const state = createStateEntity('sensor', 'device_power', 'on', {
        device_class: 'power',
      });

      mockHass.entities = { 'sensor.device_power': entity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };
      mockHass.states = {
        'sensor.device_power': createState('sensor', 'device_power'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(state);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(1);
      expect(result.powerEntities[0]).to.deep.equal(state);
    });

    it('should exclude entities not in the specified area', () => {
      hasFeatureStub.returns(false);

      const entity = createMockEntity(
        'sensor.other_room_power',
        'other_room',
        'device1',
      );

      mockHass.entities = { 'sensor.other_room_power': entity };
      mockHass.devices = { device1: createMockDevice('device1', 'other_room') };

      getDeviceStub.returns(createMockDevice('device1', 'other_room'));

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(0);
      expect(result.energyEntities).to.have.length(0);
    });
  });

  describe('explicitly configured entities', () => {
    it('should always include entities specified in config.entities', () => {
      hasFeatureStub.returns(false);

      const configWithEntities: Config = {
        area: 'living_room',
        entities: ['sensor.custom_power', 'sensor.custom_energy'],
      };

      const powerEntity = createMockEntity(
        'sensor.custom_power',
        'other_room',
        'device1',
      );
      const energyEntity = createMockEntity(
        'sensor.custom_energy',
        'other_room',
        'device2',
      );

      const powerState = createStateEntity('sensor', 'custom_power', 'on', {
        device_class: 'power',
      });

      const energyState = createStateEntity('sensor', 'custom_energy', 'on', {
        device_class: 'energy',
      });

      mockHass.entities = {
        'sensor.custom_power': powerEntity,
        'sensor.custom_energy': energyEntity,
      };
      mockHass.devices = {
        device1: createMockDevice('device1', 'other_room'),
        device2: createMockDevice('device2', 'other_room'),
      };
      mockHass.states = {
        'sensor.custom_power': createState('sensor', 'custom_power'),
        'sensor.custom_energy': createState('sensor', 'custom_energy'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'other_room'));
      getStateStub.onFirstCall().returns(powerState);
      getStateStub.onSecondCall().returns(energyState);

      const result = getZapped(mockHass, configWithEntities);

      expect(result.powerEntities).to.have.length(1);
      expect(result.energyEntities).to.have.length(1);
      expect(result.powerEntities[0]).to.deep.equal(powerState);
      expect(result.energyEntities[0]).to.deep.equal(energyState);
    });

    it('should include config entities even when they have no device_class', () => {
      hasFeatureStub.returns(false);

      const configWithEntities: Config = {
        area: 'living_room',
        entities: ['sensor.custom_entity'],
      };

      const entity = createMockEntity(
        'sensor.custom_entity',
        'other_room',
        'device1',
      );
      const state = createStateEntity('sensor', 'custom_entity', 'on', {});

      mockHass.entities = { 'sensor.custom_entity': entity };
      mockHass.devices = { device1: createMockDevice('device1', 'other_room') };
      mockHass.states = {
        'sensor.custom_entity': createState('sensor', 'custom_entity'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'other_room'));
      getStateStub.returns(state);

      const result = getZapped(mockHass, configWithEntities);

      // Should not be included in power or energy arrays since no device_class
      expect(result.powerEntities).to.have.length(0);
      expect(result.energyEntities).to.have.length(0);
    });
  });

  describe('exclude_default_entities feature', () => {
    it('should exclude default entities when feature is enabled', () => {
      hasFeatureStub.returns(true); // exclude_default_entities enabled

      const entity = createMockEntity(
        'sensor.living_room_power',
        'living_room',
        'device1',
      );
      const state = createStateEntity('sensor', 'living_room_power', 'on', {
        device_class: 'power',
      });

      mockHass.entities = { 'sensor.living_room_power': entity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };
      mockHass.states = {
        'sensor.living_room_power': createState('sensor', 'living_room_power'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(state);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(0);
      expect(result.energyEntities).to.have.length(0);
    });

    it('should still include config entities when exclude_default_entities is enabled', () => {
      hasFeatureStub.returns(true); // exclude_default_entities enabled

      const configWithEntities: Config = {
        area: 'living_room',
        entities: ['sensor.custom_power'],
      };

      const entity = createMockEntity(
        'sensor.custom_power',
        'other_room',
        'device1',
      );
      const state = createStateEntity('sensor', 'custom_power', 'on', {
        device_class: 'power',
      });

      mockHass.entities = { 'sensor.custom_power': entity };
      mockHass.devices = { device1: createMockDevice('device1', 'other_room') };
      mockHass.states = {
        'sensor.custom_power': createState('sensor', 'custom_power'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'other_room'));
      getStateStub.returns(state);

      const result = getZapped(mockHass, configWithEntities);

      expect(result.powerEntities).to.have.length(1);
      expect(result.powerEntities[0]).to.deep.equal(state);
    });
  });

  describe('active lights and switches counting', () => {
    it('should count active lights in the area', () => {
      hasFeatureStub.returns(false);

      const lightEntity = createMockEntity(
        'light.living_room_light',
        'living_room',
        'device1',
      );
      const lightState = createStateEntity(
        'light',
        'living_room_light',
        'on',
        {},
      );

      mockHass.entities = { 'light.living_room_light': lightEntity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };
      mockHass.states = {
        'light.living_room_light': createState(
          'light',
          'living_room_light',
          'on',
        ),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(lightState);
      stateActiveStub.returns(true);

      const result = getZapped(mockHass, mockConfig);

      expect(result.activeLights).to.equal(1);
      expect(result.activeSwitches).to.equal(0);
    });

    it('should count active switches in the area', () => {
      hasFeatureStub.returns(false);

      const switchEntity = createMockEntity(
        'switch.living_room_switch',
        'living_room',
        'device1',
      );
      const switchState = createStateEntity(
        'switch',
        'living_room_switch',
        'on',
        {},
      );

      mockHass.entities = { 'switch.living_room_switch': switchEntity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };
      mockHass.states = {
        'switch.living_room_switch': createState(
          'switch',
          'living_room_switch',
          'on',
        ),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(switchState);
      stateActiveStub.returns(true);

      const result = getZapped(mockHass, mockConfig);

      expect(result.activeLights).to.equal(0);
      expect(result.activeSwitches).to.equal(1);
    });

    it('should count both active lights and switches', () => {
      hasFeatureStub.returns(false);

      const lightEntity = createMockEntity(
        'light.living_room_light',
        'living_room',
        'device1',
      );
      const switchEntity = createMockEntity(
        'switch.living_room_switch',
        'living_room',
        'device2',
      );

      const lightState = createStateEntity(
        'light',
        'living_room_light',
        'on',
        {},
      );
      const switchState = createStateEntity(
        'switch',
        'living_room_switch',
        'on',
        {},
      );

      mockHass.entities = {
        'light.living_room_light': lightEntity,
        'switch.living_room_switch': switchEntity,
      };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
        device2: createMockDevice('device2', 'living_room'),
      };
      mockHass.states = {
        'light.living_room_light': createState(
          'light',
          'living_room_light',
          'on',
        ),
        'switch.living_room_switch': createState(
          'switch',
          'living_room_switch',
          'on',
        ),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.onFirstCall().returns(lightState);
      getStateStub.onSecondCall().returns(switchState);
      stateActiveStub.returns(true);

      const result = getZapped(mockHass, mockConfig);

      expect(result.activeLights).to.equal(1);
      expect(result.activeSwitches).to.equal(1);
    });

    it('should not count inactive lights and switches', () => {
      hasFeatureStub.returns(false);

      const lightEntity = createMockEntity(
        'light.living_room_light',
        'living_room',
        'device1',
      );
      const switchEntity = createMockEntity(
        'switch.living_room_switch',
        'living_room',
        'device2',
      );

      const lightState = createStateEntity(
        'light',
        'living_room_light',
        'off',
        {},
      );
      const switchState = createStateEntity(
        'switch',
        'living_room_switch',
        'off',
        {},
      );

      mockHass.entities = {
        'light.living_room_light': lightEntity,
        'switch.living_room_switch': switchEntity,
      };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
        device2: createMockDevice('device2', 'living_room'),
      };
      mockHass.states = {
        'light.living_room_light': createState(
          'light',
          'living_room_light',
          'off',
        ),
        'switch.living_room_switch': createState(
          'switch',
          'living_room_switch',
          'off',
        ),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.onFirstCall().returns(lightState);
      getStateStub.onSecondCall().returns(switchState);
      stateActiveStub.returns(false);

      const result = getZapped(mockHass, mockConfig);

      expect(result.activeLights).to.equal(0);
      expect(result.activeSwitches).to.equal(0);
    });

    it('should count active lights and switches from config entities', () => {
      hasFeatureStub.returns(false);

      const configWithEntities: Config = {
        area: 'living_room',
        entities: ['light.custom_light', 'switch.custom_switch'],
      };

      const lightEntity = createMockEntity(
        'light.custom_light',
        'other_room',
        'device1',
      );
      const switchEntity = createMockEntity(
        'switch.custom_switch',
        'other_room',
        'device2',
      );

      const lightState = createStateEntity('light', 'custom_light', 'on', {});
      const switchState = createStateEntity(
        'switch',
        'custom_switch',
        'on',
        {},
      );

      mockHass.entities = {
        'light.custom_light': lightEntity,
        'switch.custom_switch': switchEntity,
      };
      mockHass.devices = {
        device1: createMockDevice('device1', 'other_room'),
        device2: createMockDevice('device2', 'other_room'),
      };
      mockHass.states = {
        'light.custom_light': createState('light', 'custom_light', 'on'),
        'switch.custom_switch': createState('switch', 'custom_switch', 'on'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'other_room'));
      getStateStub.onFirstCall().returns(lightState);
      getStateStub.onSecondCall().returns(switchState);
      stateActiveStub.returns(true);

      const result = getZapped(mockHass, configWithEntities);

      expect(result.activeLights).to.equal(1);
      expect(result.activeSwitches).to.equal(1);
    });
  });

  describe('edge cases', () => {
    it('should handle entities with no state', () => {
      hasFeatureStub.returns(false);

      const entity = createMockEntity(
        'sensor.living_room_power',
        'living_room',
        'device1',
      );

      mockHass.entities = { 'sensor.living_room_power': entity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(null);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(0);
      expect(result.energyEntities).to.have.length(0);
    });

    it('should handle entities with no device', () => {
      hasFeatureStub.returns(false);

      const entity = createMockEntity(
        'sensor.living_room_power',
        'living_room',
        null,
      );

      mockHass.entities = { 'sensor.living_room_power': entity };
      mockHass.devices = {};

      getDeviceStub.returns(null);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(0);
      expect(result.energyEntities).to.have.length(0);
    });

    it('should handle entities with no hass state for active counting', () => {
      hasFeatureStub.returns(false);

      const lightEntity = createMockEntity(
        'light.living_room_light',
        'living_room',
        'device1',
      );
      const lightState = createStateEntity(
        'light',
        'living_room_light',
        'on',
        {},
      );

      mockHass.entities = { 'light.living_room_light': lightEntity };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
      };
      mockHass.states = {}; // No state in hass.states

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.returns(lightState);

      const result = getZapped(mockHass, mockConfig);

      expect(result.activeLights).to.equal(0);
      expect(result.activeSwitches).to.equal(0);
    });

    it('should handle mixed device_class entities', () => {
      hasFeatureStub.returns(false);

      const powerEntity = createMockEntity(
        'sensor.living_room_power',
        'living_room',
        'device1',
      );
      const energyEntity = createMockEntity(
        'sensor.living_room_energy',
        'living_room',
        'device2',
      );
      const otherEntity = createMockEntity(
        'sensor.living_room_other',
        'living_room',
        'device3',
      );

      const powerState = createStateEntity(
        'sensor',
        'living_room_power',
        'on',
        {
          device_class: 'power',
        },
      );

      const energyState = createStateEntity(
        'sensor',
        'living_room_energy',
        'on',
        {
          device_class: 'energy',
        },
      );

      const otherState = createStateEntity(
        'sensor',
        'living_room_other',
        'on',
        {
          device_class: 'temperature',
        },
      );

      mockHass.entities = {
        'sensor.living_room_power': powerEntity,
        'sensor.living_room_energy': energyEntity,
        'sensor.living_room_other': otherEntity,
      };
      mockHass.devices = {
        device1: createMockDevice('device1', 'living_room'),
        device2: createMockDevice('device2', 'living_room'),
        device3: createMockDevice('device3', 'living_room'),
      };
      mockHass.states = {
        'sensor.living_room_power': createState('sensor', 'living_room_power'),
        'sensor.living_room_energy': createState(
          'sensor',
          'living_room_energy',
        ),
        'sensor.living_room_other': createState('sensor', 'living_room_other'),
      };

      getDeviceStub.returns(createMockDevice('device1', 'living_room'));
      getStateStub.onFirstCall().returns(powerState);
      getStateStub.onSecondCall().returns(energyState);
      getStateStub.onThirdCall().returns(otherState);

      const result = getZapped(mockHass, mockConfig);

      expect(result.powerEntities).to.have.length(1);
      expect(result.energyEntities).to.have.length(1);
      expect(result.powerEntities[0]).to.deep.equal(powerState);
      expect(result.energyEntities[0]).to.deep.equal(energyState);
    });
  });
});
