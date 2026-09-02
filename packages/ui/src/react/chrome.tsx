import { useEffect, useRef, type ReactNode } from 'react';
export function BrandMark({label='ARTINOS',symbol='#',onClick}:{label?:string;symbol?:string;onClick?:()=>void}){return <button type="button" className="au-brand-mark" onClick={onClick}><i>{symbol}</i><span>{label}</span></button>}
export interface TabItem { id:string; label:string; count?:number|string; disabled?:boolean }
export function TabBar({items,activeId,onChange,className='',getTabProps}:{items:TabItem[];activeId:string|null;onChange?:(id:string)=>void;className?:string;getTabProps?:(item:TabItem)=>Record<string,any>}){return <div className={`au-tab-bar ${className}`.trim()} role="tablist">{items.map(item=><button key={item.id} type="button" className="au-tab" role="tab" aria-selected={item.id===activeId} disabled={item.disabled} {...(getTabProps?.(item)??{})} onClick={(e:any)=>{getTabProps?.(item)?.onClick?.(e);onChange?.(item.id)}}>{item.label}{item.count!=null?<span className="au-tab-count">{item.count}</span>:null}</button>)}</div>}
export function SearchBox({value,onChange,placeholder='Search',shortcut,refInput}:{value:string;onChange:(value:string)=>void;placeholder?:string;shortcut?:string;refInput?:(node:HTMLInputElement|null)=>void}){return <label className="au-search-box"><span>⌕</span><input ref={refInput} value={value} onChange={e=>onChange(e.currentTarget.value)} placeholder={placeholder}/>{shortcut?<kbd>{shortcut}</kbd>:null}</label>}
export function TelemetryStrip({items}:{items:Array<{label:string;value?:string|number;live?:boolean}>}){return <div className="au-telemetry">{items.map((item,i)=><span key={`${item.label}-${i}`} className={item.live?'live':''}>{item.value!=null?<><b>{item.label}</b> <strong>{item.value}</strong></>:item.label}</span>)}</div>}
export function ChromeBar({children,className='',...rest}:{children:ReactNode;className?:string;[key:string]:any}){return <div className={`au-chrome-bar ${className}`.trim()} {...rest}>{children}</div>}
export function ChromeFill(){return <span className="au-chrome-fill"/>}
export function PanelTitle({children}:{children:ReactNode}){return <div className="au-panel-title">{children}</div>}
export function StatusLine({children,className=''}:{children:ReactNode;className?:string}){return <div className={`au-status-line ${className}`.trim()}>{children}</div>}
export function ActionIcon({label,children,onClick}:{label:string;children:ReactNode;onClick?:()=>void}){return <button type="button" className="au-action-icon" aria-label={label} title={label} onClick={onClick}>{children}</button>}


export interface ContextMenuItem {
  id:string;
  label:string;
  detail?:string;
  shortcut?:string;
  disabled?:boolean;
  primary?:boolean;
  danger?:boolean;
  checked?:boolean;
  onSelect?:()=>void;
}
export interface ContextMenuSection { id:string; label?:string; layout?:'list'|'grid'; items:ContextMenuItem[] }
export function ContextMenu({title,subtitle,meta,sections,onClose,className=''}:{title:string;subtitle?:string;meta?:string;sections:ContextMenuSection[];onClose?:()=>void;className?:string}){
  const root=useRef<HTMLDivElement|null>(null);
  useEffect(()=>{root.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()},[]);
  const move=(direction:number)=>{const buttons=[...(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[])];if(!buttons.length)return;const active=document.activeElement as HTMLButtonElement|null,index=Math.max(0,buttons.indexOf(active as HTMLButtonElement)),next=(index+direction+buttons.length)%buttons.length;buttons[next]?.focus()};
  return <div ref={root} className={`au-context-menu ${className}`.trim()} role="menu" aria-label={`${title} actions`} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();onClose?.()}else if(event.key==='ArrowDown'){event.preventDefault();move(1)}else if(event.key==='ArrowUp'){event.preventDefault();move(-1)}else if(event.key==='Home'){event.preventDefault();root.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()}else if(event.key==='End'){event.preventDefault();const buttons=root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');buttons?.[buttons.length-1]?.focus()}}}>
    <header className="au-context-menu-head"><div><strong>{title}</strong>{subtitle?<span>{subtitle}</span>:null}</div>{meta?<small>{meta}</small>:null}</header>
    {sections.filter(section=>section.items.some(item=>!item.disabled||item.label)).map((section,index)=><section key={section.id} className="au-context-menu-section" data-section={section.id}>{index>0?<i className="au-context-menu-rule"/>:null}{section.label?<h4>{section.label}</h4>:null}<div className="au-context-menu-items" data-layout={section.layout??'list'}>{section.items.map(item=><button key={item.id} type="button" role="menuitem" disabled={item.disabled} data-primary={item.primary?'true':undefined} data-danger={item.danger?'true':undefined} data-checked={item.checked?'true':undefined} onClick={()=>{if(item.disabled)return;item.onSelect?.();onClose?.()}}><span className="au-context-item-mark">{item.checked?'✓':''}</span><span className="au-context-item-label">{item.label}{item.detail?<small>{item.detail}</small>:null}</span>{item.shortcut?<kbd>{item.shortcut}</kbd>:null}</button>)}</div></section>)}
  </div>
}
