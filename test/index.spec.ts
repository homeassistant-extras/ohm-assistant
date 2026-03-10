import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';
import { version } from '../package.json';

describe('index.ts', () => {
  let customElementsStub: SinonStub;
  let customCardsStub: Array<Object> | undefined;
  let consoleInfoStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub customElements.define to prevent actual registration
    customElementsStub = stub(customElements, 'define');
    consoleInfoStub = stub(console, 'info');

    // Create a stub for globalThis.customCards
    customCardsStub = [];
    Object.defineProperty(globalThis, 'customCards', {
      get: () => customCardsStub,
      set: (value) => {
        customCardsStub = value;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore the original customElements.define
    customElementsStub.restore();
    consoleInfoStub.restore();
    customCardsStub = undefined;
    delete require.cache[require.resolve('@/index.ts')];
  });

  it('should register all custom elements', () => {
    require('@/index.ts');
    expect(customElementsStub.callCount).to.equal(5);
    expect(customElementsStub.getCall(0).args[0]).to.equal('area-energy-card');
    expect(customElementsStub.getCall(1).args[0]).to.equal(
      'area-energy-card-editor',
    );
    expect(customElementsStub.getCall(2).args[0]).to.equal(
      'ohm-assistant-entities-row-editor',
    );
    expect(customElementsStub.getCall(3).args[0]).to.equal(
      'ohm-assistant-entity-detail-editor',
    );
    expect(customElementsStub.getCall(4).args[0]).to.equal(
      'ohm-assistant-sub-element-editor',
    );
  });

  it('should initialize globalThis.customCards if undefined', () => {
    customCardsStub = undefined;
    require('@/index.ts');

    expect(globalThis.customCards).to.be.an('array');
  });

  it('should add card configurations with all fields to globalThis.customCards', () => {
    require('@/index.ts');

    expect(globalThis.customCards).to.have.lengthOf(1);

    // Check area-energy-card configuration
    expect(globalThis.customCards[0]).to.deep.equal({
      type: 'area-energy-card',
      name: 'Ohm Assistant Area Energy & Power Card',
      description:
        'A modern card for displaying electricity usage and power consumption',
      preview: true,
      documentationURL: 'https://github.com/homeassistant-extras/ohm-assistant',
    });
  });

  it('should preserve existing cards when adding new card', () => {
    // Add an existing card
    globalThis.customCards = [
      {
        type: 'existing-card',
        name: 'Existing Card',
      },
    ];

    require('@/index.ts');

    expect(globalThis.customCards).to.have.lengthOf(2);
    expect(globalThis.customCards[0]).to.deep.equal({
      type: 'existing-card',
      name: 'Existing Card',
    });
  });

  it('should handle multiple imports without duplicating registration', () => {
    require('@/index.ts');
    require('@/index.ts');

    expect(globalThis.customCards).to.have.lengthOf(1);
    expect(customElementsStub.callCount).to.equal(5); // Called once for each component
  });

  it('should log the version with proper formatting', () => {
    require('@/index.ts');
    expect(consoleInfoStub.calledOnce).to.be.true;

    // Assert that it was called with the expected arguments
    expect(
      consoleInfoStub.calledWithExactly(
        `%c🐱 Poat's Tools: ohm-assistant - ${version}`,
        'color: #CFC493;',
      ),
    ).to.be.true;
  });
});
