import { createRoot } from 'react-dom/client';
import '@artinos/ui/styles.css';
import '@artinos/metablock/styles.css';
import './studio.css';
import App from './App.js';
const root=document.getElementById('root');if(!root)throw new Error('ARTINOS Studio root missing');createRoot(root).render(<App/>);
