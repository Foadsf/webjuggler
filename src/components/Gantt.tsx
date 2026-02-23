import React, { useMemo, useState, useEffect } from 'react';
import { Task } from '../types';
import { addDays, differenceInDays, format, min, max, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useLogger } from '../lib/logger';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { InlineEdit } from './InlineEdit';
import { TaskModal } from './TaskModal';
import { Plus } from 'lucide-react';

type DragType = 'move' | 'resize-start' | 'resize-end';

export function Gantt() {
  const { tasks, updateTask, addTask, deleteTask } = useTaskOperations();
  const [dragging, setDragging] = useState<{ id: string; type: DragType; startX: number; originalStart: Date; originalEnd: Date } | null>(null);
  const logger = useLogger('Gantt');
  
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    logger.debug('Gantt mounted', { taskCount: tasks.length });
    return () => logger.debug('Gantt unmounted');
  }, [tasks]);

  const { startDate, endDate, days } = useMemo(() => {
    const startTime = performance.now();
    if (tasks.length === 0) return { startDate: new Date(), endDate: new Date(), days: [] };

    const dates = tasks.flatMap(t => [t.start, t.end]).filter((d): d is Date => !!d);
    
    if (dates.length === 0) return { startDate: new Date(), endDate: new Date(), days: [] };

    const minDate = startOfWeek(min(dates));
    const maxDate = endOfWeek(max(dates));
    
    const result = {
      startDate: minDate,
      endDate: maxDate,
      days: eachDayOfInterval({ start: minDate, end: maxDate })
    };
    
    const endTime = performance.now();
    logger.debug('Gantt calculation complete', { 
      duration: `${(endTime - startTime).toFixed(2)}ms`, 
      dayCount: result.days.length,
      hasValidDates: dates.length > 0
    });
    
    return result;
  }, [tasks]);

  const hasAnyValidDates = useMemo(() => 
    tasks.some(t => t.start && !isNaN(t.start.getTime()) && t.end && !isNaN(t.end.getTime())),
    [tasks]
  );

  const openNewTaskModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      updateTask(task);
    } else {
      addTask(task);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="mb-4">No tasks loaded</p>
        <button
            onClick={openNewTaskModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create First Task
        </button>
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
        />
      </div>
    );
  }

  // Allow viewing empty gantt if tasks exist but no dates, but provide add button
  if (!hasAnyValidDates && tasks.length > 0) {
     // Fallthrough to render header with add button
  }

  const totalDays = days.length;
  const cellWidth = 40;

  const handleDragStart = (e: React.MouseEvent, task: Task, type: DragType) => {
    if (!task.start || !task.end) return;
    e.stopPropagation();
    logger.info(`Task drag started (${type})`, { taskId: task.id });
    setDragging({
      id: task.id,
      type,
      startX: e.clientX,
      originalStart: task.start,
      originalEnd: task.end,
    });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!dragging) return;
    
    const deltaX = e.clientX - dragging.startX;
    const deltaDays = Math.round(deltaX / cellWidth);
    
    if (deltaDays !== 0) {
      const task = tasks.find(t => t.id === dragging.id);
      if (task) {
        let newStart = dragging.originalStart;
        let newEnd = dragging.originalEnd;

        // Clone dates to avoid mutation issues
        newStart = new Date(newStart);
        newEnd = new Date(newEnd);

        if (dragging.type === 'move') {
          newStart = addDays(dragging.originalStart, deltaDays);
          newEnd = addDays(dragging.originalEnd, deltaDays);
        } else if (dragging.type === 'resize-start') {
          newStart = addDays(dragging.originalStart, deltaDays);
          if (newStart > newEnd) newStart = newEnd;
        } else if (dragging.type === 'resize-end') {
          newEnd = addDays(dragging.originalEnd, deltaDays);
          if (newEnd < newStart) newEnd = newStart;
        }

        const newDuration = differenceInDays(newEnd, newStart) + 1;

        logger.debug('Task dragging update', { taskId: task.id, type: dragging.type, deltaDays });

        updateTask({
          ...task,
          start: newStart,
          end: newEnd,
          duration: newDuration > 0 ? newDuration : 1
        });
      }
    }
  };

  const handleDragEnd = () => {
    if (dragging) {
      logger.info('Task drag ended', { taskId: dragging.id });
      setDragging(null);
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-white"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">Gantt Chart</h3>
        <button
          onClick={openNewTaskModal}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="inline-block min-w-full border border-gray-200 rounded-lg select-none relative">
          {/* Header */}
          <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
            <div className="w-64 flex-shrink-0 border-r border-gray-200 p-3 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-30">
              Task
            </div>
            <div className="flex">
              {days.map((day, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 border-r border-gray-200 text-center text-xs text-gray-500 py-2 flex flex-col items-center justify-center"
                  style={{ width: cellWidth }}
                >
                  <span className="font-medium">{format(day, 'd')}</span>
                  <span>{format(day, 'EEE')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div>
            {tasks.map((task, i) => {
              const hasDates = task.start && task.end;
              let leftOffset = 0;
              let width = 0;

              if (hasDates) {
                const startVal = task.start!;
                const endVal = task.end!;
                
                const diffStart = differenceInDays(startVal, startDate);
                const diffEnd = differenceInDays(endVal, startVal);
                
                leftOffset = diffStart * cellWidth;
                width = (diffEnd + 1) * cellWidth;

                if (isNaN(leftOffset)) leftOffset = 0;
                if (isNaN(width) || width < 0) width = 0;
                if (width > 0 && width < 2) width = 2;
              }

              return (
                <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50 relative group">
                  <div className="w-64 flex-shrink-0 border-r border-gray-200 p-3 text-sm font-medium text-gray-900 bg-white group-hover:bg-gray-50 sticky left-0 z-10 flex items-center justify-between">
                     <InlineEdit 
                       text={task.name} 
                       onSave={(name) => updateTask({ ...task, name })} 
                     />
                     <button
                        onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                        className="p-1 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                  </div>
                  <div className="flex relative" style={{ width: totalDays * cellWidth }}>
                    {/* Grid lines */}
                    {days.map((_, j) => (
                      <div
                        key={j}
                        className="flex-shrink-0 border-r border-gray-100 h-full"
                        style={{ width: cellWidth }}
                      />
                    ))}
                    
                    {/* Task Bar */}
                    {hasDates && (
                      <div
                        className={`absolute top-2 bottom-2 bg-indigo-500 rounded shadow-sm flex items-center px-2 text-xs text-white overflow-visible whitespace-nowrap cursor-pointer ${dragging?.id === task.id ? 'opacity-80' : ''}`}
                        style={{
                          left: leftOffset,
                          width: width,
                        }}
                        onMouseDown={(e) => handleDragStart(e, task, 'move')}
                      >
                        <span className="truncate w-full block overflow-hidden pointer-events-none">{task.name}</span>
                        
                        {/* Resize Handles */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-3 cursor-w-resize hover:bg-indigo-700/50 opacity-0 hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleDragStart(e, task, 'resize-start')}
                        />
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize hover:bg-indigo-700/50 opacity-0 hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleDragStart(e, task, 'resize-end')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={editingTask ? deleteTask : undefined}
        task={editingTask}
      />
    </div>
  );
}
