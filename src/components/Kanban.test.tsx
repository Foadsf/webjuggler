import { describe, it, expect } from 'vitest';
import { normalizeStatus } from './Kanban';

describe('Kanban normalizeStatus', () => {
  it('should normalize various "todo" strings to "todo"', () => {
    expect(normalizeStatus('todo')).toBe('todo');
    expect(normalizeStatus('To Do')).toBe('todo');
    expect(normalizeStatus('to-do')).toBe('todo');
    expect(normalizeStatus('  TODO  ')).toBe('todo');
  });

  it('should normalize various "in-progress" strings to "in-progress"', () => {
    expect(normalizeStatus('in-progress')).toBe('in-progress');
    expect(normalizeStatus('In Progress')).toBe('in-progress');
    expect(normalizeStatus('inprogress')).toBe('in-progress');
  });

  it('should normalize various "done" strings to "done"', () => {
    expect(normalizeStatus('done')).toBe('done');
    expect(normalizeStatus('Completed')).toBe('done');
    expect(normalizeStatus('finished')).toBe('done');
  });

  it('should return "todo" for unknown or empty statuses', () => {
    expect(normalizeStatus('')).toBe('todo');
    expect(normalizeStatus(null)).toBe('todo');
    expect(normalizeStatus(undefined)).toBe('todo');
    expect(normalizeStatus('unknown')).toBe('todo');
  });
});
