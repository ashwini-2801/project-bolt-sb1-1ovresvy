import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PlusCircle, LayoutGrid, Table2 } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { filterAndSortTasks } from '../../lib/taskFilters';
import { type Task, type TaskStatus, type TaskPriority } from '../../types/task';
import TaskToolbar, {
  type SortKey,
  type SortDir,
} from './TaskToolbar';
import TaskCard from './TaskCard';
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '../../types/task';

interface OutletCtx {
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
  onNewTask: () => void;
}

type ViewMode = 'grid' | 'table';

export default function AllTasksView() {
  const { tasks, loading, error } = useTasks();
  const ctx = useOutletContext<OutletCtx>();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>(
    'all',
  );
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filtered = useMemo(
    () =>
      filterAndSortTasks(tasks, {
        search,
        status: statusFilter,
        priority: priorityFilter,
        sortKey,
        sortDir,
      }),
    [tasks, search, statusFilter, priorityFilter, sortKey, sortDir],
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">All Tasks</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} of {tasks.length} tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              aria-label="Table view"
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={ctx.onNewTask}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition shadow-sm shadow-blue-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      <TaskToolbar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilter={setPriorityFilter}
        sortKey={sortKey}
        onSortKey={setSortKey}
        sortDir={sortDir}
        onSortDir={setSortDir}
      />

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="font-semibold text-slate-900">No tasks found</p>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your filters or create a new task.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onEdit={ctx.onEdit}
              onDelete={ctx.onDelete}
              onToggleComplete={ctx.onToggleComplete}
            />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={filtered}
          onEdit={ctx.onEdit}
          onDelete={ctx.onDelete}
          onToggleComplete={ctx.onToggleComplete}
        />
      )}
    </div>
  );
}

function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
}: {
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
}) {
  const statusClasses: Record<TaskStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };
  const priorityClasses: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Title</th>
              <th className="text-left font-semibold px-4 py-3">Status</th>
              <th className="text-left font-semibold px-4 py-3">Priority</th>
              <th className="text-left font-semibold px-4 py-3">Due Date</th>
              <th className="text-right font-semibold px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <p
                    className={`font-medium text-slate-900 ${t.status === 'completed' ? 'line-through text-slate-400' : ''}`}
                  >
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[t.status]}`}
                  >
                    {STATUS_LABELS[t.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityClasses[t.priority]}`}
                  >
                    {PRIORITY_LABELS[t.priority]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {t.due_date
                    ? new Date(t.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onToggleComplete(t)}
                      className="text-xs font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded transition"
                    >
                      {t.status === 'completed' ? 'Reopen' : 'Complete'}
                    </button>
                    <button
                      onClick={() => onEdit(t)}
                      className="text-xs font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(t)}
                      className="text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
