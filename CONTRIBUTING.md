# Contributing to ARTINOS

ARTINOS uses a package-first architecture:

- `@artinos/metablock` owns **SPACE**: MetaBlock identity, topology, docking, floating, grouping, layout, physics and spatial interaction.
- `@artinos/ui` owns **CONTROL COMPOSITION + STATE**: ParameterGraph, MetaComp, schema-driven UI, interaction, motion, design tokens and React controls.
- `apps/studio` is a consumer and proof environment. It must not recreate package primitives locally.

## Branch flow

Work on `work/*`, `feature/*`, `fix/*`, `refine/*` or `agent/*` branches. Pushing one of these branches automatically creates or updates a PR into `main`.

Before pushing:

```bash
npm run validate
```

For a validated commit + push + PR sync:

```bash
npm run sync -- "refine metablock docking"
```

## Merge gate

A change is not complete until TypeScript, behavioral tests, package-native verification and production build pass.
