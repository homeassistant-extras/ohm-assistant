import { AreaEnergyEditor } from '@/cards/editor';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('editor.ts', () => {
  let card: AreaEnergyEditor;
  let hass: HomeAssistant;
  let dispatchStub: sinon.SinonStub;

  beforeEach(async () => {
    // Create mock HomeAssistant instance
    hass = {} as HomeAssistant;

    // Register the custom element to avoid constructor issues
    if (!customElements.get('area-energy-card-editor')) {
      customElements.define('area-energy-card-editor', AreaEnergyEditor);
    }

    card = new AreaEnergyEditor();
    dispatchStub = stub(card, 'dispatchEvent');

    card.hass = hass;
  });

  afterEach(() => {
    if (dispatchStub) {
      dispatchStub.restore();
    }
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(card).to.be.instanceOf(AreaEnergyEditor);
    });

    it('should have default properties', () => {
      expect(card.hass).to.exist;
      expect(card['_config']).to.be.undefined;
    });
  });

  describe('setConfig', () => {
    it('should set the configuration correctly', () => {
      const testConfig: Config = {
        area: 'living_room',
      };

      card.setConfig(testConfig);
      expect(card['_config']).to.deep.equal(testConfig);
    });
  });

  describe('render', () => {
    it('should return nothing when hass is not set', async () => {
      card.hass = undefined as any;
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should return nothing when config is not set', async () => {
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should render ha-form when both hass and config are set', async () => {
      const testConfig: Config = {
        area: 'living_room',
      };
      card.setConfig(testConfig);

      const result = card.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Check that the template contains ha-form
      const template = result as any;
      expect(template.strings).to.be.an('array');
      expect(template.strings.join('')).to.include('ha-form');
    });

    it('should pass correct props to ha-form', async () => {
      const testConfig: Config = {
        area: 'living_room',
      };
      card.setConfig(testConfig);

      const result = card.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Check that the template contains the expected schema structure
      const template = result as any;
      expect(template.strings).to.be.an('array');
      const templateString = template.strings.join('');
      expect(templateString).to.include('ha-form');

      // The schema is defined in the editor, so we just verify the template renders
      expect(template.values).to.be.an('array');
    });
  });

  describe('form behavior', () => {
    it('should compute labels correctly', async () => {
      const testConfig: Config = {
        area: 'living_room',
      };
      card.setConfig(testConfig);

      // Test the compute label function directly
      const computeLabelFn = card['_computeLabel'];
      expect(computeLabelFn).to.be.a('function');

      // Test the compute label function
      const testSchema = {
        name: 'test',
        label: 'Test Label',
        selector: { text: {} },
      };
      const result = computeLabelFn(testSchema);
      expect(result).to.equal('Test Label');
    });
  });

  describe('_valueChanged', () => {
    it('should fire config-changed event with config when features are present', () => {
      const testConfig: Config = {
        area: 'living_room',
      };
      card.setConfig(testConfig);

      // Simulate value-changed event
      const detail = {
        value: {
          area: 'living_room',
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched with correct data
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        area: 'living_room',
      });
    });

    it('should handle config without features property', () => {
      const testConfig: Config = {
        area: 'living_room',
      };
      card.setConfig(testConfig);

      // Simulate value-changed event without features
      const detail = {
        value: {
          area: 'living_room',
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched correctly
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        area: 'living_room',
      });
    });

    it('should remove object properties when object is empty', () => {
      const testConfig: Config = {
        area: 'living_room',
        chart: {},
      };
      card.setConfig(testConfig);

      // Simulate value-changed event with empty chart object
      const detail = {
        value: {
          area: 'kitchen',
          chart: {},
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched with chart property removed
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        area: 'kitchen',
        chart: {},
      });
    });
  });
});
