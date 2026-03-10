import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { OhmAssistantEntitiesRowEditor } from '../../../../src/cards/components/editor/entities-row-editor';
import * as fireEventModule from '../../../../src/hass/common/dom/fire_event';
import type { HomeAssistant } from '../../../../src/hass/types';
import type { EntityConfig } from '../../../../src/types/config';

describe('entities-row-editor.ts', () => {
  let element: OhmAssistantEntitiesRowEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockEntityConfigs: EntityConfig[] = [
    { entity_id: 'sensor.power_1', name: 'Washer', color: '#ff0000' },
    { entity_id: 'sensor.energy_1' },
  ];

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    if (!customElements.get('ohm-assistant-entities-row-editor')) {
      customElements.define(
        'ohm-assistant-entities-row-editor',
        OhmAssistantEntitiesRowEditor,
      );
    }

    mockHass = {
      localize: (key: string) => {
        const translations: Record<string, string> = {
          'ui.panel.lovelace.editor.card.generic.entities': 'Entities',
          'ui.panel.lovelace.editor.card.config.optional': 'optional',
          'ui.components.entity.entity-picker.clear': 'Clear',
          'ui.components.entity.entity-picker.edit': 'Edit',
        };
        return translations[key] || key;
      },
    } as unknown as HomeAssistant;

    element = new OhmAssistantEntitiesRowEditor();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should set entities property', () => {
      element.entities = mockEntityConfigs;
      expect(element.entities).to.deep.equal(mockEntityConfigs);
    });

    it('should set label property', () => {
      element.label = 'Custom Label';
      expect(element.label).to.equal('Custom Label');
    });

    it('should set availableEntities property', () => {
      const available = ['sensor.power_1', 'sensor.energy_1'];
      element.availableEntities = available;
      expect(element.availableEntities).to.deep.equal(available);
    });
  });

  describe('_getKey', () => {
    it('should generate key from string entity', () => {
      const key = element['_getKey']('sensor.power_1', 0);
      expect(key).to.equal('sensor.power_1-0');
    });

    it('should generate key from EntityConfig', () => {
      const config = { entity_id: 'sensor.power_1', name: 'Washer' };
      const key = element['_getKey'](config, 1);
      expect(key).to.equal('sensor.power_1-1');
    });
  });

  describe('_getEntityId', () => {
    it('should return string entity id', () => {
      const entityId = element['_getEntityId']('sensor.power_1');
      expect(entityId).to.equal('sensor.power_1');
    });

    it('should extract entity_id from EntityConfig', () => {
      const config = { entity_id: 'sensor.power_1', name: 'Washer' };
      const entityId = element['_getEntityId'](config);
      expect(entityId).to.equal('sensor.power_1');
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element.hass = undefined;
      const result = element['render']();
      expect(result).to.equal(nothing);
    });

    it('should render with entities', () => {
      element.entities = mockEntityConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
      const templateString = (result as any).strings.join('');
      expect(templateString).to.include('ha-sortable');
      expect(templateString).to.include('ha-entity-picker');
    });

    it('should render with empty entities array', () => {
      element.entities = [];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });
  });

  describe('_addEntity', () => {
    it('should add entity to entities list', async () => {
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'sensor.power_new' },
      });
      Object.defineProperty(event, 'target', { value: { value: '' } });

      await element['_addEntity'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[1]).to.equal('value-changed');
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(3);
      expect(newEntities[2]).to.equal('sensor.power_new');
    });

    it('should not add entity when value is empty', async () => {
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: '' },
      });

      await element['_addEntity'](event);

      expect(fireEventStub.called).to.be.false;
    });
  });

  describe('_removeRow', () => {
    it('should remove entity at specified index', () => {
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: { index: 0 } });

      element['_removeRow'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(1);
      expect(newEntities[0]).to.deep.equal(mockEntityConfigs[1]);
    });
  });

  describe('_valueChanged', () => {
    it('should update string entity at index', () => {
      element.entities = ['sensor.one', 'sensor.two'];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'sensor.updated' },
      });
      Object.defineProperty(event, 'target', { value: { index: 0 } });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities[0]).to.equal('sensor.updated');
      expect(newEntities[1]).to.equal('sensor.two');
    });

    it('should update EntityConfig entity_id at index', () => {
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'sensor.updated' },
      });
      Object.defineProperty(event, 'target', { value: { index: 0 } });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities[0].entity_id).to.equal('sensor.updated');
      expect(newEntities[0].name).to.equal('Washer');
    });
  });

  describe('_editRow', () => {
    it('should fire edit-detail-element event', () => {
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: { index: 0 } });

      element['_editRow'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[1]).to.equal('edit-detail-element');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        subElementConfig: {
          index: 0,
          type: 'entity',
          elementConfig: mockEntityConfigs[0],
          field: 'entities',
        },
      });
    });
  });

  describe('styles', () => {
    it('should have static styles defined', () => {
      expect(OhmAssistantEntitiesRowEditor.styles).to.exist;
    });

    it('should include entity picker and icon styles', () => {
      const styles = OhmAssistantEntitiesRowEditor.styles.toString();
      expect(styles).to.include('ha-entity-picker');
      expect(styles).to.include('remove-icon');
      expect(styles).to.include('edit-icon');
    });
  });
});
