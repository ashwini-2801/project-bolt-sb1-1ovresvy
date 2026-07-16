/*
# Create tasks table (multi-user, owner-scoped)

1. Purpose
- Stores individual tasks belonging to each authenticated user.
- Each user can only see, create, update, and delete their own tasks (row-level security).

2. New Tables
- `tasks`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) - short title of the task
  - `description` (text, default empty string) - longer description / notes
  - `status` (text, not null, default 'pending') - one of: pending | in_progress | completed
  - `priority` (text, not null, default 'medium') - one of: low | medium | high
  - `due_date` (date, nullable) - optional due date for the task
  - `created_at` (timestamptz, default now) - when the task was created
  - `updated_at` (timestamptz, default now) - when the task was last updated
  - `user_id` (uuid, not null, default auth.uid()) - owner of the task, references auth.users

3. Constraints
- `tasks_status_check`: status must be one of pending, in_progress, completed.
- `tasks_priority_check`: priority must be one of low, medium, high.
- `tasks_user_id_fkey`: cascading delete when the auth user is removed.

4. Indexes
- `idx_tasks_user_id`: fast lookup of a user's tasks.
- `idx_tasks_user_status`: fast filtering by status per user.
- `idx_tasks_user_priority`: fast filtering by priority per user.
- `idx_tasks_user_due_date`: fast sorting by due date per user.

5. Security (RLS)
- Enable RLS on `tasks`.
- Four owner-scoped policies (SELECT/INSERT/UPDATE/DELETE) scoped to `authenticated`:
  - select_own_tasks: a user can read only their tasks.
  - insert_own_tasks: a user can create tasks for themselves (user_id defaults to auth.uid()).
  - update_own_tasks: a user can update only their tasks.
  - delete_own_tasks: a user can delete only their tasks.

6. Important Notes
1. The `user_id` column has `DEFAULT auth.uid()` so frontend inserts that omit
   `user_id` still satisfy the INSERT WITH CHECK policy.
2. `updated_at` is maintained by a trigger that sets it to now() on every update.
3. Policies are dropped before recreate to keep the migration idempotent.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);

-- Auto-update updated_at on row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Owner-scoped policies
DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
