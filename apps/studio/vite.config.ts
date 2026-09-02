import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
const r=(path:string)=>fileURLToPath(new URL(path,import.meta.url));
export default defineConfig({
  root:r('.'),
  plugins:[react()],
  resolve:{alias:[
    {find:'@artinos/ui/styles.css',replacement:r('../../packages/ui/src/react/styles.css')},
    {find:'@artinos/metablock/styles.css',replacement:r('../../packages/metablock/src/react/styles.css')},
    {find:'@artinos/ui',replacement:r('../../packages/ui/src/index.ts')},
    {find:'@artinos/metablock',replacement:r('../../packages/metablock/src/index.ts')}
  ]},
  build:{outDir:'dist',emptyOutDir:true,sourcemap:true,rollupOptions:{input:{studio:r('./index.html'),editor:r('./editor.html')}}}
});
