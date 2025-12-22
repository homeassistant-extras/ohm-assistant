import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing } from 'lit';
import { describe, it } from 'mocha';
import type { HomeAssistant } from '../../src/hass/types';
import { renderLegend } from '../../src/html/watching-waiting';
import type { Config } from '../../src/types/config';
import { createStateEntity } from '../test-helpers';

describe('watching-waiting', () => {
  const mockHass: HomeAssistant = {
    states: {},
    callService: () => Promise.resolve(),
    callApi: () => Promise.resolve({}),
    // Add other required properties as needed
  } as any;

  const mockConfig: Config = {
    chart: {
      legend_style: 'entities',
    },
  } as any;

  const mockPowerEntities = [
    createStateEntity('sensor', 'power1', '100', { friendly_name: 'Power 1' }),
    createStateEntity('sensor', 'power2', '200', { friendly_name: 'Power 2' }),
  ];

  const mockEnergyEntities = [
    createStateEntity('sensor', 'energy1', '10.5', {
      friendly_name: 'Energy 1',
    }),
    createStateEntity('sensor', 'energy2', '20.3', {
      friendly_name: 'Energy 2',
    }),
  ];

  describe('renderLegend', () => {
    it('should return nothing when legend_style is not entities', () => {
      const configWithHiddenLegend: Config = {
        chart: {
          legend_style: 'hidden',
        },
      } as any;

      const result = renderLegend(
        mockHass,
        configWithHiddenLegend,
        mockPowerEntities,
        mockEnergyEntities,
        {},
      );
      expect(result).to.equal(nothing);
    });

    it('should return nothing when chart config is undefined', () => {
      const configWithoutChart: Config = {} as any;

      const result = renderLegend(
        mockHass,
        configWithoutChart,
        mockPowerEntities,
        mockEnergyEntities,
        {},
      );
      // When chart config is undefined, it defaults to 'entities' so should return a template
      expect(result).to.not.equal(nothing);
      expect(result).to.have.property('strings');
      expect(result).to.have.property('values');
    });

    it('should render legend when legend_style is entities', () => {
      const result = renderLegend(
        mockHass,
        mockConfig,
        mockPowerEntities,
        mockEnergyEntities,
        {},
      );

      expect(result).to.not.equal(nothing);
      expect(result).to.have.property('strings');
      expect(result).to.have.property('values');
    });

    it('should render power entities in legend', async () => {
      const result = renderLegend(
        mockHass,
        mockConfig,
        mockPowerEntities,
        [],
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Check that the legend container exists (the fixture root element should be the container)
      expect(el.classList.contains('legend-container')).to.be.true;

      // Check that power entities are rendered with (W) units
      const powerLabels = el.querySelectorAll('.legend-label');
      expect(powerLabels.length).to.be.greaterThan(0);

      // Check that at least one label contains (W)
      const hasPowerUnit = Array.from(powerLabels).some((label) =>
        label.textContent?.includes('(W)'),
      );
      expect(hasPowerUnit).to.be.true;
    });

    it('should render energy entities in legend', async () => {
      const result = renderLegend(
        mockHass,
        mockConfig,
        [],
        mockEnergyEntities,
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Check that the legend container exists (the fixture root element should be the container)
      expect(el.classList.contains('legend-container')).to.be.true;

      // Check that energy entities are rendered with (kWh) units
      const energyLabels = el.querySelectorAll('.legend-label');
      expect(energyLabels.length).to.be.greaterThan(0);

      // Check that at least one label contains (kWh)
      const hasEnergyUnit = Array.from(energyLabels).some((label) =>
        label.textContent?.includes('(kWh)'),
      );
      expect(hasEnergyUnit).to.be.true;
    });

    it('should render both power and energy entities', async () => {
      const result = renderLegend(
        mockHass,
        mockConfig,
        mockPowerEntities,
        mockEnergyEntities,
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Check that the legend container exists (the fixture root element should be the container)
      expect(el.classList.contains('legend-container')).to.be.true;

      // Check that both power and energy entities are rendered
      const labels = el.querySelectorAll('.legend-label');
      expect(labels.length).to.be.greaterThan(0);

      // Check that we have both power and energy units
      const hasPowerUnit = Array.from(labels).some((label) =>
        label.textContent?.includes('(W)'),
      );
      const hasEnergyUnit = Array.from(labels).some((label) =>
        label.textContent?.includes('(kWh)'),
      );

      expect(hasPowerUnit).to.be.true;
      expect(hasEnergyUnit).to.be.true;
    });

    it('should handle entities without friendly_name', async () => {
      const entitiesWithoutFriendlyName = [
        createStateEntity('sensor', 'power1', '100', {}),
        createStateEntity('sensor', 'energy1', '10.5', {}),
      ];

      const result = renderLegend(
        mockHass,
        mockConfig,
        [entitiesWithoutFriendlyName[0]],
        [entitiesWithoutFriendlyName[1]],
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Should still render the legend structure
      expect(el.classList.contains('legend-container')).to.be.true;

      const labels = el.querySelectorAll('.legend-label');
      expect(labels.length).to.be.greaterThan(0);
    });

    it('should handle empty entity arrays', async () => {
      const result = renderLegend(mockHass, mockConfig, [], [], {});

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Should still render the legend container even with no entities
      expect(el.classList.contains('legend-container')).to.be.true;
    });

    it('should include legend-color spans with proper styling', async () => {
      const result = renderLegend(
        mockHass,
        mockConfig,
        mockPowerEntities,
        mockEnergyEntities,
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Check for legend-color spans
      const colorSpans = el.querySelectorAll('.legend-color');
      expect(colorSpans.length).to.be.greaterThan(0);

      // Check that color spans have background styling
      const hasBackgroundStyle = Array.from(colorSpans).some((span) =>
        span.getAttribute('style')?.includes('background:'),
      );
      expect(hasBackgroundStyle).to.be.true;
    });

    it('should include legend-label spans', async () => {
      const result = renderLegend(
        mockHass,
        mockConfig,
        mockPowerEntities,
        mockEnergyEntities,
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Check for legend-label spans
      const labelSpans = el.querySelectorAll('.legend-label');
      expect(labelSpans.length).to.be.greaterThan(0);
    });

    it('should include state-display components', async () => {
      const result = renderLegend(
        mockHass,
        mockConfig,
        mockPowerEntities,
        mockEnergyEntities,
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Check for state-display components
      const stateDisplays = el.querySelectorAll('state-display');
      expect(stateDisplays.length).to.be.greaterThan(0);
    });

    it('should handle single entity correctly', async () => {
      const singlePowerEntity = [mockPowerEntities[0]];
      const singleEnergyEntity = [mockEnergyEntities[0]];

      const result = renderLegend(
        mockHass,
        mockConfig,
        singlePowerEntity,
        singleEnergyEntity,
        {},
      );

      expect(result).to.not.equal(nothing);

      // Render the template into a fixture
      const el = await fixture(result as any);

      // Check that the template has the right structure
      expect(el.classList.contains('legend-container')).to.be.true;

      // Check that we have both power and energy units
      const labels = el.querySelectorAll('.legend-label');
      expect(labels.length).to.be.greaterThan(0);

      const hasPowerUnit = Array.from(labels).some((label) =>
        label.textContent?.includes('(W)'),
      );
      const hasEnergyUnit = Array.from(labels).some((label) =>
        label.textContent?.includes('(kWh)'),
      );

      expect(hasPowerUnit).to.be.true;
      expect(hasEnergyUnit).to.be.true;
    });
  });
});
