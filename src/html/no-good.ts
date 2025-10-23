import { html, type TemplateResult } from 'lit';

/**
 * Renders an error message for the card
 * @param message - The error message to display
 * @returns HTML template for the error state
 */
export function renderError(message: string): TemplateResult {
  return html`
    <div class="card-content">
      <div class="card-header">
        <h2 class="card-title">Energy Consumption</h2>
      </div>
      <div class="error">${message}</div>
    </div>
  `;
}
