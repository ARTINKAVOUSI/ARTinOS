import type { Parameter } from '../core/parameter.js';
export function bindParameter<T extends object, K extends keyof T>(parameter:Parameter<any>,target:T,key:K){
  (target as any)[key]=parameter.value;const off=parameter.subscribe(value=>{(target as any)[key]=value});return off;
}
export function bindParameterAccessor<T>(parameter:Parameter<T>,read:()=>T,write:(value:T)=>void){parameter.set(read(),{source:'system',history:false,force:true});return parameter.subscribe(value=>write(value));}
