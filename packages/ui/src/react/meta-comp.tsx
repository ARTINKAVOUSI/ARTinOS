import { useMemo, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent } from 'react';
import type { Parameter } from '../core/parameter.js';
import type { MetaCompContext } from '../core/types.js';
import { resolveMetaCompContext } from '../layout/adaptive.js';

const clamp = (v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));

export interface MetaCompFrameProps {
  parameter: Parameter;
  context?: MetaCompContext;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  role?: string;
  tabIndex?: number;
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLDivElement>) => void;
  onDoubleClick?: (event:any)=>void;
  onWheel?: (event:any)=>void;
  onKeyDown?: (event:any)=>void;
}

export function MetaCompFrame({parameter,context={},className='',children,style={},onPointerDown,onPointerMove,onPointerUp,onPointerCancel,...events}:MetaCompFrameProps){
  const resolved=useMemo(()=>resolveMetaCompContext(parameter,context),[parameter,context.width,context.height,context.modality,context.presentation,context.density,context.labelMode,context.emphasis]);
  const [proximity,setProximity]=useState(false),[contact,setContact]=useState(false);
  const rootRef=useRef<HTMLDivElement|null>(null),motionRef=useRef({x:0,y:0,t:0});
  const updatePointer=(event:PointerEvent<HTMLDivElement>)=>{
    if(parameter.disabled)return;
    const root=rootRef.current;if(!root)return;const rect=root.getBoundingClientRect(),nx=clamp((event.clientX-rect.left)/Math.max(1,rect.width),0,1),ny=clamp((event.clientY-rect.top)/Math.max(1,rect.height),0,1),now=performance.now(),dt=Math.max(1,now-motionRef.current.t||16),vx=(event.clientX-motionRef.current.x)/dt*1000,vy=(event.clientY-motionRef.current.y)/dt*1000;
    motionRef.current={x:event.clientX,y:event.clientY,t:now};root.style.setProperty('--au-proximity-x',`${nx*100}%`);root.style.setProperty('--au-proximity-y',`${ny*100}%`);root.style.setProperty('--au-pointer-vx',String(clamp(vx/1400,-1,1)));root.style.setProperty('--au-pointer-vy',String(clamp(vy/1400,-1,1)));root.style.setProperty('--au-pointer-energy',String(clamp(Math.hypot(vx,vy)/1600,0,1)));
  };
  const down=(event:PointerEvent<HTMLDivElement>)=>{updatePointer(event);if(!parameter.disabled&&!parameter.readonly)setContact(true);onPointerDown?.(event)};
  const move=(event:PointerEvent<HTMLDivElement>)=>{updatePointer(event);onPointerMove?.(event)};
  const release=(event:PointerEvent<HTMLDivElement>)=>{setContact(false);const root=rootRef.current;if(root){root.style.setProperty('--au-pointer-vx','0');root.style.setProperty('--au-pointer-vy','0');root.style.setProperty('--au-pointer-energy','0')}onPointerUp?.(event)};
  const cancel=(event:PointerEvent<HTMLDivElement>)=>{setContact(false);onPointerCancel?.(event)};
  return <div
    ref={rootRef}
    className={`au-metacomp ${className}`.trim()}
    title={parameter.description||undefined}
    data-parameter-id={parameter.id}
    data-presentation={resolved.presentation}
    data-density={resolved.density}
    data-emphasis={resolved.emphasis}
    data-label-mode={resolved.labelMode}
    data-disabled={String(Boolean(parameter.disabled))}
    data-readonly={String(Boolean(parameter.readonly))}
    data-proximity={proximity?'true':undefined}
    data-contact={contact?'true':undefined}
    style={{'--au-importance':String(resolved.importance??0),...style} as CSSProperties}
    onPointerEnter={event=>{if(!parameter.disabled&&document.documentElement.dataset.auProximity!=='off'){setProximity(true);updatePointer(event)}}}
    onPointerLeave={event=>{if(event.currentTarget.dataset.interacting!=='true'){setProximity(false);setContact(false)}event.currentTarget.style.setProperty('--au-pointer-energy','0')}}
    {...events}
    onPointerDown={down}
    onPointerMove={move}
    onPointerUp={release}
    onPointerCancel={cancel}
  >{children}</div>;
}

export function MetaCompLabel({parameter}:{parameter:Parameter}){
  return <span className="au-label">{parameter.label}{parameter.meta?.signal?<i className="au-signal-mark">{String(parameter.meta.signal)}</i>:null}</span>;
}

export function TickField({parameter}:{parameter:Parameter}){
  const ticks=parameter.meta?.ticks;if(!ticks)return null;const count=Array.isArray(ticks)?ticks.length:Number(ticks);if(!Number.isFinite(count)||count<2)return null;const n=Math.min(24,count);
  return <span className="au-ticks">{Array.from({length:n},(_,i)=><i key={i} style={{left:`${(i/(n-1))*100}%`}} />)}</span>;
}
