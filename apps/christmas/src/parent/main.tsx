import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ParentApp from './ParentApp';
import '../index.css';
import './parent.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><ParentApp /></StrictMode>,
);
