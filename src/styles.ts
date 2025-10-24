import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    background: var(--ha-card-background, var(--card-background-color, white));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(
      --ha-card-box-shadow,
      0 2px 4px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.05)
    );
    overflow: hidden;
    transition: box-shadow 0.2s ease-in-out;
  }

  :host(:hover) {
    box-shadow: var(
      --ha-card-box-shadow-hover,
      0 4px 8px rgba(0, 0, 0, 0.15),
      0 8px 16px rgba(0, 0, 0, 0.1)
    );
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px;
  }

  .card-title {
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0;
  }

  .status-badges {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .status-item ha-icon {
    --mdc-icon-size: 18px;
    color: var(--primary-text-color);
    opacity: 0.7;
  }

  .status-count {
    font-size: 0.875rem;
    color: var(--primary-text-color);
    opacity: 0.8;
  }

  .error {
    padding: 16px;
    background: var(--error-color, #f44336);
    color: white;
    border-radius: 8px;
    text-align: center;
  }

  .chart-container {
    position: relative;
    width: 100%;
    height: 300px;
  }

  .chart-container canvas {
    max-width: 100%;
    max-height: 100%;
  }

  .legend-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 0;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--primary-text-color);
    justify-content: space-between;
  }

  .legend-color {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .legend-label {
    font-weight: 500;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    min-height: 300px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-top-color: var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    margin-top: 16px;
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }

  @media (max-width: 600px) {
    .chart-container {
      height: 250px;
    }
  }
`;
