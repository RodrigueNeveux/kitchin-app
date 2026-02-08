// CRITIQUE : React DOIT être importé en premier pour garantir sa disponibilité
// L'ordre des imports est important pour le bundling
import * as React from 'react';
import { createRoot } from 'react-dom/client';

// Importez l'application complète
import App from './App'; 

// Importez le Toaster (composant de notification)
import { Toaster } from './components/ui/sonner'; 

// Importez ErrorBoundary pour capturer les erreurs
import { ErrorBoundary } from './ErrorBoundary';

// Importez le CSS
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Rendu de l'application avec ErrorBoundary pour capturer les erreurs
try {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
        <Toaster position="top-center" />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: system-ui;">
      <div style="text-align: center; max-width: 500px;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">⚠️ Erreur au chargement</h1>
        <p style="margin-bottom: 24px; color: #666;">Une erreur est survenue lors du chargement de l'application.</p>
        <button onclick="window.location.reload()" style="background: #16a34a; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">
          Rafraîchir la page
        </button>
        <details style="margin-top: 24px; text-align: left;">
          <summary style="cursor: pointer; margin-bottom: 8px;">Détails techniques</summary>
          <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow: auto; font-size: 12px;">${error}</pre>
        </details>
      </div>
    </div>
  `;
}
