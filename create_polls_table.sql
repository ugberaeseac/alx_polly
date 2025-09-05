CREATE TABLE IF NOT EXISTS public.polls (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);