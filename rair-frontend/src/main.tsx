import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Only Bootstrap's Reboot (base element normalisation). No components, grid or utilities are used.
import 'bootstrap/dist/css/bootstrap-reboot.min.css';
import './styles/tokens.css';
import { warmUpApi } from './api/warmUp';

warmUpApi();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
