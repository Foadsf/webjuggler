import { describe, it, expect } from 'vitest';
import { differenceInDays, startOfWeek } from 'date-fns';

describe('Gantt calculations', () => {
  it('should correctly calculate difference in days', () => {
    const start = new Date('2026-02-23');
    const end = new Date('2026-02-25');
    // 23 to 25 is 2 days difference
    expect(differenceInDays(end, start)).toBe(2);
  });

  it('should handle same day as 0 days difference', () => {
    const start = new Date('2026-02-23');
    const end = new Date('2026-02-23');
    expect(differenceInDays(end, start)).toBe(0);
  });

  it('should calculate start of week correctly', () => {
    const date = new Date('2026-02-23'); // Monday
    const sow = startOfWeek(date);
    expect(sow.getDay()).toBe(0); // Sunday (default start of week in date-fns)
  });
});
