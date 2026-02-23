import { Task } from '../types';

export function parseTjp(content: string): Task[] {
  const tasks: Task[] = [];
  // A very naive parser for demonstration purposes
  const taskRegex = /task\s+([a-zA-Z0-9_]+)\s+"([^"]+)"\s*\{([^}]*)\}/g;
  let match;

  while ((match = taskRegex.exec(content)) !== null) {
    const id = match[1];
    const name = match[2];
    const body = match[3];

    const startMatch = body.match(/start\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/);
    const endMatch = body.match(/end\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/);
    const durationMatch = body.match(/duration\s+([0-9]+)[dhw]/);
    const dependsMatch = body.match(/depends\s+!([a-zA-Z0-9_]+)/g);

    const depends = dependsMatch ? dependsMatch.map(d => d.replace('depends !', '').trim()) : [];

    tasks.push({
      id,
      name,
      start: startMatch ? new Date(startMatch[1]) : undefined,
      end: endMatch ? new Date(endMatch[1]) : undefined,
      duration: durationMatch ? parseInt(durationMatch[1], 10) : undefined,
      depends,
      status: 'todo',
    });
  }

  return tasks;
}
