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
      if (startMatch) log(`  Found start date for ${id}`, { start: startMatch[1] });

      const endMatch = body.match(/end\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/);
      if (endMatch) log(`  Found end date for ${id}`, { end: endMatch[1] });

      const durationMatch = body.match(/duration\s+([0-9]+)[dhw]/);
      if (durationMatch) log(`  Found duration for ${id}`, { duration: durationMatch[1] });

      const dependsMatch = body.match(/depends\s+!([a-zA-Z0-9_]+)/g);
      const depends = dependsMatch ? dependsMatch.map(d => {
        const depId = d.replace('depends !', '').trim();
        log(`  Found dependency for ${id}`, { dependsOn: depId });
        return depId;
      }) : [];

      tasks.push({
        id,
        name,
        start: startMatch ? new Date(startMatch[1]) : undefined,
        end: endMatch ? new Date(endMatch[1]) : undefined,
        duration: durationMatch ? parseInt(durationMatch[1], 10) : undefined,
        depends,
        status: 'todo',
      });
    } catch (e) {
      logger.error('TjpParser', `Failed to parse task body for ${id} at line ${lineNumber}`, { error: e, body });
    }
  }

  log('Completed TJP parsing', { totalTasks: tasks.length });
  return tasks;
}
