# @artinos/ui 0.9.0

ARTINOS's reusable **React + TypeScript UI/control system**.

```text
Parameter = STATE / MEANING
MetaComp  = CONTROL COMPOSITION
```

It owns:

- framework-independent ParameterGraph
- exact semantic state + history/transactions
- schema-driven UI
- adaptive MetaComp presentation
- full-surface ARTINOS controls
- React Inspector/application chrome
- design tokens and material worlds
- shared physical micro-interaction
- precision / off-axis / velocity behavior
- machine-readable component metadata
- synchronized persistent system settings

MetaComps remain exact in value while their visual pose can respond to proximity, contact, velocity and precision state.

## Example

```tsx
import { ParameterGraph, defineControls, Inspector } from '@artinos/ui';
import '@artinos/ui/styles.css';

const graph = new ParameterGraph();
const entries = defineControls(graph, {
  roughness: { value: .45, min: 0, max: 1 },
  enabled: true,
  mode: { value: 'PHYSICAL', options: ['PHYSICAL', 'TOON'] }
});

export function MaterialInspector() {
  return <Inspector graph={graph} entries={entries} />;
}
```

## 0.9 contextual action surfaces

`ContextMenu` now supports section layouts (`list` or compact `grid`). MetaBlock uses this to present directional Snap and Dock actions as dense 2×2 instrument groups while keeping relationship, attach/group, posture and destructive actions as readable lists. The action semantics still come from `@artinos/metablock`; `@artinos/ui` owns the reusable visual/keyboard-accessible menu surface.
