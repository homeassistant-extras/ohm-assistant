# ⚡ Ohm Assistant Card

<p align="center">
    <img src="assets/card.png" align="center" width="50%">
</p>
<p align="center"><h1 align="center">Ohm Assistant Card</h1></p>
<p align="center">
  <em>Modern energy monitoring and power consumption visualization for Home Assistant</em>
</p>

![Home Assistant](https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![GitHub Release](https://img.shields.io/github/v/release/homeassistant-extras/ohm-assistant?style=for-the-badge&logo=github)
![GitHub Pre-Release](https://img.shields.io/github/v/release/homeassistant-extras/ohm-assistant?include_prereleases&style=for-the-badge&logo=github&label=PRERELEASE)
![GitHub Tag](https://img.shields.io/github/v/tag/homeassistant-extras/ohm-assistant?style=for-the-badge&color=yellow)
![GitHub branch status](https://img.shields.io/github/checks-status/homeassistant-extras/ohm-assistant/main?style=for-the-badge)

![stars](https://img.shields.io/github/stars/homeassistant-extras/ohm-assistant.svg?style=for-the-badge)
![home](https://img.shields.io/github/last-commit/homeassistant-extras/ohm-assistant.svg?style=for-the-badge)
![commits](https://img.shields.io/github/commit-activity/y/homeassistant-extras/ohm-assistant?style=for-the-badge)
![license](https://img.shields.io/github/license/homeassistant-extras/ohm-assistant?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=0080ff)

<p align="center">Built with the tools and technologies:</p>
<p align="center">
  <img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm">
  <img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=Prettier&logoColor=black" alt="Prettier">
  <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="GitHub%20Actions">
  <img src="https://img.shields.io/badge/Lit-324FFF.svg?style=for-the-badge&logo=Lit&logoColor=white" alt="Lit">
</p>
<br>

## Overview

A modern, professional Home Assistant custom card for displaying electricity usage and power consumption data. The Ohm Assistant Card provides real-time energy monitoring with beautiful charts and intuitive area-based entity discovery, making it easy to track your home's energy consumption patterns.

## Features

### 📊 Dual Metric Display

- **Real-time Power Monitoring** - Shows current power consumption in Watts with live updates
- **Daily Energy Tracking** - Displays daily energy usage in kWh with historical data
- **Dual Y-Axis Charts** - Separate scales for power (W) and energy (kWh) on the same chart
- **Interactive Tooltips** - Hover over data points to see exact values and timestamps

![Dual Metric Display](assets/card.png)

### 🎨 Modern Design

- **Professional UI** - Clean, modern card design with gradient icons and smooth animations
- **Theme Integration** - Automatically adapts to Home Assistant's light and dark themes
- **Responsive Layout** - Optimized for both desktop and mobile viewing
- **Visual Indicators** - Color-coded statistics to understand energy consumption at a glance

![Minimalist](assets/minimalist.png)

### 🏠 Area-Based Discovery

- **Automatic Entity Detection** - Automatically finds power and energy entities within a specified area
- **Smart Entity Mapping** - Intelligently identifies power (W) and energy (kWh) sensors
- **Device Integration** - Works seamlessly with Home Assistant's area and device structure
- **Flexible Configuration** - Override auto-discovery with custom entity lists

### 📈 Advanced Charting

- **Interactive Charts** - Built with Chart.js for smooth, responsive data visualization
- **Chart Type Selection** - Choose between Line charts (detailed) or Stacked Bar charts (overview)
  - Line charts: 5-minute data aggregation for smooth, detailed visualization
  - Bar charts: Hourly aggregation for larger, easier-to-read bars with stacking support
- **Untracked Power Visualization** - See power consumption not tracked by individual entities (bar charts only)
  - Automatically calculates: `untracked = total_power - sum(tracked_power_entities)`
  - Displays as a gray bar stacked on top of tracked power
  - Perfect for identifying phantom loads and unmetered devices
- **Multiple Line Types** - Choose from normal, gradient, gradient-no-fill, or no-fill line styles
- **Customizable Legends** - Configure legend display (entities, compact, or none)
- **Axis Control** - Show/hide X and Y axes independently
- **Time-based Data** - Automatic time scaling with proper date/time formatting

![No Fill](assets/no-fill.png)
No Fill

![Gradient No Fill](assets/gradient-no-fill.png)
Gradient No Fill

![Gradient](assets/gradient.png)
Gradient

![Bar](assets/bar.png)
Bar Chart w/ Untracked Consumption

### ⚙️ Flexible Configuration

- **Visual Editor** - Easy configuration through Home Assistant's card editor
- **YAML Support** - Full YAML configuration for advanced users
- **Feature Flags** - Toggle functionality like hiding card name or excluding default entities
- **Chart Customization** - Fine-tune chart appearance and behavior
- **Entity Override** - Specify custom entities to include or exclude

## Installation

### Prerequisites

> [!NOTE]  
> This card works with any Home Assistant entities that have `device_class: power` (for Watts) or `device_class: energy` (for kWh). No additional integrations are required.

### HACS (Recommended)

NOTE: may not work until the project is added to HACS official, see Manual Installation

[![HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=homeassistant-extras&repository=ohm-assistant&category=dashboard)

1. Open HACS in your Home Assistant instance
2. Click the menu icon in the top right and select "Custom repositories"
3. Add this repository URL and select "Dashboard" as the category
   - `https://github.com/homeassistant-extras/ohm-assistant`
4. Click "Install"

### Manual Installation

1. Download the `ohm-assistant.js` file from the latest release in the Releases tab.
2. Copy it to your `www/community/ohm-assistant/` folder
3. Add the following to your `configuration.yaml` (or add as a resource in dashboards menu)

```yaml
lovelace:
  resources:
    - url: /local/community/ohm-assistant/ohm-assistant.js
      type: module
```

## Usage

Add the card to your dashboard using the UI editor or YAML:

### Card Editor

The card is fully configurable through the card editor, allowing you to customize:

- Area selection for automatic entity discovery
- Custom entity lists
- Chart configuration options
- Feature toggles

### YAML

This is the most minimal configuration needed to get started:

```yaml
type: custom:area-energy-card
area: living_room
```

For custom entity configuration:

```yaml
type: custom:area-energy-card
area: living_room
entities:
  - sensor.living_room_power
  - sensor.living_room_energy
```

The card will automatically:

- Detect power and energy entities within the specified area
- Create beautiful charts with dual Y-axis (power in W, energy in kWh)
- Display real-time data with historical context
- Adapt to your Home Assistant theme

## Configuration Options

| Name     | Type   | Default      | Description                                                   |
| -------- | ------ | ------------ | ------------------------------------------------------------- |
| area     | string | **Required** | The area name to automatically discover energy/power entities |
| name     | string | Area Energy  | Custom name for the card                                      |
| entities | array  | _auto_       | Custom list of entities to include (see Entity Configuration) |
| chart    | object | _none_       | Chart configuration options                                   |
| features | array  | _none_       | Feature flags to enable/disable functionality                 |

### Entity Configuration

The `entities` field accepts two formats:

**String Format** (simple entity IDs):

```yaml
entities:
  - sensor.living_room_power
  - sensor.living_room_energy
```

**Object Format** (with custom colors):

```yaml
entities:
  - entity_id: sensor.living_room_power
    color: '#ff0000' # Hex color
  - entity_id: sensor.living_room_energy
    color: 'rgba(0, 255, 0, 0.8)' # RGBA color with transparency
  - entity_id: sensor.kitchen_power
    color: 'blue' # Named color
  - entity_id: sensor.bedroom_power
    color: 'primary' # Home Assistant theme color
  - entity_id: sensor.bedroom_energy
    color: 'accent' # Home Assistant theme color
```

**Mixed Format** (combine both):

```yaml
entities:
  - sensor.living_room_power # Uses default color
  - entity_id: sensor.living_room_energy
    color: '#00ff00' # Custom color
```

When using the object format:

- `entity_id` (required): The entity ID string
- `color` (optional): Color value in any CSS format (hex, rgba, named colors, etc.) or Home Assistant theme colors (primary, accent, red, blue, green, etc.)

Entities without custom colors will use the default color scheme based on their type (power/energy) and position.

### Chart Configuration

| Name               | Type   | Default  | Description                                                          |
| ------------------ | ------ | -------- | -------------------------------------------------------------------- |
| chart_type         | string | line     | Chart type: line (detailed) or stacked_bar (overview)                |
| total_power_entity | string | _none_   | Total power entity ID for untracked power visualization (bar charts) |
| legend_style       | string | entities | Legend display style: entities, compact, none                        |
| axis_style         | string | all      | Axis display: all, x_only, y_only, none                              |
| line_type          | string | normal   | Line style: normal, gradient, gradient_no_fill, no_fill              |

### Feature Flags

| Feature                  | Description                              |
| ------------------------ | ---------------------------------------- |
| hide_name                | Hide the card name from display          |
| exclude_default_entities | Exclude default auto-discovered entities |

### Entity Requirements

**Power Entity:**

- `device_class: power`
- `unit_of_measurement: W`
- Example: `sensor.living_room_power`

**Energy Entity:**

- `device_class: energy`
- `unit_of_measurement: kWh`
- Example: `sensor.living_room_energy`

### Auto-discovery

The card automatically discovers energy and power entities within the specified area based on:

- Entity `device_class` (power or energy)
- Entity `unit_of_measurement` (W for power, kWh for energy)
- Entity relationships to the area

This includes sensors with the appropriate device classes and units.

## Example Configurations

### Basic Configuration

```yaml
type: custom:area-energy-card
area: living_room
```

### With Custom Name

```yaml
type: custom:area-energy-card
area: living_room
name: 'Living Room Energy Monitor'
```

### With Custom Entities

```yaml
type: custom:area-energy-card
area: living_room
entities:
  - sensor.living_room_power
  - sensor.living_room_energy
```

### With Custom Entity Colors

```yaml
type: custom:area-energy-card
area: living_room
entities:
  - sensor.living_room_power # Default color
  - entity_id: sensor.living_room_energy
    color: '#ff6b6b' # Custom red color
  - entity_id: sensor.kitchen_power
    color: '#4ecdc4' # Custom teal color
  - entity_id: sensor.bedroom_power
    color: 'primary' # Home Assistant theme color
```

### With Chart Configuration

```yaml
type: custom:area-energy-card
area: living_room
chart:
  chart_type: stacked_bar # Use bar charts for better overview
  legend_style: compact
  axis_style: y_only
  line_type: gradient
```

### With Untracked Power Visualization

```yaml
type: custom:area-energy-card
area: living_room
chart:
  chart_type: stacked_bar # Required for untracked power
  total_power_entity: sensor.total_power # Your total power entity
```

**Note**: Untracked power visualization only works with `chart_type: stacked_bar`. The card will automatically calculate and display the difference between total power and the sum of tracked power entities.

### With Feature Flags

```yaml
type: custom:area-energy-card
area: living_room
features:
  - hide_name
  - exclude_default_entities
```

### Full Configuration Example

```yaml
type: custom:area-energy-card
area: living_room
name: 'Living Room Energy Monitor'
entities:
  - sensor.living_room_power # Default color
  - entity_id: sensor.living_room_energy
    color: '#10b981' # Custom green color
chart:
  chart_type: stacked_bar # Use bar charts
  total_power_entity: sensor.total_power # Track untracked power
  legend_style: entities
  axis_style: all
  line_type: gradient_no_fill
features:
  - hide_name
```

## Screenshots

_Coming soon - screenshots of the card in action will be added here._

## Project Roadmap

- [x] **`Initial design`**: Create initial area energy card design
- [x] **`Area-based discovery`**: Automatic detection of energy/power entities within areas
- [x] **`Dual metric display`**: Real-time power (W) and energy (kWh) visualization
- [x] **`Chart integration`**: Chart.js implementation with dual Y-axis support
- [x] **`Modern UI`**: Professional design with theme integration
- [x] **`Configuration options`**: Visual editor and YAML support
- [x] **`Feature flags`**: Toggle functionality like hiding card name
- [x] **`Chart customization`**: Multiple line types and legend styles
- [x] **`Performance optimization`**: Efficient rendering with memoization
- [x] **`TypeScript support`**: Full type safety and modern development
- [x] **`UI improvements`**: Tweaks and changes for the UI - thanks @LamarcLS
- [x] **`Custom entity colors`**: Choose colors for individual chart items - thanks @LamarcLS
- [x] **`Chart type selection`**: Line and Stacked Bar chart options - thanks @LamarcLS
- [x] **`Untracked power visualization`**: Visualize power consumption not tracked by individual entities - thanks @LamarcLS

## Contributing

- **💬 [Join the Discussions](https://github.com/homeassistant-extras/ohm-assistant/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/homeassistant-extras/ohm-assistant/issues)**: Submit bugs found or log feature requests for the `ohm-assistant` project.
- **💡 [Submit Pull Requests](https://github.com/homeassistant-extras/ohm-assistant/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **📣 [Check out discord](https://discord.gg/NpH4Pt8Jmr)**: Need further help, have ideas, want to chat?
- **🃏 [Check out my other cards!](https://github.com/orgs/homeassistant-extras/repositories)** Maybe you have an integration that I made cards for.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your GitHub account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/homeassistant-extras/ohm-assistant
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to GitHub**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

## Development

### Prerequisites

- Node.js 18+
- Yarn or npm

### Setup

```bash
cd ohm-assistant
yarn install
```

### Development Mode

```bash
yarn watch
```

### Build

```bash
yarn build
```

### Testing

```bash
yarn test
```

### Formatting

```bash
yarn format
```

## License

This project is protected under the MIT License. For more details, refer to the [LICENSE](LICENSE) file.

## Acknowledgments

- Built using [LitElement](https://lit.dev/)
- Chart visualization powered by [Chart.js](https://www.chartjs.org/)
- Inspired by modern energy monitoring dashboards
- Thanks to all contributors!

[![contributors](https://contrib.rocks/image?repo=homeassistant-extras/ohm-assistant)](https://github.com/homeassistant-extras/ohm-assistant/graphs/contributors)

[![ko-fi](https://img.shields.io/badge/buy%20me%20a%20coffee-72A5F2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/N4N71AQZQG)

## Code Quality

Forgive me and my badges..

Stats

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=bugs)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=coverage)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)

Ratings

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=homeassistant-extras_ohm-assistant&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=homeassistant-extras_ohm-assistant)

## Build Status

### Main

[![CodeQL](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/github-code-scanning/codeql)
[![Dependabot Updates](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/dependabot/dependabot-updates/badge.svg?branch=main)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/dependabot/dependabot-updates)
[![Main Branch CI](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/main-ci.yaml/badge.svg?branch=main)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/main-ci.yaml)
[![Fast Forward Check](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/pull_request.yaml/badge.svg?branch=main)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/pull_request.yaml)

### Release

[![Release & Deploy](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/release-cd.yaml/badge.svg)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/release-cd.yaml)
[![Merge](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/merge.yaml/badge.svg)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/merge.yaml)

### Other

[![Issue assignment](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/assign.yaml/badge.svg)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/assign.yaml)
[![Manual Release](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/manual-release.yaml/badge.svg)](https://github.com/homeassistant-extras/ohm-assistant/actions/workflows/manual-release.yaml)
