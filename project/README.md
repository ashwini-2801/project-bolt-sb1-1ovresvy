# TaskFlow — Task Management Web Application

A full-stack, production-ready task management application with a modern, responsive UI.
Users can register, log in, and create / edit / delete / search / filter / sort their own tasks.
Each user only sees the tasks they own (row-level security enforced in the database).

## Features

- **Authentication** — email/password sign-up & sign-in, session persistence, protected routes.
- **Task CRUD** — create, read, update, delete tasks with a modal form.
- **Status** — Pending, In Progress, Completed (one-click complete toggle).
- **Priority** — Low, Medium, High.
- **Due date** — optional date picker with overdue highlighting.
- **Search** — filter by title or description.
- **Filter** — by status and priority.
- **Sort** — by created date, due date, priority, or title (asc/desc).
- **Two views** — beautiful card grid and a sortable table.
- **Dashboard** — stat cards (total, pending, in progress, completed, overdue) + recent tasks.
- **Toast notifications** — success / error / info feedback for every action.
- **Responsive** — works from mobile to desktop with a collapsible sidebar.
- **Security** — Row Level Security on every table; users can only access their own rows.

## Tech Stack

- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, lucide-react icons, react-router-dom.
- **Backend / Database:** Supabase (PostgreSQL + Auth + Row Level Security).
  - This project uses Supabase as the backend instead of a separate Java Spring Boot service.
  - Supabase provides the same capabilities: REST API, JWT-based auth, schema constraints,
    and row-level authorization — all enforced server-side.

## Database Schema

### `tasks` table

| Column        | Type         | Notes                                              |
| ------------- | ------------ | -------------------------------------------------- |
| id            | uuid (PK)    | auto-generated                                     |
| title         | text         | not null                                            |
| description   | text         | default ''                                          |
| status        | text         | `pending` \| `in_progress` \| `completed` (check)  |
| priority      | text         | `low` \| `medium` \| `high` (check)                |
| due_date      | date         | nullable                                           |
| created_at    | timestamptz  | default now()                                      |
| updated_at    | timestamptz  | default now(), auto-updated via trigger            |
| user_id       | uuid (FK)    | references `auth.users(id)`, default `auth.uid()`  |

### Auth

Users are stored in Supabase's built-in `auth.users` table (no custom auth table).
Each task row is scoped to its owner via `user_id` and RLS policies.

### Row Level Security

Four policies on `tasks` (SELECT / INSERT / UPDATE / DELETE), each scoped to
`TO authenticated` with `auth.uid() = user_id`. The `user_id` column defaults to
`auth.uid()` so inserts that omit the owner still satisfy the INSERT policy.

## API Endpoints

The frontend talks to Supabase directly via the `@supabase/supabase-js` client:

| Operation                | Method     | Endpoint                       |
| ------------------------ | ---------- | ------------------------------ |
| Sign up                  | `signUp`   | `auth.signUp`                  |
| Sign in                  | `signIn`   | `auth.signInWithPassword`      |
| Sign out                 | `signOut`  | `auth.signOut`                 |
| List tasks               | `select`   | `from('tasks').select('*')`    |
| Create task              | `insert`   | `from('tasks').insert(...)`    |
| Update task              | `update`   | `from('tasks').update(...)`    |
| Delete task              | `delete`   | `from('tasks').delete()`       |

All task operations are automatically scoped to the authenticated user by RLS.

## Project Structure

```
project/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.app.json
├── .env                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
└── src/
    ├── App.tsx                   # Routes
    ├── main.tsx
    ├── index.css
    ├── lib/
    │   ├── supabaseClient.ts     # Supabase client singleton
    │   └── taskFilters.ts        # search / filter / sort + stats helpers
    ├── types/
    │   └── task.ts               # Task types + label maps
    ├── context/
    │   ├── AuthContext.tsx       # session, signIn, signUp, signOut
    │   └── ToastContext.tsx      # toast notifications
    ├── hooks/
    │   └── useTasks.ts           # CRUD hook for tasks
    └── components/
        ├── auth/
        │   ├── LoginPage.tsx
        │   ├── SignupPage.tsx
        │   └── ProtectedRoute.tsx
        └── dashboard/
            ├── DashboardLayout.tsx  # sidebar + header + modal + confirm
            ├── Sidebar.tsx
            ├── DashboardView.tsx     # stats + recent tasks
            ├── AllTasksView.tsx      # full list, grid + table
            ├── TaskToolbar.tsx       # search / filter / sort
            ├── TaskCard.tsx
            ├── TaskModal.tsx         # create / edit form
            ├── ConfirmDialog.tsx     # delete confirmation
            └── StatCard.tsx
```

## Installation & Running

The Supabase project is already provisioned and credentials are in `.env`.

```bash
# install dependencies
npm install

# start the dev server (runs automatically in this environment)
npm run dev

# production build
npm run build

# type check
npm run typecheck
```

Open the app, sign up for an account, and start creating tasks.

## Sample Data

After signing up, use the **New Task** button to create tasks. Example tasks:

- Title: "Finish quarterly report" — Priority: High — Due: next Friday
- Title: "Review pull requests" — Priority: Medium — Status: In Progress
- Title: "Water the plants" — Priority: Low — Status: Completed

## Error Handling

- All async operations surface errors via toast notifications.
- Form validation: required title, minimum password length of 6.
- Database constraints enforce valid status / priority values.
- RLS prevents any user from reading or modifying another user's tasks.
