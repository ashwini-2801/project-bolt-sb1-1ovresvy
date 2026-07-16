import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, PlusCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import TaskModal from './TaskModal';
import ConfirmDialog from './ConfirmDialog';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import { type Task, type TaskInput } from '../../types/task';

export default function DashboardLayout() {
  const { createTask, updateTask, deleteTask } = useTasks();
  const { notify } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleSubmit = async (input: TaskInput) => {
    try {
      if (editing) {
        await updateTask(editing.id, input);
        notify('success', 'Task updated');
      } else {
        await createTask(input);
        notify('success', 'Task created');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      notify('error', msg);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await deleteTask(deleting.id);
      notify('success', 'Task deleted');
      setDeleting(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      notify('error', msg);
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const next = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: next,
        priority: task.priority,
        due_date: task.due_date,
      });
      notify(
        'success',
        next === 'completed' ? 'Marked as completed' : 'Marked as pending',
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      notify('error', msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewTask={openNew}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-900 text-lg">TaskFlow</h1>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition shadow-sm shadow-blue-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet
            context={{
              onEdit: openEdit,
              onDelete: (t: Task) => setDeleting(t),
              onToggleComplete: handleToggleComplete,
              onNewTask: openNew,
            }}
          />
        </main>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        task={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Delete task?"
        message={`"${deleting?.title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deletingLoading}
      />
    </div>
  );
}
