// IMPORTANT : React doit être importé en premier
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-200 flex items-center justify-center p-4">
          <div className="bg-stone-100 rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                Une erreur est survenue
              </h1>
              <p className="text-stone-600 mb-6">
                L'application a rencontré un problème. Veuillez rafraîchir la page.
              </p>
              {this.state.error && (
                <details className="text-left bg-stone-200 p-4 rounded mb-4">
                  <summary className="cursor-pointer text-sm font-semibold text-stone-700 mb-2">
                    Détails de l'erreur
                  </summary>
                  <pre className="text-xs text-stone-600 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Rafraîchir la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
