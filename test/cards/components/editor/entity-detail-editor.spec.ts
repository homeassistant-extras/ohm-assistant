import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { OhmAssistantEntityDetailEditor } from '../../../../src/cards/components/editor/entity-detail-editor';
import * as fireEventModule from '../../../../src/hass/common/dom/fire_event';
import type { HomeAssistant } from '../../../../src/hass/types';
import type { EntityConfig } from '../../../../src/types/config';

describe('entity-detail-editor.ts', () => {
  let element: OhmAssistantEntityDetailEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockEntityConfig: EntityConfig = {
    entity_id: 'sensor.power_1',
    name: 'Washer',
    color: '#ff0000',
  };

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    if (!customElements.get('ohm-assistant-entity-detail-editor')) {
      customElements.define(
        'ohm-assistant-entity-detail-editor',
        OhmAssistantEntityDetailEditor,
      );
    }

    mockHass = {
      localize: (key: string) => {
        const translations: Record<string, string> = {
          'ui.panel.lovelace.editor.card.generic.entity': 'Entity',
          'ui.panel.lovelace.editor.card.generic.name': 'Name',
          'ui.panel.lovelace.editor.card.generic.color': 'Color',
        };
        return translations[key] || key;
      },
    } as unknown as HomeAssistant;

    element = new OhmAssistantEntityDetailEditor();
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should initialize with undefined config', () => {
      expect(element['_config']).to.be.undefined;
    });

    it('should set hass property', () => {
      element.hass = mockHass;
      expect(element.hass).to.equal(mockHass);
    });
  });

  describe('setConfig', () => {
    it('should accept EntityConfig object', () => {
      element.setConfig(mockEntityConfig);
      expect(element['_config']).to.deep.equal(mockEntityConfig);
    });

    it('should accept string and convert to EntityConfig', () => {
      element.setConfig('sensor.power_1');
      expect(element['_config']).to.deep.equal({ entity_id: 'sensor.power_1' });
    });

    it('should create a copy of the config object', () => {
      element.setConfig(mockEntityConfig);
      expect(element['_config']).to.not.equal(mockEntityConfig);
      expect(element['_config']).to.deep.equal(mockEntityConfig);
    });
  });

  describe('value property', () => {
    it('should set value with EntityConfig', () => {
      element.value = mockEntityConfig;
      expect(element['_config']).to.deep.equal(mockEntityConfig);
    });

    it('should set value with string', () => {
      element.value = 'sensor.power_1';
      expect(element['_config']).to.deep.equal({ entity_id: 'sensor.power_1' });
    });

    it('should clear config when value is undefined', () => {
      element.value = mockEntityConfig;
      element.value = undefined;
      expect(element['_config']).to.be.undefined;
    });

    it('should get value as EntityConfig', () => {
      element['_config'] = mockEntityConfig;
      expect(element.value).to.equal(mockEntityConfig);
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element.value = mockEntityConfig;
      element.hass = undefined;
      const result = element['render']();
      expect(result).to.equal(nothing);
    });

    it('should render nothing when config is not set', () => {
      element.hass = mockHass;
      const result = element['render']();
      expect(result).to.equal(nothing);
    });

    it('should render ha-form when hass and config are set', () => {
      element.hass = mockHass;
      element.value = mockEntityConfig;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
      const templateString = (result as any).strings.join('');
      expect(templateString).to.include('ha-form');
    });
  });

  describe('_schema', () => {
    it('should return schema with entity_id, name, and color fields', () => {
      element.hass = mockHass;
      element.value = mockEntityConfig;
      const schema = element['_schema']();
      expect(schema).to.have.lengthOf(3);
      expect(schema[0].name).to.equal('entity_id');
      expect(schema[1].name).to.equal('name');
      expect(schema[2].name).to.equal('color');
    });
  });

  describe('_valueChanged', () => {
    it('should fire config-changed event with updated config', () => {
      element.hass = mockHass;
      element.value = mockEntityConfig;

      const updatedConfig = {
        entity_id: 'sensor.power_1',
        name: 'Updated Name',
        color: '#00ff00',
      };
      const event = new CustomEvent('value-changed', {
        detail: { value: updatedConfig },
      });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[1]).to.equal('config-changed');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: updatedConfig,
      });
    });
  });
});
