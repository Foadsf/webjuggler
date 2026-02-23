import { useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { logger } from '../lib/logger';

export function useUndoRedo() {
  const { canUndo, canRedo, dispatch } = useTaskContext();

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: 'UNDO' });
      logger.info('UndoRedo', 'Undo performed');
    }
  }, [canUndo, dispatch]);

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: 'REDO' });
      logger.info('UndoRedo', 'Redo performed');
    }
  }, [canRedo, dispatch]);

  return { undo, redo, canUndo, canRedo };
}
