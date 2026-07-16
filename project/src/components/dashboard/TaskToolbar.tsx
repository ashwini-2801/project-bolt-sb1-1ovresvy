import { Search, Filter, ArrowUpDown } from 'lucide-react';
import {
  type TaskStatus,
  type TaskPriority,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '../../types/task';

export type SortKey = 'created_at' | 'due_date' | 'priority' | 'title';
export type SortDir = 'asc' | 'desc';

interface TaskToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: TaskStatus | 'all';
  onStatusFilter: (v: TaskStatus | 'all') => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityFilter: (v: TaskPriority | 'all') => void;
  sortKey: SortKey;
  onSortKey: (v: SortKey) => void;
  sortDir: SortDir;
  onSortDir: (v: SortDir) => void;
}

export default function TaskToolbar(props: TaskToolbarProps) {
  const selectClass =
    'px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={props.statusFilter}
            onChange={(e) =>
              props.onStatusFilter(e.target.value as TaskStatus | 'all')
            }
            className={selectClass}
          >
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={props.priorityFilter}
            onChange={(e) =>
              props.onPriorityFilter(e.target.value as TaskPriority | 'all')
            }
            className={selectClass}
          >
            <option value="all">All Priorities</option>
            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={props.sortKey}
            onChange={(e) => props.onSortKey(e.target.value as SortKey)}
            className={selectClass}
          >
            <option value="created_at">Sort: Created</option>
            <option value="due_date">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>
          <select
            value={props.sortDir}
            onChange={(e) => props.onSortDir(e.target.value as SortDir)}
            className={selectClass}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>
    </div>
  );
}
