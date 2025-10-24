import { version } from '../package.json';
import { AreaEnergy } from './card';
import { AreaEnergyEditor } from './editor';

// Register custom elements
customElements.define('area-energy-card', AreaEnergy);
customElements.define('area-energy-card-editor', AreaEnergyEditor);

declare global {
  interface Window {
    customCards: Array<Object>;
    matchMedia: (query: string) => MediaQueryList;
  }
}

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

window.customCards.push({
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
