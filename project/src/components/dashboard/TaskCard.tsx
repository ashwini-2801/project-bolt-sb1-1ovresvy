import { Pencil, Trash2, Calendar, Circle, Clock, CheckCircle2 } from 'lucide-react';
import {
  type Task,
  type TaskStatus,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '../../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  pending: {
    label: STATUS_LABELS.pending,
    icon: <Circle className="w-3.5 h-3.5" />,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  in_progress: {
    label: STATUS_LABELS.in_progress,
    icon: <Clock className="w-3.5 h-3.5" />,
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  completed: {
    label: STATUS_LABELS.completed,
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const priorityClasses: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(dateStr: string | null, status: TaskStatus): boolean {
  if (!dateStr || status === 'completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const s = statusConfig[task.status];
  const overdue = isOverdue(task.due_date, task.status);
  const done = task.status === 'completed';

  return (
    <div
      className={`group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition ${done ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className={`font-semibold text-slate-900 leading-snug ${done ? 'line-through text-slate-400' : ''}`}
        >
          {task.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {task.description && (
        <p
          className={`text-sm text-slate-500 mb-3 line-clamp-2 ${done ? 'line-through' : ''}`}
        >
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.classes}`}
        >
          {s.icon}
          {s.label}
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityClasses[task.priority]}`}
        >
          {PRIORITY_LABELS[task.priority]} priority
        </span>
        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              overdue
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {formatDate(task.due_date)}
            {overdue && ' · Overdue'}
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => onToggleComplete(task)}
          className="text-xs font-medium text-slate-500 hover:text-blue-600 transition"
        >
          {done ? 'Mark as Pending' : 'Mark as Completed'}
        </button>
        <span className="text-xs text-slate-400">
          Updated {new Date(task.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
