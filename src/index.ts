import { ShockingCard } from './card';
import { ShockingCardEditor } from './editor';

// Get version from package.json
const version = '1.0.0';

// Register custom elements
customElements.define('shocking-card', ShockingCard);
customElements.define('shocking-card-editor', ShockingCardEditor);

// Register with Home Assistant's card registry
declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'custom:shocking-card',
  name: 'Shocking Card',
  description: 'A modern card for displaying electricity usage and power consumption',
  preview: true,
  documentationURL: 'https://github.com/username/shocking-card',
});

console.info(
  `%c⚡ Shocking Card - v${version} %c Loaded`,
  'color: #ffd700; font-weight: bold; background: #1a1a1a; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'color: #00bcd4; font-weight: bold; background: #1a1a1a; padding: 4px 8px; border-radius: 0 4px 4px 0;',
);
