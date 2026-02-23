import { Task } from '../types';
import { format } from 'date-fns';

export function exportTjp(tasks: Task[]): string {
  let content = `project myProject "Exported Project" "1.0" 2026-01-01 - 2026-12-31

`;

  tasks.forEach(task => {
    // Escape quotes in name
    const safeName = task.name.replace(/"/g, '\\"');
    content += `task ${task.id} "${safeName}" {\n`;
    if (task.start && !isNaN(task.start.getTime())) {
      content += `  start ${format(task.start, 'yyyy-MM-dd')}\n`;
    }
    if (task.end && !isNaN(task.end.getTime())) {
      content += `  end ${format(task.end, 'yyyy-MM-dd')}\n`;
    }
    if (task.duration && !task.end) {
      content += `  duration ${task.duration}d\n`;
    }
    if (task.depends && task.depends.length > 0) {
      task.depends.forEach(dep => {
        content += `  depends !${dep}\n`;
      });
    }
    content += `}\n\n`;
  });

  return content;
}
