import { defineControls, type ControlSchema, type ParameterGraph, type SchemaEntry } from '@artinos/ui';

export const SYSTEM_SETTINGS_PREFIX='system.';
export const SYSTEM_SETTINGS_STORAGE='artinos.system.design.v6';
export const SYSTEM_SETTINGS_CHANNEL='artinos.system.design.live.v6';

export const systemSchemas:Record<string,ControlSchema>={
  world:{
    world:{value:'GLASS',options:['GLASS','GRAPHITE','STONE','SMOKE','MONOLITH','LIGHT'],presentation:'select',label:'Material world',emphasis:'hero'},
    frost:{value:42,min:0,max:72,step:1,unit:'px',label:'Optical diffusion',ticks:7},
    surface:{value:46,min:18,max:94,step:1,unit:'%',label:'Surface density'},
    edge:{value:8,min:2,max:20,step:1,unit:'%',label:'Edge response'},
    noise:{value:2,min:0,max:8,step:.5,unit:'%',label:'Micro roughness'},
    stage:{value:100,min:68,max:118,step:1,unit:'%',label:'Stage exposure'},
    signal:{value:'#2fb39c',type:'color',label:'Signal energy'}
  },
  metacomp:{
    height:{value:28,min:22,max:44,step:1,unit:'px',label:'Control height'},
    radius:{value:8,min:4,max:12,step:1,unit:'px',label:'Control curvature'},
    seam:{value:1,min:1,max:3,step:.5,unit:'px',label:'Seam weight'},
    labelWidth:{value:39,min:22,max:54,step:1,unit:'%',label:'Label territory'},
    gap:{value:6,min:2,max:12,step:1,unit:'px',label:'Row gap'},
    density:{value:'COMPACT',options:['MICRO','COMPACT','FULL','TOUCH'],presentation:'segmented',label:'Density'},
    labelMode:{value:'EXTERNAL',options:['EXTERNAL','INTEGRATED','CONTEXT'],presentation:'segmented',label:'Label mode'}
  },
  metablock:{
    radius:{value:12,min:6,max:24,step:1,unit:'px',label:'Surface curvature'},
    gap:{value:8,min:0,max:20,step:1,unit:'px',label:'Spatial gap'},
    dockSize:{value:286,min:210,max:480,step:5,unit:'px',label:'Dock extent'},
    dockRatio:{value:.28,min:.16,max:.42,step:.01,label:'Root dock ratio'},
    splitRatio:{value:.36,min:.20,max:.50,step:.01,label:'Split ratio'},
    field:{value:72,min:24,max:160,step:4,unit:'px',label:'Dock Field radius'},
    snap:{value:14,min:0,max:32,step:1,unit:'px',label:'Snap field'},
    hysteresis:{value:.16,min:0,max:.30,step:.01,label:'Target hysteresis'},
    intentHold:{value:92,min:0,max:220,step:4,unit:'ms',label:'Intent hold'},
    previewStrength:{value:.30,min:.10,max:.80,step:.02,label:'Preview threshold'},
    commitStrength:{value:.54,min:.20,max:.95,step:.02,label:'Commit threshold'},
    compass:{value:true,label:'Dock compass'},
    guides:{value:true,label:'Smart guides'},
    blend:{value:.62,min:0,max:1,step:.01,label:'MetaBlend field'}
  },
  layout:{
    groupGap:{value:6,min:4,max:16,step:1,unit:'px',label:'Group gutter'},
    groupInset:{value:9,min:6,max:20,step:1,unit:'px',label:'Content inset'},
    shellInset:{value:14,min:8,max:56,step:1,unit:'px',label:'Workspace inset'},
    chrome:{value:'QUIET',options:['QUIET','STANDARD','DEFINED'],presentation:'segmented',label:'Chrome contrast'},
    dockColumns:{value:'AUTO',options:['AUTO','3','2','1'],presentation:'segmented',label:'Dock columns'},
    compactMode:{value:'RECOMPOSE',options:['RECOMPOSE','STACK','FOCUS'],presentation:'segmented',label:'Compact strategy'},
    footer:{value:36,min:0,max:100,step:2,unit:'%',label:'Footer signal'}
  },
  behavior:{
    proximity:{value:true,label:'Proximity awakening'},
    precision:{value:.16,min:.04,max:.5,step:.01,label:'Precision gear'},
    offAxis:{value:42,min:20,max:100,step:2,unit:'px',label:'Off-axis precision'},
    compression:{value:.004,min:0,max:.04,step:.002,label:'Contact compression'},
    expandedHits:{value:true,label:'Expanded hit fields'},
    dragIntent:{value:'SMART',options:['SMART','EXPLICIT','FREE'],presentation:'segmented',label:'Drag intent'}
  },
  motion:{
    profile:{value:'PHYSICAL',options:['QUIET','PHYSICAL','EXPRESSIVE'],presentation:'segmented',label:'Motion profile'},
    spring:{value:420,min:80,max:560,step:10,label:'Spring'},
    damping:{value:44,min:8,max:60,step:1,label:'Damping'},
    mass:{value:1,min:.3,max:2.5,step:.1,label:'Mass'},
    magnetism:{value:.42,min:0,max:1,step:.01,label:'Magnetism'},
    inertia:{value:.04,min:0,max:1,step:.01,label:'Inertia'},
    response:{value:135,min:60,max:520,step:10,unit:'ms',label:'Surface response'},
    lift:{value:1.5,min:0,max:12,step:.5,unit:'px',label:'Grab lift'},
    tilt:{value:.10,min:0,max:3,step:.05,unit:'°',label:'Velocity tilt'}
  },
  type:{
    scale:{value:100,min:80,max:125,step:1,unit:'%',label:'UI scale'},
    labelSize:{value:10,min:8,max:13,step:.5,unit:'px',label:'Label size'},
    valueSize:{value:9.5,min:8,max:13,step:.5,unit:'px',label:'Value size'},
    tracking:{value:.08,min:0,max:.18,step:.01,unit:'em',label:'Tracking'},
    contrast:{value:'STANDARD',options:['SOFT','STANDARD','HIGH'],presentation:'segmented',label:'Type contrast'}
  },
  access:{
    reducedMotion:{value:false,label:'Reduced motion'},
    highContrast:{value:false,label:'High contrast'},
    largeTargets:{value:true,label:'Expanded hit targets'},
    focusRing:{value:'SUBTLE',options:['SUBTLE','CLEAR','STRONG'],presentation:'segmented',label:'Focus visibility'}
  }
};

export const systemEditorPages=[
  ['world','WORLD','Materials, transmission and signal'],
  ['metacomp','METACOMP','Control geometry and adaptive composition'],
  ['metablock','METABLOCK','Workspace surfaces, docking and topology'],
  ['layout','LAYOUT','Density, margins and responsive composition'],
  ['behavior','BEHAVIOR','Precision, proximity and direct manipulation'],
  ['motion','MOTION','Springs, damping and spatial kinetics'],
  ['type','TYPE','Typography and information hierarchy'],
  ['access','ACCESS','Focus, targets and reduced motion']
] as const;

export function defineSystemSettings(graph:ParameterGraph):Record<string,SchemaEntry[]>{
  return Object.fromEntries(Object.entries(systemSchemas).map(([id,schema])=>[id,defineControls(graph,schema,{prefix:`system.${id}`})]));
}

export const systemPresets={
  'Precision Glass':{
    'system.world.world':'GLASS','system.world.frost':46,'system.world.surface':43,'system.metacomp.height':28,'system.metacomp.radius':8,
    'system.metablock.radius':12,'system.metablock.gap':8,'system.motion.profile':'PHYSICAL','system.layout.chrome':'QUIET'
  },
  'Graphite Studio':{
    'system.world.world':'GRAPHITE','system.world.frost':28,'system.world.surface':68,'system.metacomp.height':27,'system.metacomp.radius':7,
    'system.metablock.radius':11,'system.metablock.gap':7,'system.motion.profile':'QUIET','system.layout.chrome':'STANDARD'
  },
  'Light Stone':{
    'system.world.world':'LIGHT','system.world.frost':34,'system.world.surface':76,'system.metacomp.height':29,'system.metacomp.radius':8,
    'system.metablock.radius':12,'system.metablock.gap':9,'system.motion.profile':'PHYSICAL','system.layout.chrome':'DEFINED'
  }
} as const;

export function applySystemPreset(graph:ParameterGraph,name:keyof typeof systemPresets){
  const preset=systemPresets[name];graph.transaction(`Apply ${name}`,()=>{for(const[id,value]of Object.entries(preset))graph.get(id)?.set(value as never,{source:'system',history:true,force:true})});
}
