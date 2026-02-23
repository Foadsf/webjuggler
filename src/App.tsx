import React, { useState, useEffect } from 'react';
import { Kanban } from './components/Kanban';
import { Gantt } from './components/Gantt';
import { PERT } from './components/PERT';
import { Task } from './types';
import { parseTjp } from './lib/tjpParser';
import { LayoutDashboard, CalendarDays, Network, Upload, FolderOpen } from 'lucide-react';
import { useLogger } from './lib/logger';
import { DebugConsole } from './components/DebugConsole';
import { ErrorBoundary } from './components/ErrorBoundary';

type ViewMode = 'kanban' | 'gantt' | 'pert';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewMode>('kanban');
  const logger = useLogger('App');

  useEffect(() => {
    logger.info('Application mounted', { 
      version: '1.0.0', 
      debugMode: import.meta.env.VITE_DEBUG_MODE,
      ua: navigator.userAgent 
    });
    return () => logger.info('Application unmounting');
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    logger.info('File upload initiated', { fileName: file.name, fileSize: file.size });
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedTasks = parseTjp(content);
        setTasks(parsedTasks);
        logger.info('File parsed successfully', { taskCount: parsedTasks.length });
      } catch (err) {
        logger.error('File parsing failed', { error: err });
      }
    };
    reader.onerror = (err) => logger.error('File reader error', { error: err });
    reader.readAsText(file);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    logger.debug('Task updated', { taskId: updatedTask.id, newStatus: updatedTask.status });
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleViewChange = (newView: ViewMode) => {
    logger.info('View changed', { from: view, to: newView });
    setView(newView);
  };

  return (
    <ErrorBoundary>
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

          <div className="p-4 border-t border-gray-200">
            <label className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              Open .tjp File
              <input
                type="file"
                accept=".tjp"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
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
                {view === 'kanban' && <Kanban tasks={tasks} onTaskUpdate={handleTaskUpdate} />}
                {view === 'gantt' && <Gantt tasks={tasks} onTaskUpdate={handleTaskUpdate} />}
                {view === 'pert' && <PERT tasks={tasks} />}
              </>
            )}
          </main>
        </div>
      </div>
      <DebugConsole />
    </ErrorBoundary>
  );
}
