import { useMemo, useState } from 'react';
import type { ParameterGraph } from '../core/parameter.js';
import type { MetaCompContext } from '../core/types.js';
import { defineControls, type ControlSchema, type SchemaEntry, type SchemaSectionEntry, type SchemaControlEntry } from '../schema/schema.js';
import { Control } from './controls.js';

export interface InspectorProps {
  graph: ParameterGraph;
  schema?: ControlSchema;
  entries?: SchemaEntry[];
  title?: string;
  searchable?: boolean;
  context?: MetaCompContext;
  className?: string;
}

function ControlEntry({entry,context}:{entry:SchemaControlEntry;context:MetaCompContext}){if(entry.hidden)return null;const parameter=entry.parameter as any;if(!parameter)return null;return <div className="au-control-host"><Control parameter={parameter} context={context}/></div>}
function Section({entry,query,context}:{entry:SchemaSectionEntry;query:string;context:MetaCompContext}){const[collapsed,setCollapsed]=useState(entry.collapsed);const visible=entry.controls.filter(child=>child.kind==='section'||!query||String(child.label??'').toLowerCase().includes(query));if(query&&!visible.length)return null;return <section className="au-section" data-collapsed={String(collapsed)}><button className="au-section-title" type="button" onClick={()=>setCollapsed(v=>!v)}><span>{entry.label}</span><i>▾</i></button><div className="au-section-content">{visible.map(child=>child.kind==='section'?<Section key={child.id} entry={child} query={query} context={context}/>:<ControlEntry key={child.id} entry={child} context={context}/>)}</div></section>}

export function Inspector({graph,schema,entries,title,searchable=false,context={},className=''}:InspectorProps){const normalized=useMemo(()=>entries??(schema?defineControls(graph,schema):[]),[entries,schema,graph]);const[query,setQuery]=useState('');const q=query.trim().toLowerCase();return <div className={`au-inspector au-inspector-react ${className}`.trim()} data-density={context.density??'compact'}>{title?<div className="au-inspector-header">{title}</div>:null}{searchable?<label className="au-inspector-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.currentTarget.value)} placeholder="Search controls"/></label>:null}<div className="au-inspector-body">{normalized.map(entry=>entry.kind==='section'?<Section key={entry.id} entry={entry} query={q} context={context}/>:(!q||String(entry.label??'').toLowerCase().includes(q))?<ControlEntry key={entry.id} entry={entry} context={context}/>:null)}</div></div>}
