CREATE TABLE IF NOT EXISTS public.votes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    option_id uuid REFERENCES public.options(id) ON DELETE CASCADE,
    UNIQUE(user_id, option_id)
);