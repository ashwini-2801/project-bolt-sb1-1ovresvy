import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ListTodo,
  Circle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { computeStats } from '../../lib/taskFilters';
import StatCard from './StatCard';
import TaskCard from './TaskCard';
import { type Task } from '../../types/task';

interface OutletCtx {
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
  onNewTask: () => void;
}

export default function DashboardView() {
  const { tasks, loading, error } = useTasks();
  const ctx = useOutletContext<OutletCtx>();
  const stats = useMemo(() => computeStats(tasks), [tasks]);

  const recent = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 6),
    [tasks],
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Overview of your tasks and progress.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total"
          value={stats.total}
          icon={ListTodo}
          color="slate"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Circle}
          color="amber"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Recent Tasks</h3>
          <button
            onClick={ctx.onNewTask}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : recent.length === 0 ? (
          <EmptyState onNew={ctx.onNewTask} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recent.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={ctx.onEdit}
                onDelete={ctx.onDelete}
                onToggleComplete={ctx.onToggleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <PlusCircle className="w-7 h-7" />
      </div>
      <h3 className="font-semibold text-slate-900">No tasks yet</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        Create your first task to get started.
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
      >
        <PlusCircle className="w-4 h-4" />
        New Task
      </button>
    </div>
  );
}
