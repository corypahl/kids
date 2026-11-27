import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './village.css';
import './creator-games.css';
import './device-settings.css';
import './immersive.css';
import './studio.css';
import './naughty-nice.css';
import './cabin.css';
import './reindeer-arcade.css';
import './fidget-maker.css';
import './holiday-expansion.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
