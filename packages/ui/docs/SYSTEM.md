# @artinos/ui — core system

```text
UI Kernel
├── ParameterGraph
├── reactive signals / events
├── history / transactions
├── scheduler
├── bindings
├── component metadata
├── interaction
├── motion / physics helpers
├── adaptive layout
└── serialization
        │
        ▼
Schema + Control Registry
        │
        ▼
MetaComp
        │
        ▼
DOM / future renderers
```

`Parameter` owns semantic state. `MetaComp` owns one adaptive control composition around that state. The DOM renderer is an adapter, not the architecture.

Schema definitions can carry presentation, emphasis, label mode, importance, ticks, actions, descriptions and section metadata. The same resolver is used by hand-authored and generated UI.
