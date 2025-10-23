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

  .card-content {
    padding: 16px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--primary-text-color);
    margin: 0;
  }

  .metrics-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .metric-card {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    border-radius: 8px;
    padding: 16px;
    transition: all 0.2s ease-in-out;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .metric-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1.2;
  }

  .metric-unit {
    font-size: 1rem;
    font-weight: 400;
    color: var(--secondary-text-color);
    margin-left: 4px;
  }

  .metric-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-bottom: 8px;
  }

  .power-icon {
    background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
    color: #fff;
  }

  .energy-icon {
    background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
    color: #fff;
  }

  .icon {
    width: 18px;
    height: 18px;
  }

  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0 0 0;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
  }

  .status-text {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }

  .last-updated {
    font-size: 0.75rem;
    color: var(--disabled-text-color);
  }

  .error {
    padding: 16px;
    background: var(--error-color, #f44336);
    color: white;
    border-radius: 8px;
    text-align: center;
  }

  .warning {
    padding: 16px;
    background: var(--warning-color, #ff9800);
    color: white;
    border-radius: 8px;
    text-align: center;
  }

  @media (max-width: 600px) {
    .metrics-container {
      grid-template-columns: 1fr;
    }
  }

  /* Dark mode adjustments */
  :host([dark-mode]) .metric-card {
    background: var(--secondary-background-color, rgba(255, 255, 255, 0.05));
  }
`;
