import type { ParameterGraph } from '../core/parameter.js';
import type { ParameterGraphSnapshot } from '../core/types.js';

export interface ParameterGraphSyncOptions {
  storageKey:string;
  channelName?:string;
  debounceMs?:number;
  autoLoad?:boolean;
  include?:(parameterId:string)=>boolean;
}

/** Browser persistence + cross-tab/page synchronization for a ParameterGraph. */
export function syncParameterGraph(graph:ParameterGraph,{storageKey,channelName=`${storageKey}:channel`,debounceMs=40,autoLoad=true,include=()=>true}:ParameterGraphSyncOptions){
  let timer:any=null,disposed=false,applying=false;
  const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel(channelName):null;
  const subset=():ParameterGraphSnapshot=>{const snapshot=graph.serialize();return{...snapshot,parameters:snapshot.parameters.filter(entry=>include(entry.id))}};
  const read=():ParameterGraphSnapshot|null=>{if(typeof localStorage==='undefined')return null;try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch{return null}};
  const apply=(snapshot:ParameterGraphSnapshot|null|undefined)=>{if(!snapshot||disposed)return;applying=true;try{graph.restore({...snapshot,parameters:(snapshot.parameters??[]).filter(entry=>include(entry.id))},{history:false})}finally{applying=false}};
  const write=()=>{if(disposed||applying||typeof localStorage==='undefined')return;const snapshot=subset();try{localStorage.setItem(storageKey,JSON.stringify(snapshot))}catch{}channel?.postMessage(snapshot)};
  const schedule=(event:any)=>{const id=event?.parameter?.id;if(id&&!include(id))return;if(disposed||applying)return;clearTimeout(timer);timer=setTimeout(write,debounceMs)};
  if(autoLoad)apply(read());
  const off=graph.events.on('parameter:change',schedule);
  const onStorage=(event:StorageEvent)=>{if(event.key!==storageKey||!event.newValue)return;try{apply(JSON.parse(event.newValue))}catch{}};
  const onMessage=(event:MessageEvent)=>apply(event.data as ParameterGraphSnapshot);
  if(typeof addEventListener==='function')addEventListener('storage',onStorage);
  channel?.addEventListener('message',onMessage);
  return{
    load(){apply(read())},
    save(){write()},
    reset(){if(typeof localStorage!=='undefined')localStorage.removeItem(storageKey)},
    snapshot:subset,
    dispose(){disposed=true;clearTimeout(timer);off();if(typeof removeEventListener==='function')removeEventListener('storage',onStorage);channel?.removeEventListener('message',onMessage);channel?.close()}
  };
}
