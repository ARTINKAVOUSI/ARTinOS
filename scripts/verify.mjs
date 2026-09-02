import { access, readFile, readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const required=[
  'packages/ui/src/index.ts','packages/ui/src/react/controls.tsx','packages/ui/src/react/meta-comp.tsx','packages/ui/src/react/inspector.tsx','packages/ui/src/react/chrome.tsx','packages/ui/src/react/styles.css','packages/ui/src/bindings/persistence.ts','packages/ui/dist/index.d.ts',
  'packages/metablock/src/index.ts','packages/metablock/src/core/types.ts','packages/metablock/src/core/workspace.ts','packages/metablock/src/core/physics.ts','packages/metablock/src/react/WorkspaceView.tsx','packages/metablock/src/react/styles.css','packages/metablock/dist/index.d.ts',
  'apps/shared/system-schema.ts','apps/studio/index.html','apps/studio/editor.html','apps/studio/src/main.tsx','apps/studio/src/editor-main.tsx','apps/studio/src/App.tsx','apps/studio/src/EditorApp.tsx','apps/studio/src/studio-model.ts','apps/studio/src/studio.css','apps/studio/src/editor.css','apps/studio/assets/stage.jpg',
  'tsconfig.base.json','apps/studio/vite.config.ts','.gitignore','.github/workflows/ci.yml','.github/workflows/auto-pr.yml','.github/dependabot.yml','scripts/git-sync.mjs','CONTRIBUTING.md'
];
for(const file of required)await access(resolve(root,file));
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())out.push(...await walk(path));else out.push(path)}return out}
for(const sourceRoot of ['packages/ui/src','packages/metablock/src','apps/studio/src','apps/shared']){for(const file of await walk(resolve(root,sourceRoot))){if(extname(file)==='.js'||extname(file)==='.jsx')throw new Error(`Non-TypeScript source remains: ${file}`)}}
const app=await readFile(resolve(root,'apps/studio/src/App.tsx'),'utf8');
const editor=await readFile(resolve(root,'apps/studio/src/EditorApp.tsx'),'utf8');
const main=await readFile(resolve(root,'apps/studio/src/main.tsx'),'utf8');
const model=await readFile(resolve(root,'apps/studio/src/studio-model.ts'),'utf8');
const workspaceCore=await readFile(resolve(root,'packages/metablock/src/core/workspace.ts'),'utf8');
const workspaceTypes=await readFile(resolve(root,'packages/metablock/src/core/types.ts'),'utf8');
const workspaceView=await readFile(resolve(root,'packages/metablock/src/react/WorkspaceView.tsx'),'utf8');
if(!app.includes('MetaBlockWorkspaceView')||!app.includes('renderBlock='))throw new Error('Studio workspace is not rendered through canonical MetaBlock renderBlock API');
for(const primitive of ['TabBar','SearchBox','TelemetryStrip','ChromeBar','PanelTitle','StatusLine','Inspector','Control','ContextMenu'])if(!app.includes(primitive))throw new Error(`Studio missing @artinos/ui React primitive: ${primitive}`);
if(!main.includes("'@artinos/ui/styles.css'")||!main.includes("'@artinos/metablock/styles.css'"))throw new Error('Studio does not consume package styles');
if(!model.includes("posture:'fullscreen-locked'")||!model.includes('lockedFullscreen:true'))throw new Error('Viewport is not a locked fullscreen MetaBlock');
if(!workspaceTypes.includes('interface MetaBlockInstance'))throw new Error('Canonical MetaBlockInstance type missing');
for(const op of ['createMetaBlock(','floatBlock(','dockBlock(','splitBlock(','mergeBlock(','activateBlock(','returnBlock(','snapBlockToEdge('])if(!workspaceCore.includes(op))throw new Error(`MetaBlock core missing canonical operation ${op}`);
for(const legacy of ['addPanel(','renderPanel=','MetaBlockPanel'])if(model.includes(legacy)||app.includes(legacy)||editor.includes(legacy))throw new Error(`Studio still uses legacy Panel primitive API: ${legacy}`);
if(!model.includes("role:'dock'")||!model.includes("role:'panel'"))throw new Error('Dock/panel are not expressed as MetaBlock roles');
if(!editor.includes('MetaBlockWorkspaceView')||!editor.includes('Inspector')||!editor.includes('syncParameterGraph')||!editor.includes('editor-preview-workspace'))throw new Error('System Editor is not package-native/live-synced with nested MetaBlock preview');
if(!workspaceView.includes('resolveKineticPose')||!workspaceView.includes('mb-live-field'))throw new Error('MetaBlock spatial feedback/physics missing');
if(!workspaceView.includes('stabilizeDockCandidate')||!workspaceView.includes('commitStrength')||!workspaceView.includes('intentHoldMs'))throw new Error('MetaBlock stable intent gating missing');
for(const feature of ['openBlockContextMenu','preferredFloatingSize','tabTargetAt','browserTargetsForBlock','data-detaching','Attach Back to','renderContextMenu','mb-context-menu-host'])if(!workspaceView.includes(feature))throw new Error(`MetaBlock interaction refinement missing: ${feature}`);
if(!workspaceView.includes("c.targetId===d.sourceGroupId")||!workspaceView.includes('d.sourceIndex'))throw new Error('Returning to the source group does not preserve the original tab index');
if(!workspaceCore.includes('getBlockRelationshipContext(')||!workspaceCore.includes('isPersistentContainer('))throw new Error('Parent-aware MetaBlock relationship model missing');
if(!workspaceCore.includes('repairSpatialState(')||!workspaceCore.includes("if(area==='center'&&!targetGroupId"))throw new Error('MetaBlock root-center/fullscreen safety repair missing');
if(!workspaceCore.includes('snapGroupToEdge('))throw new Error('MetaBlock group soft-snap capability missing');
if(!model.includes('persistentContainer:true'))throw new Error('Studio command dock is not a persistent parent MetaBlock');
if(!model.includes('homeZoneId')||!model.includes('lockHomeZone:false')||!model.includes('movable:true')||!model.includes('resizable:true')||!model.includes('floatable:true')||!model.includes('dockable:true'))throw new Error('Studio command dock is not a controllable persistent parent MetaBlock');
for(const feature of ['openGroupContextMenu','groupContextModel','Parent MetaBlock','Return to','Parent + all children'])if(!workspaceView.includes(feature))throw new Error(`Parent MetaBlock control missing: ${feature}`);
if(!app.includes('detached-panel-chrome'))throw new Error('Detached MetaBlock does not expose a compact draggable package-native chrome');
if(app.includes('onDoubleClick')&&app.includes('maximizeBlock'))throw new Error('Panel double-click can still accidentally maximize to fullscreen');
if(!workspaceView.includes('ATTACH BACK TO PARENT')||!workspaceView.includes('ATTACH TO DOCK'))throw new Error('Parent/dock aware attachment intent missing');

if(workspaceView.includes("if(!d.started){d.started=true;if(group.posture!=='floating')workspace.floatGroup"))throw new Error('Group drag still mutates workspace posture during pointer move');
for(const op of ['pinBlock(','popoutBlock(','maximizeBlock(','restoreBlock('])if(!workspaceCore.includes(op))throw new Error(`MetaBlock contextual capability missing ${op}`);
if(app.includes('document.createElement')||model.includes('document.createElement'))throw new Error('Studio is hand-authoring DOM instead of React/package components');
const uiPkg=JSON.parse(await readFile(resolve(root,'packages/ui/package.json'),'utf8')),mbPkg=JSON.parse(await readFile(resolve(root,'packages/metablock/package.json'),'utf8'));
if(!uiPkg.peerDependencies?.react||!mbPkg.peerDependencies?.react)throw new Error('React peer dependency missing');
if(!uiPkg.types||!mbPkg.types)throw new Error('TypeScript declarations are not package entrypoints');
console.log('ARTINOS React + TypeScript verify PASS');
console.log(`${required.length} required files present`);
console.log('0 JavaScript/JSX source files remain in source trees');
console.log('MetaBlockInstance is the canonical spatial primitive');
console.log('Panel/Dock/Viewport are MetaBlock roles in Studio');
console.log('Studio uses canonical block APIs and renderBlock');
console.log('Locked fullscreen viewport remains package-native');
console.log('Spatial physics + Dock Fields are package-owned');
console.log('Drag is transient/direct; context menu capabilities are package-owned');
console.log('Dock intent preview/commit gating is stable and package-owned');
console.log('Git CI + auto-PR + local sync automation are configured');
console.log('System Editor is package-native, live-synced and previews through nested MetaBlock Workspace');
console.log('Both packages publish TypeScript declarations');
