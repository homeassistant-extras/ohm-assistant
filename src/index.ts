import { version } from '../package.json';
import { AreaEnergy } from './cards/card';
import { OhmAssistantEntitiesRowEditor } from './cards/components/editor/entities-row-editor';
import { OhmAssistantEntityDetailEditor } from './cards/components/editor/entity-detail-editor';
import { OhmAssistantSubElementEditor } from './cards/components/editor/sub-element-editor';
import { AreaEnergyEditor } from './cards/editor';

// Register custom elements
customElements.define('area-energy-card', AreaEnergy);
customElements.define('area-energy-card-editor', AreaEnergyEditor);
customElements.define(
  'ohm-assistant-entities-row-editor',
  OhmAssistantEntitiesRowEditor,
);
customElements.define(
  'ohm-assistant-entity-detail-editor',
  OhmAssistantEntityDetailEditor,
);
customElements.define(
  'ohm-assistant-sub-element-editor',
  OhmAssistantSubElementEditor,
);

declare global {
  var customCards: Array<object> | undefined;
}

// Ensure the customCards array exists on the window object
globalThis.customCards = globalThis.customCards || [];

globalThis.customCards.push({
  // Unique identifier for the card type
  type: 'area-energy-card',

  // Display name in the UI
  name: 'Ohm Assistant Area Energy & Power Card',

  // Card description for the UI
  description:
    'A modern card for displaying electricity usage and power consumption',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/ohm-assistant',
});

console.info(
  `%c🐱 Poat's Tools: ohm-assistant - ${version}`,
  'color: #CFC493;',
);
