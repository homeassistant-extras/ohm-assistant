# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Cross-agent instructions live in [AGENTS.md](./AGENTS.md), with scoped `AGENTS.md` files under most `src/` subdirectories. Read the nearest one before changing files in a subtree.

## What this is

A Home Assistant custom dashboard card (`area-energy-card`, packaged as `ohm-assistant`) for visualizing power (W) and energy (kWh) usage in an area, built with **Lit 3** and **Chart.js 4**. Bundled by **Parcel** into a single ES module (`dist/ohm-assistant.js`) loaded as a Lovelace resource.

## Package manager

Yarn. Don't use npm — `yarn.lock` is the source of truth.

## Commands

- `yarn build` — Parcel production build to `dist/`
- `yarn watch` — Parcel watch mode
- `yarn test` — Mocha with `tsconfig.test.json` (uses `mocha.setup.ts` to wire JSDOM + path aliases)
- `yarn test:coverage` — NYC/Istanbul coverage
- `yarn test:watch` — Mocha watch mode
- `yarn format` — Prettier (with import-sort plugins)
- `yarn update` — `npm-check-updates -u && yarn install`

Run a single test:

```bash
TS_NODE_PROJECT='./tsconfig.test.json' npx mocha test/path/to/file.spec.ts
```

## Architecture

### Entry point
`src/index.ts` registers custom elements (`area-energy-card`, `area-energy-card-editor`, and the three `ohm-assistant-*-editor` sub-elements) and pushes a descriptor onto `globalThis.customCards` so Home Assistant's dashboard picker can find the card.

### Layers
- `src/cards/` — Lit components. `card.ts` is the main `AreaEnergy` element; `editor.ts` is the visual config editor; `cards/components/` holds the chart and editor sub-elements.
- `src/delegates/` — Non-UI logic split into `retrievers/` (pull entities/state/history from HASS) and `utils/` (calculations, formatting, untracked-power math).
- `src/html/` — `lit-html` template functions; `chart/` builds Chart.js datasets and options; standalone templates (`no-good.ts`, `watching-waiting.ts`, `state-display.ts`) render empty/loading/error states.
- `src/hass/` — Vendored Home Assistant types and helpers (`common/`, `data/`, `panels/`, `ws/`, `components/`). Treat this as a third-party surface — see `src/hass/README.md` and its `AGENTS.md` before editing.
- `src/config/` — Config schema and feature-flag helpers (`feature.ts`).
- `src/types/` — `config.ts` (card YAML schema) and `entity.ts` (entity object format with optional `color`/`name`).
- `src/common/` — Shared helpers (color resolution, etc.).
- `src/styles.ts` — Global Lit `css` blocks used by the card.

### Data flow
1. HA hands the card a config (area + optional entities/chart/features).
2. A `@lit/task` in `card.ts` runs delegate retrievers to resolve the area's power/energy entities (auto-discovery via `device_class` + `unit_of_measurement`, overridable by `entities`) and fetch history.
3. Chart templates in `src/html/chart/` build Chart.js datasets, including the untracked-power calculation (`total_power_entity - sum(tracked)`) for stacked chart types.
4. Lit re-renders on HASS state updates; `memoize-one` and `fast-deep-equal` guard expensive recomputes.

### Chart modes
`chart.chart_type` is `line` | `stacked_bar` | `stacked_line`. Untracked-power visualization is only meaningful for the stacked types and requires `chart.total_power_entity`. Power and energy each get their own Y-axis, but an axis is only rendered when data of that kind is present.

## Path aliases (tsconfig.json)

`@/*`, `@cards/*`, `@config/*`, `@delegates/*`, `@helpers/*`, `@html/*`, `@type/*`, `@common/*`, `@hass/*`, `@test/*`. Tests resolve these via `tsconfig-paths` loaded from `mocha.setup.ts`.

## Testing

Mocha + Chai + Sinon, JSDOM for DOM. `mocha.setup.ts` configures the environment; `test/` mirrors `src/`. Use `@open-wc/testing-helpers` for fixture-based component tests.

## Conventions worth knowing

- Strict TypeScript with experimental decorators (Lit). `useDefineForClassFields` is **false** — required for Lit `@property` decorators to work correctly.
- Prettier uses both `@trivago/prettier-plugin-sort-imports` and `prettier-plugin-organize-imports`; just run `yarn format` rather than hand-ordering imports.
- The card is published as a single ES module — Parcel's `module` target has `includeNodeModules: true`, so all deps get bundled. Be mindful of bundle size when adding dependencies.
