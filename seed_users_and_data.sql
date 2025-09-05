INSERT INTO auth.users (id, aud, role, email, email_confirmed_at, instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'user1@example.com', now(), '00000000-0000-0000-0000-000000000000', '{}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'user2@example.com', now(), '00000000-0000-0000-0000-000000000000', '{}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'user3@example.com', now(), '00000000-0000-0000-0000-000000000000', '{}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'user4@example.com', now(), '00000000-0000-0000-0000-000000000000', '{}', '{}', now(), now());

-- Now, seed poll data using these user IDs

INSERT INTO public.polls (id, created_at, title, description, user_id)
VALUES
    (gen_random_uuid(), now(), 'Favorite Color', 'What is your favorite color among these options?', (SELECT id FROM auth.users WHERE email = 'user1@example.com')),
    (gen_random_uuid(), now(), 'Favorite Food', 'What is your go-to comfort food?', (SELECT id FROM auth.users WHERE email = 'user2@example.com')),
    (gen_random_uuid(), now(), 'Programming Language', 'Which programming language do you prefer for web development?', (SELECT id FROM auth.users WHERE email = 'user3@example.com')),
    (gen_random_uuid(), now(), 'Travel Destination', 'Where would you like to travel next?', (SELECT id FROM auth.users WHERE email = 'user4@example.com')),
    (gen_random_uuid(), now(), 'Pet Preference', 'Are you a cat person or a dog person?', (SELECT id FROM auth.users WHERE email = 'user1@example.com'));

INSERT INTO public.options (id, poll_id, option_text, votes)
VALUES
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Color' LIMIT 1), 'Blue', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Color' LIMIT 1), 'Green', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Color' LIMIT 1), 'Red', 0),

    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Food' LIMIT 1), 'Pizza', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Food' LIMIT 1), 'Burgers', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Favorite Food' LIMIT 1), 'Pasta', 0),

    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Programming Language' LIMIT 1), 'JavaScript', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Programming Language' LIMIT 1), 'Python', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Programming Language' LIMIT 1), 'TypeScript', 0),

    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Travel Destination' LIMIT 1), 'Japan', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Travel Destination' LIMIT 1), 'Italy', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Travel Destination' LIMIT 1), 'New Zealand', 0),

    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Pet Preference' LIMIT 1), 'Cat', 0),
    (gen_random_uuid(), (SELECT id FROM public.polls WHERE title = 'Pet Preference' LIMIT 1), 'Dog', 0);