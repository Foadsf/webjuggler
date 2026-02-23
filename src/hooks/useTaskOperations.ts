import { useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types';
import { logger } from '../lib/logger';
import { useUndoRedo } from './useUndoRedo';

// Simple UUID generator
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function useTaskOperations() {
  const { tasks, dispatch } = useTaskContext();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: generateId() };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    logger.info('TaskOperations', 'Task added', { taskId: newTask.id });
  }, [dispatch]);

  const updateTask = useCallback((task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
    logger.info('TaskOperations', 'Task updated', { taskId: task.id });
  }, [dispatch]);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
    logger.info('TaskOperations', 'Task deleted', { taskId });
  }, [dispatch]);

  const loadTasks = useCallback((newTasks: Task[]) => {
    dispatch({ type: 'LOAD_TASKS', payload: newTasks });
    logger.info('TaskOperations', 'Tasks loaded', { count: newTasks.length });
  }, [dispatch]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    undo,
    redo,
    loadTasks,
    canUndo,
    canRedo,
  };
}
