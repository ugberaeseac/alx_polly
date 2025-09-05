INSERT INTO public.polls (id, created_at, title, description, user_id)
VALUES
(gen_random_uuid(), NOW(), 'Favorite Programming Language', 'Which programming language do you prefer?', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), NOW(), 'Best Frontend Framework', 'What is your go-to frontend framework?', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), NOW(), 'Preferred Cloud Provider', 'Which cloud provider do you use most?', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), NOW(), 'Favorite IDE', 'What is your preferred Integrated Development Environment?', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), NOW(), 'Most Useful AI Tool', 'Which AI tool do you find most helpful in coding?', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO public.options (id, poll_id, option_text, votes)
VALUES
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'JavaScript', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Python', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'TypeScript', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Go', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Best Frontend Framework' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'React', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Best Frontend Framework' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Vue', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Best Frontend Framework' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Angular', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Preferred Cloud Provider' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'AWS', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Preferred Cloud Provider' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Azure', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Preferred Cloud Provider' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Google Cloud', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite IDE' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'VS Code', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite IDE' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'IntelliJ IDEA', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite IDE' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'WebStorm', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Most Useful AI Tool' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'GitHub Copilot', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Most Useful AI Tool' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'ChatGPT', 0),
(gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Most Useful AI Tool' AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), 'Gemini', 0);

-- Note: The user_id 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' is a placeholder. Please replace it with an actual user ID from your auth.users table in Supabase after a user registers.
-- The poll_id is now dynamically fetched using a subquery to ensure correct linking to the polls created with gen_random_uuid().