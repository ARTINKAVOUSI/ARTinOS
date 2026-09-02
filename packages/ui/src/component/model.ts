export interface ComponentDefinition { id:string; family?:string; anatomy?:string[]; states?:string[]; interactions?:string[]; accessibility?:Record<string,unknown>; tokens?:string[]; presentations?:string[]; semantics?:Record<string,unknown>; serialization?:Record<string,unknown>; metadata?:Record<string,unknown> }
export class ComponentRegistry {
  private definitions=new Map<string,Readonly<ComponentDefinition>>();
  register(definition:ComponentDefinition){if(!definition?.id)throw new Error('Component definition requires id');const normalized=Object.freeze({id:definition.id,family:definition.family??'primitive',anatomy:definition.anatomy??['Root'],states:definition.states??['idle','hover','focus','active','disabled'],interactions:definition.interactions??[],accessibility:definition.accessibility??{},tokens:definition.tokens??[],presentations:definition.presentations??['default'],semantics:definition.semantics??{},serialization:definition.serialization??{version:1},metadata:definition.metadata??{}});this.definitions.set(normalized.id,normalized);return normalized}
  get(id:string){return this.definitions.get(id)} has(id:string){return this.definitions.has(id)} list({family}:{family?:string}={}){return[...this.definitions.values()].filter(d=>!family||d.family===family)} serialize(){return this.list()}
}
export const componentRegistry=new ComponentRegistry();
const defs:ComponentDefinition[]=[
{id:'button',family:'primitive',anatomy:['Root','Label','Icon'],interactions:['press','keyboard'],accessibility:{role:'button'}},
{id:'icon-button',family:'primitive',anatomy:['Root','Icon'],interactions:['press','keyboard'],accessibility:{role:'button'}},
{id:'search',family:'primitive',anatomy:['Root','Icon','Input','Clear'],interactions:['type','keyboard'],accessibility:{role:'search'}},
{id:'tabs',family:'primitive',anatomy:['Root','List','Tab','Indicator','Panel'],interactions:['press','keyboard','roving-focus','reorder'],accessibility:{roles:['tablist','tab','tabpanel']}},
{id:'slider',family:'instrument',anatomy:['Root','Label','ActiveMaterial','InactiveMaterial','Seam','Value','TickField','HitField'],interactions:['full-surface-drag','keyboard','wheel','off-axis-precision','velocity-precision','reset'],presentations:['full','compact','micro','hero']},
{id:'range',family:'instrument',anatomy:['Root','Label','SelectedMaterial','MinSeam','MaxSeam','SpanField','Value'],interactions:['seam-drag','range-drag','keyboard','precision'],presentations:['full','compact','hero']},
{id:'scrubber',family:'instrument',anatomy:['Root','Label','Value','HitField'],interactions:['relative-drag','keyboard','velocity','off-axis-precision','reset'],presentations:['full','compact','micro']},
{id:'toggle',family:'instrument',anatomy:['Root','Label','SharedSurface','StateMaterial','StateLabel'],interactions:['press','keyboard'],presentations:['full','compact','utility']},
{id:'segmented',family:'instrument',anatomy:['Root','Label','SharedSurface','Segment','MovingMaterial'],interactions:['press','keyboard'],presentations:['full','compact','utility']},
{id:'select',family:'instrument',anatomy:['Root','Label','SelectionSurface','Popup','Option'],interactions:['press','keyboard','escape','outside-press'],presentations:['full','compact','micro']},
{id:'color',family:'instrument',anatomy:['Root','Label','ColorSurface','Value'],interactions:['press','drag'],presentations:['visual','full','compact']},
{id:'gradient',family:'instrument',anatomy:['Root','Label','GradientSurface','Stop'],interactions:['press','drag'],presentations:['visual','full','hero']},
{id:'vector',family:'instrument',anatomy:['Root','Label','AxisSurface','AxisValue'],interactions:['type','scrub','keyboard'],presentations:['paired','full','compact']},
{id:'xy',family:'instrument',anatomy:['Root','Label','Field','Handle','Value'],interactions:['2d-drag','keyboard','precision'],presentations:['visual','hero','focus']},
{id:'meter',family:'instrument',anatomy:['Root','Label','SignalField','Value'],interactions:['monitor'],presentations:['visual','compact','micro']},
{id:'context-menu',family:'primitive',anatomy:['Root','Header','Section','Item','Shortcut'],interactions:['context-open','keyboard-navigation','select','escape'],accessibility:{role:'menu'}},
{id:'inspector',family:'composite',anatomy:['Root','Header','Search','Section','MetaComp'],interactions:['focus-navigation','search','collapse','adaptive-density']}
];for(const d of defs)componentRegistry.register(d);
