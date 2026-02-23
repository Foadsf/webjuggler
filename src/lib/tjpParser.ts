import { Task } from '../types';
import { logger } from './logger';

export function parseTjp(content: string): Task[] {
  const tasks: Task[] = [];
  const log = (msg: string, data?: any) => logger.debug('TjpParser', msg, data);
  
  log('Starting TJP parsing', { contentSize: content.length });

  // A very naive parser for demonstration purposes
  const taskRegex = /task\s+([a-zA-Z0-9_]+)\s+"([^"]+)"\s*\{([^}]*)\}/g;
  let match;
  let taskCount = 0;

  while ((match = taskRegex.exec(content)) !== null) {
    taskCount++;
    const [fullMatch, id, name, body] = match;
    const lineNumber = (content.substring(0, match.index).match(/\n/g) || []).length + 1;

    log(`Matched task #${taskCount} at line ${lineNumber}`, { id, name });

    try {
      const startMatch = body.match(/start\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/);
      const startStr = startMatch ? startMatch[1] : undefined;
      const startDate = startStr ? new Date(startStr) : undefined;
      
      if (startStr && (!startDate || isNaN(startDate.getTime()))) {
        logger.warn('TjpParser', `Invalid start date for ${id}`, { startStr });
      }
      
      if (startDate) log(`  Found start date for ${id}`, { start: startStr });

      const endMatch = body.match(/end\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/);
      const endStr = endMatch ? endMatch[1] : undefined;
      const endDate = endStr ? new Date(endStr) : undefined;

      if (endStr && (!endDate || isNaN(endDate.getTime()))) {
        logger.warn('TjpParser', `Invalid end date for ${id}`, { endStr });
      }

      if (endDate) log(`  Found end date for ${id}`, { end: endStr });

      const durationMatch = body.match(/duration\s+([0-9]+)[dhw]/);
      if (durationMatch) log(`  Found duration for ${id}`, { duration: durationMatch[1] });

      const dependsMatch = body.match(/depends\s+!([a-zA-Z0-9_]+)/g);
      const depends = dependsMatch ? dependsMatch.map(d => {
        const depId = d.replace('depends !', '').trim();
        log(`  Found dependency for ${id}`, { dependsOn: depId });
        return depId;
      }) : [];

      const task: Task = {
        id,
        name,
        start: startDate && !isNaN(startDate.getTime()) ? startDate : undefined,
        end: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
        duration: durationMatch ? parseInt(durationMatch[1], 10) : undefined,
        depends,
        status: 'todo',
      };

      if (!task.id || !task.name) {
        logger.warn('TjpParser', 'Parsed task is missing critical fields', { task });
      }

      tasks.push(task);
    } catch (e) {
      logger.error('TjpParser', `Failed to parse task body for ${id} at line ${lineNumber}`, { error: e, body });
    }
  }

  log('Completed TJP parsing', { totalTasks: tasks.length });
  return tasks;
}
