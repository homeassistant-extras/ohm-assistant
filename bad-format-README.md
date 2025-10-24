# ⚡ Ohm Assistant Card

A modern, professional Home Assistant custom card for displaying electricity usage and power consumption data.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Home Assistant](https://img.shields.io/badge/home%20assistant-2024.1+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- 📊 **Dual Metric Display**: Shows both real-time power consumption (W) and daily energy usage (kWh)
- 🎨 **Modern Design**: Clean, professional card design with gradient icons and smooth animations
- 🌓 **Theme Support**: Automatically adapts to Home Assistant's theme
- ⚡ **Live Updates**: Real-time data updates from your Home Assistant sensors
- 🎯 **Easy Configuration**: Simple visual editor for configuration
- 📱 **Responsive**: Adapts to different screen sizes

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend"
3. Click the "+" button
4. Search for "Ohm Assistant Card"
5. Click "Install"
6. Restart Home Assistant

### Manual Installation

1. Download `ohm-assistant.js` from the latest release
2. Copy it to your `config/www` folder
3. Add a resource reference in your Lovelace configuration:

```yaml
resources:
  - url: /local/ohm-assistant.js
    type: module
```

4. Restart Home Assistant

## Configuration

### Visual Editor

The easiest way to configure the card is through the visual editor:

1. Add a new card to your dashboard
2. Search for "Ohm Assistant Card"
3. Configure the entities and options

### YAML Configuration

```yaml
type: custom:area-energy-card
name: Living Room Electricity
power_entity: sensor.living_room_15_1min
energy_entity: sensor.living_room_15_1d
```

### Configuration Options

| Name            | Type   | Default             | Description                                     |
| --------------- | ------ | ------------------- | ----------------------------------------------- |
| `type`          | string | **Required**        | Must be `custom:area-energy-card`               |
| `name`          | string | `Electricity Usage` | Card title                                      |
| `power_entity`  | string | Optional            | Entity ID for power sensor (should be in Watts) |
| `energy_entity` | string | Optional            | Entity ID for energy sensor (should be in kWh)  |

### Entity Requirements

**Power Entity:**

- `device_class: power`
- `unit_of_measurement: W`
- Example: `sensor.living_room_15_1min`

**Energy Entity:**

- `device_class: energy`
- `unit_of_measurement: kWh`
- Example: `sensor.living_room_15_1d`

## Example Configurations

### Minimal Configuration

```yaml
type: custom:area-energy-card
power_entity: sensor.power_consumption
energy_entity: sensor.energy_today
```

### Full Configuration

```yaml
type: custom:area-energy-card
name: Living Room Energy Monitor
power_entity: sensor.living_room_15_1min
energy_entity: sensor.living_room_15_1d
```

### Power Only

```yaml
type: custom:area-energy-card
name: Current Power Usage
power_entity: sensor.power_consumption
```

### Energy Only

```yaml
type: custom:area-energy-card
name: Today's Energy Usage
energy_entity: sensor.energy_today
```

## Screenshots

_Coming soon_

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

## Troubleshooting

### Card Not Showing Up

1. Make sure you've added the resource to your Lovelace configuration
2. Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
3. Check the browser console for errors

### Entity Unavailable

1. Verify the entity ID is correct
2. Check that the entity exists in Developer Tools > States
3. Ensure the entity has the correct `device_class` and `unit_of_measurement`

### Styling Issues

1. The card uses Home Assistant's theme variables
2. Try switching between light and dark themes
3. Check for custom theme conflicts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Created by Patrick Masters

Inspired by the design patterns from the home-assistant-cards repository.

## Support

If you find this card useful, please consider:

- Starring the repository
- Reporting issues
- Contributing improvements
