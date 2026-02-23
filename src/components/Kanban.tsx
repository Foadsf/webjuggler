import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { useLogger } from '../lib/logger';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { InlineEdit } from './InlineEdit';
import { TaskModal } from './TaskModal';
import { Plus } from 'lucide-react';

export const normalizeStatus = (status: any): Task['status'] => {
  if (!status) return 'todo';
  const s = String(status).toLowerCase().trim();
  if (s === 'todo' || s === 'to-do' || s === 'to do') return 'todo';
  if (s === 'in-progress' || s === 'inprogress' || s === 'in progress') return 'in-progress';
  if (s === 'done' || s === 'completed' || s === 'finished') return 'done';
  return 'todo';
};

export function Kanban() {
  const logger = useLogger('Kanban');
  const { tasks, updateTask, addTask, deleteTask } = useTaskOperations();
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialStatusForNewTask, setInitialStatusForNewTask] = useState<Task['status']>('todo');

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  useEffect(() => {
    logger.debug('Kanban mounted', { taskCount: tasks.length });
    if (tasks.length > 0) {
      const statuses = Array.from(new Set(tasks.map(t => t.status)));
      logger.debug('Task statuses present in data', { statuses });
      
      columns.forEach(col => {
        const matching = tasks.filter(t => normalizeStatus(t.status) === col.id);
        logger.debug(`Column ${col.id} has ${matching.length} matches`);
      });
    }
    return () => logger.debug('Kanban unmounted');
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    logger.info('Drag started', { taskId });
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      if (normalizeStatus(task.status) !== status) {
        logger.info('Task dropped - updating status', { taskId, from: task.status, to: status });
        updateTask({ ...task, status });
      } else {
        logger.debug('Task dropped - no status change', { taskId, status });
      }
    } else {
      logger.warn('Drop failed - task not found', { taskId });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const openNewTaskModal = (status: Task['status']) => {
    setInitialStatusForNewTask(status);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      updateTask(task);
    } else {
      addTask(task);
    }
  };

  return (
    <>
      <div className="flex h-full gap-6 overflow-x-auto p-6">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex flex-col w-80 bg-gray-100 rounded-xl flex-shrink-0"
            onDrop={(e) => handleDrop(e, column.id)}
            onDragOver={handleDragOver}
          >
            <div className="p-4 font-semibold text-gray-700 border-b border-gray-200 flex justify-between items-center">
              <span>{column.title}</span>
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 py-1 px-2 rounded-full">
                {tasks.filter(t => normalizeStatus(t.status) === column.id).length}
              </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {tasks
                .filter(t => normalizeStatus(t.status) === column.id)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                  >
                    <div className="font-medium text-gray-900 pr-6">
                      <InlineEdit
                        text={task.name}
                        onSave={(newName) => updateTask({ ...task, name: newName })}
                        className="font-medium"
                      />
                    </div>
                    <button
                      onClick={() => openEditTaskModal(task)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    
                    <div className="text-xs text-gray-500 mt-2 font-mono">ID: {task.id}</div>
                    {task.start && task.end && (
                      <div className="text-xs text-gray-500 mt-1">
                        {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <button
              onClick={() => openNewTaskModal(column.id)}
              className="m-4 mt-0 p-2 flex items-center justify-center gap-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-indigo-300"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={editingTask ? deleteTask : undefined}
        task={editingTask}
        initialStatus={initialStatusForNewTask}
      />
    </>
  );
}
