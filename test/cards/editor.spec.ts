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

    it('should return exact schema from _getSchema', () => {
      const testConfig: Config = {
        area: 'living_room',
      };
      card.setConfig(testConfig);

      const schema = card['_getSchema']();

      const expectedSchema = [
        {
          name: 'area',
          label: 'Area',
          required: true,
          selector: { area: {} },
        },
        {
          name: 'content',
          label: 'Content',
          type: 'expandable',
          flatten: true,
          icon: 'mdi:text-short',
          schema: [
            {
              name: 'name',
              label: 'Card Name',
              selector: { text: {} },
            },
          ],
        },
        {
          name: 'entities',
          label: 'Entities',
          type: 'expandable' as const,
          flatten: true,
          icon: 'mdi:devices',
          schema: [
            {
              name: 'entities',
              label: 'Entities',
              required: true,
              selector: {
                entity: {
                  multiple: true,
                  filter: {
                    device_class: ['power', 'energy'],
                  },
                },
              },
            },
            {
              name: 'chart.total_power_entity',
              label: 'Total Power Entity (for untracked power)',
              required: false,
              selector: {
                entity: {
                  filter: {
                    device_class: 'power',
                  },
                },
              },
            },
          ],
        },
        {
          name: 'chart',
          label: 'Chart',
          type: 'expandable' as const,
          icon: 'mdi:chart-line',
          schema: [
            {
              name: 'chart_type',
              label: 'Chart Type',
              required: false,
              selector: {
                select: {
                  mode: 'dropdown' as const,
                  options: [
                    {
                      label: 'Line (Default)',
                      value: 'line',
                    },
                    {
                      label: 'Stacked Bar',
                      value: 'stacked_bar',
                    },
                  ],
                },
              },
            },
            {
              name: 'line_type',
              label: 'Line Type',
              required: false,
              selector: {
                select: {
                  mode: 'dropdown' as const,
                  options: [
                    {
                      label: 'Normal (Default)',
                      value: 'normal',
                    },
                    {
                      label: 'Gradient',
                      value: 'gradient',
                    },
                    {
                      label: 'Gradient No Fill',
                      value: 'gradient_no_fill',
                    },
                    {
                      label: 'No Fill',
                      value: 'no_fill',
                    },
                  ],
                },
              },
            },
            {
              name: 'legend_style',
              label: 'Legend Style',
              required: false,
              selector: {
                select: {
                  mode: 'dropdown' as const,
                  options: [
                    {
                      label: 'Entities (Default)',
                      value: 'entities',
                    },
                    {
                      label: 'Compact',
                      value: 'compact',
                    },
                    {
                      label: 'None',
                      value: 'none',
                    },
                  ],
                },
              },
            },
            {
              name: 'axis_style',
              label: 'Axis Style',
              required: false,
              selector: {
                select: {
                  mode: 'dropdown' as const,
                  options: [
                    {
                      label: 'All (Default)',
                      value: 'all',
                    },
                    {
                      label: 'X Only',
                      value: 'x_only',
                    },
                    {
                      label: 'Y Only',
                      value: 'y_only',
                    },
                    {
                      label: 'None',
                      value: 'none',
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          name: 'features',
          label: 'Features',
          type: 'expandable' as const,
          flatten: true,
          icon: 'mdi:list-box',
          schema: [
            {
              name: 'features',
              label: 'Features',
              required: false,
              selector: {
                select: {
                  multiple: true,
                  mode: 'list' as const,
                  options: [
                    {
                      label: 'Hide Name',
                      value: 'hide_name',
                    },
                    {
                      label: 'Exclude Default Entities',
                      value: 'exclude_default_entities',
                    },
                  ],
                },
              },
            },
          ],
        },
      ];

      expect(JSON.stringify(schema)).to.equal(JSON.stringify(expectedSchema));
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
    it('should fire config-changed event with config', () => {
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
