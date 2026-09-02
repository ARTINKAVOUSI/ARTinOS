import { ParameterGraph, defineControls, type ControlSchema, type SchemaEntry } from '@artinos/ui';
import { MetaBlockWorkspace } from '@artinos/metablock';
import { defineSystemSettings } from '../../shared/system-schema.js';

export interface StudioSectionSpec { id:string; title:string; footer:string; schema:ControlSchema; entries:SchemaEntry[] }
export interface StudioPageSpec { id:string; label:string; count:number; sections:StudioSectionSpec[] }
export interface StudioModel {
  graph:ParameterGraph;
  workspace:MetaBlockWorkspace;
  pageSpecs:Record<string,StudioPageSpec>;
  systemEntries:Record<string,SchemaEntry[]>;
  quickEntries:SchemaEntry[];
  ids:{viewportGroup:string;dockGroup:string;quickGroup:string;viewportZone:string};
}

const pageSchemas:Record<string,{label:string;count:number;groups:Array<{title:string;footer:string;schema:ControlSchema}>}>= {
  scene:{label:'SCENE',count:12,groups:[
    {title:'ENVIRONMENT',footer:'HDRI · STUDIO_SOFT_4K',schema:{intensity:{value:1.24,min:0,max:2,step:.001,unit:'EV',label:'Intensity',ticks:8,emphasis:'hero'},rotation:{value:-135,min:-180,max:180,step:1,unit:'°',label:'Rotation',ticks:9},horizonBlur:{value:.08,min:0,max:1,step:.01,label:'Horizon blur'},groundShadow:{value:.62,min:0,max:1,step:.01,label:'Ground shadow',meta:{signal:'MIDI 12'}}}},
    {title:'MATERIAL',footer:'8 SLOTS · 2 SHARED',schema:{roughness:{value:.34,min:0,max:1,step:.01,label:'Base roughness',ticks:6},clearcoat:{value:.80,min:0,max:1,step:.01,label:'Clearcoat'},anisotropy:{value:.12,min:0,max:1,step:.01,label:'Anisotropy'},sheenTint:{value:0,min:0,max:1,step:.01,label:'Sheen tint',emphasis:'utility'}}},
    {title:'RENDER',footer:'WEBGPU · ACESCG',schema:{samples:{value:512,min:32,max:1024,step:32,label:'Samples',type:'integer'},bounces:{value:6,min:1,max:12,step:1,label:'Max bounces',type:'integer'},denoise:{value:'ON',options:['OFF','ON'],presentation:'segmented',label:'Denoise'},resolution:{value:2560,min:512,max:4096,step:128,unit:'px',label:'Resolution',type:'integer'}}}
  ]},
  material:{label:'MATERIAL',count:8,groups:[
    {title:'SURFACE',footer:'PHYSICAL · ENERGY CONSERVING',schema:{baseColor:{value:'#7db9ae',type:'color',label:'Base color',presentation:'color',emphasis:'hero'},metalness:{value:.18,min:0,max:1,step:.01,label:'Metalness'},transmission:{value:.22,min:0,max:1,step:.01,label:'Transmission'},ior:{value:1.45,min:1,max:2.5,step:.01,label:'IOR'},model:{value:'PHYSICAL',options:['PHYSICAL','TOON'],presentation:'segmented',label:'Model'}}},
    {title:'COATING',footer:'2 LAYERS · 1 LINKED',schema:{coat:{value:.8,min:0,max:1,step:.01,label:'Clearcoat'},coatRoughness:{value:.22,min:0,max:1,step:.01,label:'Coat roughness'},sheen:{value:.04,min:0,max:1,step:.01,label:'Sheen'},layer:{value:'TOP',options:['TOP','MIX'],presentation:'segmented',label:'Layer'}}},
    {title:'MAPPING',footer:'OBJECT · LOCAL',schema:{uvScale:{value:[1,1,1],type:'vec3',step:.01,label:'Scale',presentation:'vector'},rotation:{value:0,min:-180,max:180,step:1,unit:'°',label:'Rotation'},colorRamp:{value:['#25302e','#7db9ae','#d7dedb'],type:'gradient',presentation:'gradient',label:'Color ramp',emphasis:'hero'}}}
  ]},
  render:{label:'RENDER',count:6,groups:[
    {title:'QUALITY',footer:'PATH · ADAPTIVE',schema:{samples:{value:512,min:32,max:2048,step:32,type:'integer'},threshold:{value:.03,min:.001,max:.15,step:.001,label:'Noise threshold'},bounces:{value:6,min:1,max:16,step:1,type:'integer'},denoise:{value:'ON',options:['OFF','ON'],presentation:'segmented'}}},
    {title:'POST',footer:'3 PASSES · HDR',schema:{bloom:{value:.16,min:0,max:1,step:.01},vignette:{value:.28,min:0,max:1,step:.01},chromatic:{value:.04,min:0,max:.2,step:.01},tone:{value:'ACES',options:['ACES','AGX'],presentation:'segmented'}}},
    {title:'OUTPUT',footer:'EXR · 16 BIT',schema:{exposure:{value:0,min:-3,max:3,step:.05,unit:'EV',ticks:7},gamma:{value:2.2,min:1,max:3,step:.1},scale:{value:100,min:25,max:200,step:25,unit:'%',type:'integer'},alpha:{value:'ON',options:['OFF','ON'],presentation:'segmented'}}}
  ]},
  bake:{label:'BAKE',count:3,groups:[
    {title:'LIGHTMAP',footer:'READY · 0 WARNINGS',schema:{size:{value:2048,min:256,max:8192,step:256,type:'integer',unit:'px'},margin:{value:8,min:1,max:32,step:1,type:'integer',unit:'px'},quality:{value:'HIGH',options:['LOW','MED','HIGH'],presentation:'segmented'},padding:{value:.12,min:0,max:1,step:.01}}},
    {title:'PROBES',footer:'64 PROBES · AUTO',schema:{density:{value:.55,min:0,max:1,step:.01},radius:{value:3.2,min:.1,max:10,step:.1,unit:'m'},bounce:{value:3,min:0,max:8,step:1,type:'integer'},adaptive:{value:true,label:'Adaptive'}}},
    {title:'CACHE',footer:'1.8 GB · LOCAL',schema:{compression:{value:.72,min:0,max:1,step:.01},history:{value:12,min:1,max:30,step:1,type:'integer'},mode:{value:'AUTO',options:['AUTO','MANUAL'],presentation:'segmented'},path:{value:'./cache',presentation:'text',label:'Path'}}}
  ]}
};

export function createStudioModel():StudioModel{
  const graph=new ParameterGraph({historyLimit:480}),workspace=new MetaBlockWorkspace({id:'artinos-studio',historyLimit:320});

  // The render surface is a locked fullscreen MetaBlock. All UI MetaBlocks compose over/relative to it.
  const viewportGroup=workspace.createGroup({id:'viewport-main',title:'Viewport',role:'viewport',posture:'fullscreen-locked',lockedFullscreen:true,meta:{workspaceBase:true,variant:'render-surface'}});
  workspace.createMetaBlock({id:'viewport',title:'Viewport',role:'viewport',meta:{renderSurface:true}},{groupId:viewportGroup});

  const viewportZone=workspace.createWorkspaceZone({id:'viewport-tools',bounds:{x:0,y:0,width:1,height:1,unit:'relative'},modes:['overlay','bottom-dock','right-dock','left-dock','floating'],adaptive:{compactWidth:720,compactMode:'overlay',wideAspect:1.6,wideMode:'bottom-dock',tallAspect:.9,tallMode:'right-dock',balancedMode:'bottom-dock'},clip:false,layout:'cascade',meta:{role:'viewport-tools'}});

  // Dock is itself a MetaBlock container. Scene/Material/Render/Bake are child MetaBlocks and can detach independently.
  const dockGroup=workspace.createGroup({id:'dock-main',title:'Command Surface',role:'dock',posture:'zone',meta:{variant:'command-surface',persistentContainer:true,containerMode:'tabs',homeZoneId:'viewport-tools',homeZoneMode:'bottom-dock',lockHomeZone:false,edgeInset:{left:38,right:38,bottom:24,top:8},zoneSize:.31,preferredFloatingSize:{width:980,height:360}},capabilities:{closable:false,movable:true,resizable:true,floatable:true,dockable:true,splittable:true,maximizable:true,pinable:true,autoHideable:true,acceptsDrop:true}});
  const panelFloatingSizes:Record<string,{width:number;height:number}>={scene:{width:610,height:430},material:{width:560,height:410},render:{width:540,height:390},bake:{width:500,height:360}};
  for(const[id,title,count]of[['scene','Scene',12],['material','Material',8],['render','Render',6],['bake','Bake',3]] as const)workspace.createMetaBlock({id,title,role:'panel',meta:{variant:'inspector',count,homeDockId:dockGroup,preferredFloatingSize:panelFloatingSizes[id],preferredDockSize:.28,topLevelPanel:true},capabilities:{closable:true,movable:true,resizable:true,floatable:true,dockable:true,splittable:true,tabbable:true,popoutable:true,maximizable:true,pinable:true,autoHideable:true,nestable:true,acceptsDrop:true}},{groupId:dockGroup});
  workspace.placeGroupInZone(dockGroup,viewportZone,{mode:'bottom-dock'});workspace.activateBlock('scene');

  const quickGroup=workspace.createGroup({id:'quick-tools',title:'Workspace Tools',role:'tool',posture:'floating',meta:{variant:'quick-controls',visible:true},capabilities:{closable:false,popoutable:false,maximizable:false}});
  workspace.createMetaBlock({id:'quick-tools-panel',title:'Workspace',role:'panel',meta:{variant:'quick-controls'}},{groupId:quickGroup});workspace.floatGroup(quickGroup,{x:1100,y:310,width:174,height:196});

  const pageSpecs:Record<string,StudioPageSpec>={};
  for(const[id,spec]of Object.entries(pageSchemas))pageSpecs[id]={id,label:spec.label,count:spec.count,sections:spec.groups.map((section,index)=>({id:`${id}-${index}`,title:section.title,footer:section.footer,schema:section.schema,entries:defineControls(graph,section.schema,{prefix:`page.${id}.${section.title.toLowerCase()}`} )}))};
  const systemEntries=defineSystemSettings(graph);
  const quickSchema:ControlSchema={size:{value:'M',options:['S','M','L'],presentation:'segmented',label:'SIZE'},position:{value:'BOTTOM',options:['BOTTOM','LEFT','RIGHT'],presentation:'segmented',label:'POSITION'},theme:{value:'GLASS',options:['GLASS','GRAPHITE','STONE','SMOKE','MONOLITH','LIGHT'],presentation:'select',label:'THEME'}};
  const quickEntries=defineControls(graph,quickSchema,{prefix:'quick'});
  return{graph,workspace,pageSpecs,systemEntries,quickEntries,ids:{viewportGroup,dockGroup,quickGroup,viewportZone}};
}
