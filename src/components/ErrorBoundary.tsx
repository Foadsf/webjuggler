import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';
import { AlertCircle, RotateCcw, Copy } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log fatal error
    logger.fatal('ErrorBoundary', `Uncaught exception: ${error.message}`, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      recentLogs: logger.getBuffer().slice(-50)
    });
  }

  private handleCopyError = () => {
    const errorData = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      recentLogs: logger.getBuffer().slice(-50)
    };
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-8">
                WebJuggler encountered an unexpected error. We've logged the diagnostic information.
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-8 overflow-auto max-h-64 font-mono text-xs text-red-400">
                <p className="font-bold mb-2">Error: {this.state.error?.message}</p>
                <pre className="text-gray-400">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reload Application
                </button>
                <button
                  onClick={this.handleCopyError}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy Error Details
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
