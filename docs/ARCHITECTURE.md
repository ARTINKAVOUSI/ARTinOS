# ARTINOS Studio Architecture Contract

## Canonical model

```text
MetaBlock = SPACE
MetaComp  = CONTROL COMPOSITION
Parameter = STATE / MEANING
```

There is **one spatial primitive: MetaBlock**.

`panel`, `dock`, `viewport`, `group`, `toolbar`, `sidebar`, `floating window`, `overlay`, and `popout` are MetaBlock roles/postures — not parallel primitive classes.

## `@artinos/metablock`

Owns all spatial behavior and rendering contracts:

- authoritative `blocks` registry
- container/group MetaBlocks and explicit parent/child relationships
- persistent parent MetaBlocks (Dock/Workspace containers survive empty-child states)
- relationship introspection for parent, siblings, return-home and posture context
- tabbing/grouping of child MetaBlocks
- detach / float / dock / split / merge
- package-owned return-home state: original group, tab index and spatial posture
- soft edge snap as a floating relationship, explicitly separate from structural Dock
- root and target docking
- locked fullscreen viewport MetaBlocks
- floating / pinned / auto-hide / popout / maximized postures
- recursive/nested Workspaces
- Workspace Zones
- Dock Fields, hysteresis, exact landing previews and smart guides
- snapping independent from docking
- motion/physics pose: lift, inertia, velocity tilt, magnetism and settle
- resize / focus / z-order
- persistence/history/migration
- MetaBlend topology presentation

Compatibility `Panel` APIs may remain temporarily, but Studio code must use the canonical `createMetaBlock`, `attachBlock`, `moveBlock`, `floatBlock`, `returnBlock`, `snapBlockToEdge`, `dockBlock`, `splitBlock`, `mergeBlock` and `activateBlock` APIs.

## Locked fullscreen render surface

The renderer/viewport is a MetaBlock container with:

```text
role = viewport
posture = fullscreen-locked
lockedFullscreen = true
```

It always resolves to the complete Workspace rectangle and cannot be displaced by docks. All UI MetaBlocks compose over or relative to it.

## Dock composition

A dock is itself a MetaBlock container:

```text
MetaBlock(role=dock)
├── MetaBlock(role=panel) Scene
├── MetaBlock(role=panel) Material
├── MetaBlock(role=panel) Render
└── MetaBlock(role=panel) Bake
```

Each child MetaBlock can independently reorder, detach, float, soft-snap, dock, split, merge into another MetaBlock container, maximize over the locked viewport, or rejoin/return to the dock without changing identity. The Dock is persistent even when empty. Detach records its source parent + tab index + spatial posture in the MetaBlock engine so regrouping is deterministic.


## Dock containment and fullscreen safety

A parent Dock is a bounded MetaBlock container, not a child panel's fallback fullscreen region. Ordinary panel/leaf MetaBlocks may only use `center` docking when a concrete target container exists; root-center is reserved for explicitly authorized architectural surfaces.

Persistent Docks can declare a home Workspace Zone. `repairSpatialState()` is a package-level migration/repair boundary that restores stale Docks to that zone and converts stale detached root-center panels into bounded floating surfaces using their preferred floating geometry.

The intended transition grammar is:

```text
child in Dock
→ drag / peel preview
→ preferred-size floating pose
→ free release = float
→ unarmed edge release = snap, still floating
→ held/armed edge field = structural dock
→ Dock body = attach/group
→ ordinary group edge = split
→ remembered parent = exact return
```

A real regroup into a new stable Dock/Group updates the semantic parent relationship: subsequent detach/return resolves to that new parent rather than an obsolete historical Dock.

## Spatial physics

Structural state remains exact. Physics applies only to transient visual pose.

Canonical interaction:

```text
quiet
→ contact
→ lift
→ travel / velocity response
→ Dock Field proximity
→ magnetic attraction
→ exact preview
→ commit
→ topology resolve
→ spring settle
```

Fresh input interrupts motion immediately. Reduced-motion keeps state and spatial feedback but suppresses expressive pose.

## `@artinos/ui`

Owns:

- ParameterGraph
- schema-driven UI
- MetaComp composition
- production controls
- application chrome
- design tokens/material worlds
- adaptive density/presentation
- shared physical micro-interaction
- accessibility
- reusable ContextMenu/action-surface presentation
- persistent/live system settings

MetaComps use proximity, contact compression, velocity response and precision cues while keeping Parameter state exact.

## Studio rule

Studio may define:

- application content
- parameter schemas
- MetaBlock roles/metadata
- initial Workspace relationships
- theme/system values

Studio must not implement substitute panels, docks, tabs, windows, sliders, inspectors or spatial interaction. If the packages cannot express the desired result, extend the packages.

## System Editor

The System Editor is a separate React + TypeScript application composed from the same packages. Its toolbar, navigation, settings, preview and background are MetaBlocks. The preview is a nested live MetaBlock Workspace — not a hand-drawn rectangle.

All editor settings are real Parameters, persist through `syncParameterGraph`, and broadcast to open Studio/editor instances.

## Context-aware panel actions

Spatial semantics are owned by `@artinos/metablock`; visual menu presentation is owned by `@artinos/ui`. `MetaBlockWorkspaceView` produces a relationship-aware action model and Studio renders that model with the UI package `ContextMenu`.

A panel inside a Dock therefore sees parent-aware actions such as **Detach from Command Surface**. The same panel after detaching sees **Attach Back to Command Surface**. Other eligible Dock MetaBlocks appear as **Attach to Dock** targets, while ordinary containers appear as **Group / Merge** targets.

Maximize is leaf-aware: maximizing a child panel never maximizes its parent Dock. The viewport remains a locked fullscreen MetaBlock underneath.
