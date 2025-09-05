CREATE TABLE IF NOT EXISTS public.options (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
    option_text text NOT NULL,
    votes integer DEFAULT 0
);