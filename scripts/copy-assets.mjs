import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const copies=[
  ['packages/ui/src/react/styles.css','packages/ui/dist/styles.css'],
  ['packages/metablock/src/react/styles.css','packages/metablock/dist/styles.css']
];
for(const[from,to]of copies){await mkdir(resolve(root,to,'..'),{recursive:true});await copyFile(resolve(root,from),resolve(root,to));}
console.log('ARTINOS package CSS copied');
