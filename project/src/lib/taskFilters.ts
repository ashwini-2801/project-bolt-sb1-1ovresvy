import { type Task, type TaskStatus, type TaskPriority } from '../types/task';
import { type SortKey, type SortDir } from '../components/dashboard/TaskToolbar';

const priorityRank: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function filterAndSortTasks(
  tasks: Task[],
  opts: {
    search: string;
    status: TaskStatus | 'all';
    priority: TaskPriority | 'all';
    sortKey: SortKey;
    sortDir: SortDir;
  },
): Task[] {
  const q = opts.search.trim().toLowerCase();
  let result = tasks.filter((t) => {
    if (opts.status !== 'all' && t.status !== opts.status) return false;
    if (opts.priority !== 'all' && t.priority !== opts.priority) return false;
    if (q) {
      const hay = `${t.title} ${t.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const dir = opts.sortDir === 'asc' ? 1 : -1;
  result = [...result].sort((a, b) => {
    let cmp = 0;
    switch (opts.sortKey) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'due_date': {
        const ad = a.due_date ?? '';
        const bd = b.due_date ?? '';
        cmp = ad.localeCompare(bd);
        break;
      }
      case 'priority':
        cmp = priorityRank[a.priority] - priorityRank[b.priority];
        break;
      case 'created_at':
      default:
        cmp = a.created_at.localeCompare(b.created_at);
    }
    return cmp * dir;
  });

  return result;
}

export function computeStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(
    (t) =>
      t.status !== 'completed' &&
      t.due_date !== null &&
      new Date(t.due_date) < today,
  ).length;
  return { total, completed, inProgress, pending, overdue };
}
