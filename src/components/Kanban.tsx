import React, { useEffect } from 'react';
import { Task } from '../types';
import { useLogger } from '../lib/logger';

interface KanbanProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

export function Kanban({ tasks, onTaskUpdate }: KanbanProps) {
  const logger = useLogger('Kanban');

  useEffect(() => {
    logger.debug('Kanban mounted', { taskCount: tasks.length });
    return () => logger.debug('Kanban unmounted');
  }, []);

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    logger.info('Drag started', { taskId });
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      if (task.status !== status) {
        logger.info('Task dropped - updating status', { taskId, from: task.status, to: status });
        onTaskUpdate({ ...task, status });
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

  return (
    <div className="flex h-full gap-6 overflow-x-auto p-6">
      {columns.map(column => (
        <div
          key={column.id}
          className="flex flex-col w-80 bg-gray-100 rounded-xl flex-shrink-0"
          onDrop={(e) => handleDrop(e, column.id)}
          onDragOver={handleDragOver}
        >
          <div className="p-4 font-semibold text-gray-700 border-b border-gray-200">
            {column.title}
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 py-1 px-2 rounded-full">
              {tasks.filter(t => t.status === column.id).length}
            </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {tasks
              .filter(t => t.status === column.id)
              .map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  <div className="font-medium text-gray-900">{task.name}</div>
                  <div className="text-xs text-gray-500 mt-2 font-mono">ID: {task.id}</div>
                  {task.start && task.end && (
                    <div className="text-xs text-gray-500 mt-1">
                      {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
