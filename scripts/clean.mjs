import { rm } from 'node:fs/promises';
for (const path of ['packages/ui/dist','packages/metablock/dist','apps/studio/dist','.artinos-test','.cache']) await rm(new URL(`../${path}`, import.meta.url), { recursive: true, force: true });
console.log('ARTINOS clean PASS');
