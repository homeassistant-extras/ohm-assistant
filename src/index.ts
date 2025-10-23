import { version } from '../package.json';
import { Shocking } from './card';
import { ShockingEditor } from './editor';

// Register custom elements
customElements.define('shocking-card', Shocking);
customElements.define('shocking-card-editor', ShockingEditor);

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
  type: 'shocking-card',

  // Display name in the UI
  name: 'Shocking Area Energy & Power Card',

  // Card description for the UI
  description:
    'A modern card for displaying electricity usage and power consumption',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/shocking',
});

console.info(`%c🐱 Poat's Tools: shocking - ${version}`, 'color: #CFC493;');
