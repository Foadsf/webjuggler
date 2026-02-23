import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { Task } from '../types';
import { logger } from '../lib/logger';
import { parseTjp } from '../lib/tjpParser';

// --- Types ---

interface TaskState {
  tasks: Task[];
  history: Task[][]; // Undo stack
  future: Task[][];  // Redo stack
}

type Action =
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface TaskContextType {
  tasks: Task[];
  dispatch: React.Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
}

// --- Initial State ---

const initialState: TaskState = {
  tasks: [],
  history: [],
  future: [],
};

// --- Reducer ---

function taskReducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'LOAD_TASKS':
      return {
        ...state,
        tasks: action.payload,
        history: [], // Clear history on new load
        future: [],
      };

    case 'ADD_TASK': {
      const newHistory = [...state.history, state.tasks];
      // Limit history size to 50
      if (newHistory.length > 50) newHistory.shift();

      return {
        tasks: [...state.tasks, action.payload],
        history: newHistory,
        future: [], // Clear redo stack on new action
      };
    }

    case 'UPDATE_TASK': {
      const newHistory = [...state.history, state.tasks];
      if (newHistory.length > 50) newHistory.shift();

      return {
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
        history: newHistory,
        future: [],
      };
    }

    case 'DELETE_TASK': {
      const newHistory = [...state.history, state.tasks];
      if (newHistory.length > 50) newHistory.shift();

      return {
        tasks: state.tasks.filter(t => t.id !== action.payload),
        history: newHistory,
        future: [],
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        tasks: previous,
        history: newHistory,
        future: [state.tasks, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        tasks: next,
        history: [...state.history, state.tasks],
        future: newFuture,
      };
    }

    default:
      return state;
  }
}

// --- Context ---

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// --- Provider ---

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('webjuggler-tasks');
    if (saved) {
      try {
        // We need to parse dates back from strings
        const tasks = JSON.parse(saved, (key, value) => {
          if (key === 'start' || key === 'end') return value ? new Date(value) : undefined;
          return value;
        });
        dispatch({ type: 'LOAD_TASKS', payload: tasks });
        logger.info('TaskContext', 'Loaded tasks from localStorage', { count: tasks.length });
      } catch (e) {
        logger.error('TaskContext', 'Failed to parse tasks from localStorage', { error: e });
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (state.tasks.length > 0) {
      localStorage.setItem('webjuggler-tasks', JSON.stringify(state.tasks));
    }
  }, [state.tasks]);

  const value = {
    tasks: state.tasks,
    dispatch,
    canUndo: state.history.length > 0,
    canRedo: state.future.length > 0,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// --- Hook ---

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
