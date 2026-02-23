import React, { useMemo, useState, useEffect } from 'react';
import { Task } from '../types';
import { addDays, differenceInDays, format, min, max, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useLogger } from '../lib/logger';

interface GanttProps {
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
}

export function Gantt({ tasks, onTaskUpdate }: GanttProps) {
  const [draggingTask, setDraggingTask] = useState<{ id: string; startX: number; originalStart: Date; originalEnd: Date } | null>(null);
  const logger = useLogger('Gantt');

  useEffect(() => {
    logger.debug('Gantt mounted', { taskCount: tasks.length });
    return () => logger.debug('Gantt unmounted');
  }, []);

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
    logger.debug('Gantt calculation complete', { duration: `${(endTime - startTime).toFixed(2)}ms`, dayCount: result.days.length });
    
    return result;
  }, [tasks]);

  if (tasks.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No tasks with dates to display</div>;
  }

  const totalDays = days.length;
  const cellWidth = 40;

  const handleDragStart = (e: React.MouseEvent, task: Task) => {
    if (!task.start || !task.end || !onTaskUpdate) return;
    logger.info('Task drag started', { taskId: task.id, start: task.start });
    setDraggingTask({
      id: task.id,
      startX: e.clientX,
      originalStart: task.start,
      originalEnd: task.end,
    });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingTask || !onTaskUpdate) return;
    
    const deltaX = e.clientX - draggingTask.startX;
    const deltaDays = Math.round(deltaX / cellWidth);
    
    if (deltaDays !== 0) {
      const task = tasks.find(t => t.id === draggingTask.id);
      if (task) {
        const newStart = addDays(draggingTask.originalStart, deltaDays);
        const newEnd = addDays(draggingTask.originalEnd, deltaDays);
        
        logger.debug('Task dragging', { 
          taskId: task.id, 
          deltaDays, 
          newStart: format(newStart, 'yyyy-MM-dd') 
        });

        onTaskUpdate({
          ...task,
          start: newStart,
          end: newEnd,
        });
      }
    }
  };

  const handleDragEnd = () => {
    if (draggingTask) {
      logger.info('Task drag ended', { taskId: draggingTask.id });
      setDraggingTask(null);
    }
  };

  return (
    <div 
      className="p-6 overflow-auto h-full bg-white"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="inline-block min-w-full border border-gray-200 rounded-lg select-none">
        {/* Header */}
        <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div className="w-64 flex-shrink-0 border-r border-gray-200 p-3 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-20">
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
              leftOffset = differenceInDays(task.start!, startDate) * cellWidth;
              width = (differenceInDays(task.end!, task.start!) + 1) * cellWidth;
            }

            return (
              <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50 relative group">
                <div className="w-64 flex-shrink-0 border-r border-gray-200 p-3 text-sm font-medium text-gray-900 bg-white group-hover:bg-gray-50 sticky left-0 z-10">
                  {task.name}
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
                      className={`absolute top-2 bottom-2 bg-indigo-500 rounded shadow-sm flex items-center px-2 text-xs text-white overflow-hidden whitespace-nowrap ${onTaskUpdate ? 'cursor-ew-resize' : ''} ${draggingTask?.id === task.id ? 'opacity-80' : ''}`}
                      style={{
                        left: leftOffset,
                        width: width,
                      }}
                      onMouseDown={(e) => handleDragStart(e, task)}
                    >
                      {task.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
