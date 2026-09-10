import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FavoritesProvider } from './state/FavoritesContext';
import { CompareProvider } from './state/CompareContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FavoritesProvider>
      <CompareProvider>
        <App />
      </CompareProvider>
    </FavoritesProvider>
  </React.StrictMode>,
);
