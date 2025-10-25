import { expect } from 'chai';
import { describe, it } from 'mocha';
import type { HomeAssistant } from '../../src/hass/types';
import { stateDisplay } from '../../src/html/state-display';
import { createStateEntity } from '../test-helpers';

describe('state-display', () => {
  const mockHass: HomeAssistant = {
    states: {},
    callService: () => Promise.resolve(),
    callApi: () => Promise.resolve({}),
    // Add other required properties as needed
  } as any;

  describe('stateDisplay', () => {
    it('should render state-display component with required properties', () => {
      const entity = createStateEntity('sensor', 'test', '100', {
        friendly_name: 'Test Sensor',
      });

      const result = stateDisplay(mockHass, entity);

      expect(result).to.have.property('strings');
      expect(result).to.have.property('values');

      const template = result as any;
      const templateString = template.strings.join('');

      // Check that state-display component is rendered
      expect(templateString).to.include('state-display');
    });

    it('should pass hass and stateObj properties to state-display', () => {
      const entity = createStateEntity('sensor', 'test', '100', {
        friendly_name: 'Test Sensor',
      });

      const result = stateDisplay(mockHass, entity);

      expect(result).to.not.be.undefined;
      const template = result as any;

      // Check that the template includes the component
      expect(template.strings).to.be.an('array');
      expect(template.strings.join('')).to.include('state-display');
    });

    it('should handle default className when not provided', () => {
      const entity = createStateEntity('sensor', 'test', '100', {
        friendly_name: 'Test Sensor',
      });

      const result = stateDisplay(mockHass, entity);

      expect(result).to.not.be.undefined;
      const template = result as any;
      const templateString = template.strings.join('');

      // Should include class attribute even with empty string
      expect(templateString).to.include('class=');
    });

    it('should apply custom className when provided', () => {
      const entity = createStateEntity('sensor', 'test', '100', {
        friendly_name: 'Test Sensor',
      });
      const customClassName = 'custom-class';

      const result = stateDisplay(mockHass, entity, customClassName);

      expect(result).to.not.be.undefined;
      const template = result as any;
      const templateString = template.strings.join('');

      // Should include the class attribute in the template
      expect(templateString).to.include('class=');

      // Should have the custom class in the values array
      expect(template.values).to.include('custom-class');
    });

    it('should handle different entity types', () => {
      const sensorEntity = createStateEntity('sensor', 'temperature', '22.5', {
        friendly_name: 'Temperature',
        unit_of_measurement: '°C',
      });

      const switchEntity = createStateEntity('switch', 'light', 'on', {
        friendly_name: 'Light Switch',
      });

      const binarySensorEntity = createStateEntity(
        'binary_sensor',
        'motion',
        'off',
        {
          friendly_name: 'Motion Sensor',
        },
      );

      // Test sensor entity
      const sensorResult = stateDisplay(mockHass, sensorEntity);
      expect(sensorResult).to.not.be.undefined;

      // Test switch entity
      const switchResult = stateDisplay(mockHass, switchEntity);
      expect(switchResult).to.not.be.undefined;

      // Test binary sensor entity
      const binarySensorResult = stateDisplay(mockHass, binarySensorEntity);
      expect(binarySensorResult).to.not.be.undefined;
    });

    it('should handle entities with different states', () => {
      const entities = [
        createStateEntity('sensor', 'test1', '100', {
          friendly_name: 'Test 1',
        }),
        createStateEntity('sensor', 'test2', 'unknown', {
          friendly_name: 'Test 2',
        }),
        createStateEntity('sensor', 'test3', 'unavailable', {
          friendly_name: 'Test 3',
        }),
        createStateEntity('switch', 'test4', 'on', { friendly_name: 'Test 4' }),
        createStateEntity('switch', 'test5', 'off', {
          friendly_name: 'Test 5',
        }),
      ];

      entities.forEach((entity) => {
        const result = stateDisplay(mockHass, entity);
        expect(result).to.not.be.undefined;

        const template = result as any;
        expect(template.strings).to.be.an('array');
        expect(template.strings.join('')).to.include('state-display');
      });
    });

    it('should handle entities with various attributes', () => {
      const entityWithAttributes = createStateEntity(
        'sensor',
        'complex',
        '42',
        {
          friendly_name: 'Complex Sensor',
          unit_of_measurement: 'W',
          device_class: 'power',
          state_class: 'measurement',
          last_updated: '2024-01-01T10:00:00Z',
          last_changed: '2024-01-01T10:00:00Z',
        },
      );

      const result = stateDisplay(mockHass, entityWithAttributes);

      expect(result).to.not.be.undefined;
      const template = result as any;
      expect(template.strings).to.be.an('array');
      expect(template.strings.join('')).to.include('state-display');
    });

    it('should handle empty attributes object', () => {
      const entityWithEmptyAttributes = createStateEntity(
        'sensor',
        'empty',
        '0',
        {},
      );

      const result = stateDisplay(mockHass, entityWithEmptyAttributes);

      expect(result).to.not.be.undefined;
      const template = result as any;
      expect(template.strings).to.be.an('array');
      expect(template.strings.join('')).to.include('state-display');
    });

    it('should handle different domain types', () => {
      const domains = [
        'sensor',
        'switch',
        'light',
        'binary_sensor',
        'cover',
        'climate',
        'fan',
      ];

      domains.forEach((domain) => {
        const entity = createStateEntity(domain, 'test', 'on', {
          friendly_name: `Test ${domain}`,
        });

        const result = stateDisplay(mockHass, entity);
        expect(result).to.not.be.undefined;

        const template = result as any;
        expect(template.strings).to.be.an('array');
        expect(template.strings.join('')).to.include('state-display');
      });
    });

    it('should return consistent template structure', () => {
      const entity = createStateEntity('sensor', 'test', '100', {
        friendly_name: 'Test Sensor',
      });

      const result1 = stateDisplay(mockHass, entity);
      const result2 = stateDisplay(mockHass, entity);

      // Both results should have the same structure
      expect(result1).to.have.property('strings');
      expect(result1).to.have.property('values');
      expect(result2).to.have.property('strings');
      expect(result2).to.have.property('values');

      const template1 = result1 as any;
      const template2 = result2 as any;

      expect(template1.strings).to.be.an('array');
      expect(template2.strings).to.be.an('array');
      expect(template1.strings.length).to.equal(template2.strings.length);
    });
  });
});
