import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { OhmAssistantEntityDetailEditor } from '../../../../src/cards/components/editor/entity-detail-editor';
import { OhmAssistantSubElementEditor } from '../../../../src/cards/components/editor/sub-element-editor';
import * as fireEventModule from '../../../../src/hass/common/dom/fire_event';
import type { HomeAssistant } from '../../../../src/hass/types';
import type { EntityConfig } from '../../../../src/types/config';

describe('sub-element-editor.ts', () => {
  let element: OhmAssistantSubElementEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockEntityConfig: EntityConfig = {
    entity_id: 'sensor.power_1',
    name: 'Washer',
    color: '#ff0000',
  };

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    mockHass = {
      localize: (key: string) => {
        const translations: Record<string, string> = {
          'ui.common.back': 'Back',
          'ui.panel.lovelace.editor.sub-element-editor.types.row': 'Row',
        };
        return translations[key] || key;
      },
    } as unknown as HomeAssistant;

    if (!customElements.get('ohm-assistant-entity-detail-editor')) {
      customElements.define(
        'ohm-assistant-entity-detail-editor',
        OhmAssistantEntityDetailEditor,
      );
    }
    if (!customElements.get('ohm-assistant-sub-element-editor')) {
      customElements.define(
        'ohm-assistant-sub-element-editor',
        OhmAssistantSubElementEditor,
      );
    }

    element = new OhmAssistantSubElementEditor();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should set config property', () => {
      const config = {
        field: 'entities' as const,
        type: 'entity' as const,
        elementConfig: mockEntityConfig,
      };
      element.config = config;
      expect(element.config).to.equal(config);
    });
  });

  describe('render', () => {
    it('should render header with back button', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const result = (element as any).render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      const templateString = (result as any).strings.join('');
      expect(templateString).to.include('header');
      expect(templateString).to.include('back-title');
      expect(templateString).to.include('ha-icon-button-prev');
      expect(templateString).to.include('ohm-assistant-entity-detail-editor');
    });

    it('should render entity detail editor', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const result = (element as any).render() as TemplateResult;
      expect(result).to.not.equal(nothing);
      const templateString = (result as any).strings.join('');
      expect(templateString).to.include('ohm-assistant-entity-detail-editor');
    });
  });

  describe('_goBack', () => {
    it('should fire go-back event', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      element['_goBack']();

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('go-back');
    });
  });

  describe('_handleConfigChanged', () => {
    it('should fire config-changed event with new config', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const newConfig = {
        entity_id: 'sensor.power_1',
        name: 'Updated Name',
        color: '#00ff00',
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
      });

      element['_handleConfigChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[1]).to.equal('config-changed');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: newConfig,
      });
    });

    it('should stop event propagation', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: {} },
        bubbles: true,
      });

      const stopPropagationSpy = stub(event, 'stopPropagation');

      element['_handleConfigChanged'](event);

      expect(stopPropagationSpy.calledOnce).to.be.true;

      stopPropagationSpy.restore();
    });
  });

  describe('styles', () => {
    it('should have static styles defined', () => {
      expect(OhmAssistantSubElementEditor.styles).to.exist;
    });

    it('should include header and editor styling', () => {
      const styles = OhmAssistantSubElementEditor.styles.toString();
      expect(styles).to.include('header');
      expect(styles).to.include('editor');
      expect(styles).to.include('padding');
    });
  });
});
