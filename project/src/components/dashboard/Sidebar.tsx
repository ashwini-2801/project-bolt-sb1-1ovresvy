import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  LogOut,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNewTask: () => void;
}

export default function Sidebar({ open, onClose, onNewTask }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      notify('info', 'Signed out');
      navigate('/login');
    } catch {
      notify('error', 'Failed to sign out');
    }
  };

  const navItem = (to: string, label: string, icon: React.ReactNode) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900">TaskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-slate-900"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          <button
            onClick={() => {
              onNewTask();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg transition shadow-sm shadow-blue-600/30 mb-4"
          >
            <PlusCircle className="w-4 h-4" />
            New Task
          </button>

          <nav className="space-y-1">
            {navItem('/app', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
            {navItem('/app/tasks', 'All Tasks', <ListTodo className="w-4 h-4" />)}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold text-sm uppercase">
              {(user?.email ?? '?')[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.user_metadata?.name ?? 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
