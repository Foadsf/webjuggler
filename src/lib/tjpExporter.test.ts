import { describe, it, expect } from 'vitest';
import { exportTjp } from './tjpExporter';
import { Task } from '../types';

describe('exportTjp', () => {
  it('should export tasks to valid TJP format', () => {
    const tasks: Task[] = [
      { id: 't1', name: 'Test Task', start: new Date('2025-01-01'), end: new Date('2025-01-05'), status: 'todo', depends: [] }
    ];
    const result = exportTjp(tasks);
    expect(result).toContain('project');
    expect(result).toContain('task t1');
    expect(result).toContain('start 2025-01-01');
    expect(result).toContain('end 2025-01-05');
  });

  it('should handle tasks without dates', () => {
    const tasks: Task[] = [
      { id: 't2', name: 'No Date Task', status: 'todo', depends: [] }
    ];
    const result = exportTjp(tasks);
    expect(result).toContain('task t2');
    expect(result).not.toContain('start');
    expect(result).not.toContain('end');
  });

  it('should escape double quotes in task names', () => {
    const tasks: Task[] = [
      { id: 't3', name: 'Task with "quotes"', status: 'todo', depends: [] }
    ];
    const result = exportTjp(tasks);
    expect(result).toContain('Task with \\"quotes\\"');
  });

  it('should handle dependencies', () => {
    const tasks: Task[] = [
      { id: 't1', name: 'Parent', status: 'todo', depends: [] },
      { id: 't2', name: 'Child', status: 'todo', depends: ['t1'] }
    ];
    const result = exportTjp(tasks);
    expect(result).toContain('depends !t1');
  });
});
