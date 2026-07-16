import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { type Task, type TaskInput } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: TaskInput) => {
    const { error } = await supabase.from('tasks').insert(input);
    if (error) throw error;
    await fetchTasks();
  };

  const updateTask = async (id: string, input: TaskInput) => {
    const { error } = await supabase.from('tasks').update(input).eq('id', id);
    if (error) throw error;
    await fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    await fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
