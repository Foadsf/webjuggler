import React, { useState, useEffect } from 'react';
import { Kanban } from './components/Kanban';
import { Gantt } from './components/Gantt';
import { PERT } from './components/PERT';
import { parseTjp } from './lib/tjpParser';
import { exportTjp } from './lib/tjpExporter';
import { LayoutDashboard, CalendarDays, Network, Upload, FolderOpen, Download, RotateCcw, RotateCw } from 'lucide-react';
import { useLogger } from './lib/logger';
import { DebugConsole } from './components/DebugConsole';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { useTaskOperations } from './hooks/useTaskOperations';
import { PERTErrorBoundary } from './components/PERTErrorBoundary';

type ViewMode = 'kanban' | 'gantt' | 'pert';

function MainLayout() {
  const [view, setView] = useState<ViewMode>('kanban');
  const logger = useLogger('App');
  const { tasks } = useTaskContext();
  const { loadTasks, undo, redo, canUndo, canRedo } = useTaskOperations();

  useEffect(() => {
    logger.info('Application mounted', { 
      version: '1.0.0', 
      debugMode: import.meta.env.VITE_DEBUG_MODE,
      ua: navigator.userAgent 
    });
    return () => logger.info('Application unmounting');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } 
      // Redo: Ctrl+Y
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    logger.info('File upload initiated', { fileName: file.name, fileSize: file.size });
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedTasks = parseTjp(content);
        loadTasks(parsedTasks);
        logger.info('File parsed successfully', { taskCount: parsedTasks.length });
      } catch (err) {
        logger.error('File parsing failed', { error: err });
      }
    };
    reader.onerror = (err) => logger.error('File reader error', { error: err });
    reader.readAsText(file);
  };

  const handleExport = () => {
    const content = exportTjp(tasks);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${new Date().toISOString().split('T')[0]}.tjp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logger.info('Project exported to .tjp');
  };

  const handleViewChange = (newView: ViewMode) => {
    logger.info('View changed', { from: view, to: newView });
    setView(newView);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
            <FolderOpen className="w-6 h-6" />
            WebJuggler
          </h1>
          <p className="text-xs text-gray-500 mt-1">Project Management</p>
        </div>

        <div className="p-4 flex-1 space-y-2">
          <button
            onClick={() => handleViewChange('kanban')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'kanban' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Kanban
          </button>
          <button
            onClick={() => handleViewChange('gantt')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'gantt' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            Gantt
          </button>
          <button
            onClick={() => handleViewChange('pert')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'pert' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Network className="w-5 h-5" />
            PERT
          </button>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex gap-2 justify-between">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" /> Redo
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            Open .tjp
            <input
              type="file"
              accept=".tjp"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          
          <button
            onClick={handleExport}
            disabled={tasks.length === 0}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 border border-transparent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export .tjp
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm z-10">
          <h2 className="text-lg font-semibold capitalize">{view} View</h2>
          <div className="ml-auto text-sm text-gray-500">
            {tasks.length} tasks loaded
          </div>
        </header>
        
        <main className="flex-1 overflow-hidden relative">
          {tasks.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <FolderOpen className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">No project loaded</p>
              <p className="text-sm mt-1">Upload a .tjp file to get started</p>
            </div>
          ) : (
            <>
              {view === 'kanban' && (
                <ErrorBoundary>
                  <Kanban />
                </ErrorBoundary>
              )}
              {view === 'gantt' && (
                <ErrorBoundary>
                  <Gantt />
                </ErrorBoundary>
              )}
              {view === 'pert' && (
                <PERTErrorBoundary>
                  <PERT />
                </PERTErrorBoundary>
              )}
            </>
          )}
        </main>
      </div>
      <DebugConsole />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <MainLayout />
      </TaskProvider>
    </ErrorBoundary>
  );
}
