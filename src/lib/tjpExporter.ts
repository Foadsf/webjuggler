import { Task } from '../types';
import { format } from 'date-fns';

export function exportTjp(tasks: Task[]): string {
  let content = 'project myProject "Exported Project" "1.0" 2026-01-01 - 2026-12-31

';

  tasks.forEach(task => {
    content += `task ${task.id} "${task.name}" {
`;
    if (task.start) {
      content += `  start ${format(task.start, 'yyyy-MM-dd')}
`;
    }
    if (task.end) {
      content += `  end ${format(task.end, 'yyyy-MM-dd')}
`;
    }
    if (task.duration && !task.end) {
      content += `  duration ${task.duration}d
`;
    }
    if (task.depends && task.depends.length > 0) {
      task.depends.forEach(dep => {
        content += `  depends !${dep}
`;
      });
    }
    content += `}

`;
  });

  return content;
}
