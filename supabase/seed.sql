insert into profiles (id, name, streak) values ('demo-user', 'Demo User', 3) on conflict do nothing;
insert into subjects (id, name, description, order_index) values
('math', 'Mathematics', 'Core quantitative reasoning', 1),
('science', 'Science', 'Foundational scientific thinking', 2)
on conflict do nothing;
insert into topics (id, subject_id, name, description, order_index) values
('math-1', 'math', 'Algebra Basics', 'Variables, equations, and simplification', 1),
('math-2', 'math', 'Functions', 'Linear and nonlinear functions', 2),
('science-1', 'science', 'Physics Basics', 'Motion, force, and energy', 1)
on conflict do nothing;
insert into progress (user_id, topic_id, mastery_score, completed, attempts) values
('demo-user', 'math-1', 90, true, 2),
('demo-user', 'math-2', 60, false, 1)
on conflict do nothing;
