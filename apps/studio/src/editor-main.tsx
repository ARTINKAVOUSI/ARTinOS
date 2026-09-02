import { createRoot } from 'react-dom/client';
import '@artinos/ui/styles.css';
import '@artinos/metablock/styles.css';
import './editor.css';
import EditorApp from './EditorApp.js';
const root=document.getElementById('root');if(!root)throw new Error('ARTINOS System Editor root missing');createRoot(root).render(<EditorApp/>);
