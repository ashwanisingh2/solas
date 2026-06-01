create table if not exists profiles (
  id text primary key,
  name text not null,
  streak integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists subjects (
  id text primary key,
  name text not null,
  description text not null,
  order_index integer not null
);

create table if not exists topics (
  id text primary key,
  subject_id text not null references subjects(id) on delete cascade,
  name text not null,
  description text not null,
  order_index integer not null
);

create table if not exists progress (
  user_id text not null references profiles(id) on delete cascade,
  topic_id text not null references topics(id) on delete cascade,
  mastery_score integer not null default 0,
  completed boolean not null default false,
  attempts integer not null default 0,
  primary key (user_id, topic_id)
);
