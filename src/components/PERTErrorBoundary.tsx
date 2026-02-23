import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function PERTFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="p-6 text-center bg-red-50 border border-red-100 rounded-xl m-6">
      <h3 className="text-lg font-semibold text-red-600 mb-2">
        PERT Diagram Error
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
      >
        Retry Loading Diagram
      </button>
    </div>
  );
}

export function PERTErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={PERTFallback}
      onReset={() => {
        // Reset state or reload as needed
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
