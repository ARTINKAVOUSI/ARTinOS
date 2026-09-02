# ARTINOS System Studio 0.12.0

React + TypeScript reference application for the reusable ARTINOS platform packages:

- `@artinos/ui` **0.9.0** — UI Kernel, ParameterGraph, schema-driven UI, MetaComp controls, design language, reusable ContextMenu/action surfaces and expressive interaction.
- `@artinos/metablock` **0.16.0** — MetaBlock spatial engine for viewport, docks, panels, floating surfaces, grouping/regrouping, snapping, docking, recursive Workspaces, context relationships and topology-aware interaction.

## Canonical architecture

```text
MetaBlock = SPACE
MetaComp  = CONTROL COMPOSITION
Parameter = STATE / MEANING
```

Panel, Dock, Viewport, Toolbar and Floating Window are **roles/postures of MetaBlock**, not separate competing primitives.

## Canonical Studio composition

```text
LOCKED FULLSCREEN VIEWPORT METABLOCK
│
├── COMMAND DOCK METABLOCK   (persistent parent)
│   ├── Scene MetaBlock
│   ├── Material MetaBlock
│   ├── Render MetaBlock
│   └── Bake MetaBlock
│
├── Floating / snapped / docked child MetaBlocks
└── Tool / overlay MetaBlocks
```

The rendering viewport always stays fullscreen and locked. The Dock is layered above it and is a real parent MetaBlock containing child Panel-role MetaBlocks.

## Dock containment invariant

The reference composition now treats the bottom command surface as a **persistent parent Dock MetaBlock**, not as a layout region that its children can accidentally replace. Its Scene / Material / Render / Bake children remain contained by default.

A child panel is never allowed to become an implicit root-center/fullscreen dock. Fullscreen is reserved for the locked viewport and explicit maximize actions. Legacy or stale workspace states that contain an extracted root-center panel are repaired by `@artinos/metablock` into the panel's bounded preferred floating geometry.

The Dock also declares a home Workspace Zone. `repairSpatialState()` restores persistent Docks to that zone when older saved layouts contain an invalid posture.

## Parent-aware detach / float / snap / dock / regroup

`@artinos/metablock` now owns the complete relationship lifecycle.

A child panel can move through:

```text
PARENT DOCK
  ↓ drag
PEEL / DETACH PREVIEW
  ↓ release in free space
FLOATING — controlled default size
  ↓ near edge
SOFT SNAP — still floating
  ↓ stable Dock Field
STRUCTURAL DOCK
  ↓ drag again
FLOAT / SPLIT / GROUP / ATTACH BACK TO PARENT
```

Important behavior:

- the Dock stays a Dock even when its last child detaches;
- an empty Dock remains a visible/valid attachment target;
- detached panels never inherit fullscreen or giant Dock dimensions;
- original parent + tab index + spatial relationship are remembered by the MetaBlock core;
- the original Dock gets a stronger semantic `ATTACH BACK TO PARENT` field;
- another Dock gets `ATTACH TO DOCK`;
- center of a regular MetaBlock group means `GROUP / MERGE`;
- target edges mean directional `SPLIT`;
- Workspace edges mean structural `DOCK`;
- releasing on an unarmed workspace-edge guide means `SNAP` and remains floating;
- holding inside the stronger Dock Field arms structural `DOCK`;
- dropping in a Dock body means attach/group, never split the Dock itself;
- dragging a docked leaf visually morphs toward its preferred floating size rather than carrying the Dock's large geometry;
- a panel that is regrouped into a new stable Dock adopts that Dock as its next return parent;
- free space means `FLOAT`.

## Fullscreen / maximize

The viewport remains locked fullscreen underneath everything.

Maximizing a Panel MetaBlock does **not** maximize its parent Dock. The leaf MetaBlock is promoted to its own spatial surface, maximized over the viewport, then can restore/return to its parent relationship.

## Smart right-click actions

Right-click a panel tab or its active content surface.

The MetaBlock package computes the relationship/capability model; the Studio renders it through `@artinos/ui`'s reusable `ContextMenu`.

The menu adapts to context and can show:

- current parent relationship;
- Attach Back to original Dock/Group;
- Detach from Parent & Float;
- Snap edges while remaining floating;
- structural Dock edges;
- Attach to Dock / Group with another MetaBlock;
- Pin / Auto-hide;
- Maximize over Viewport / Restore;
- Pop Out;
- Close.

This avoids Studio-specific panel logic. The application only declares MetaBlocks and content; package code owns the spatial behavior.

## Studio

`apps/studio/index.html`

- viewport is a locked fullscreen MetaBlock;
- command surface is a persistent Dock-role MetaBlock;
- Scene / Material / Render / Bake are child MetaBlocks with explicit preferred floating sizes;
- child MetaBlocks reorder, detach, float, snap, dock, split and regroup independently;
- nested Inspector sections are nested MetaBlock Workspaces;
- all controls/chrome/context menus come from `@artinos/ui`.

## System Editor

`apps/studio/editor.html`

A separate package-native editor for World, MetaComp, MetaBlock, Layout, Behavior, Motion, Type and Accessibility. Settings persist and live-sync into the Studio.

## Run

```bash
npm install
npm run validate
npm run dev
```

Production:

```bash
npm run build
```

## Git / PR workflow

```bash
npm run sync -- "describe the change"
```

The repository includes CI, automatic PR creation/update for work branches, Dependabot and local validation before sync. Automatic merge remains disabled; CI/review is the merge gate.
