-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  city text,
  avatar_url text,
  elo_rating integer default 1000 not null,
  is_pro boolean default false not null,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  board_theme jsonb default '{"lightCell":"#c8a96e","darkCell":"#1a3a50","pieceRed":"#c1121f","pieceBlue":"#669bbc"}'::jsonb,
  ui_theme text default 'default',
  puzzle_streak integer default 0,
  last_puzzle_date date,
  games_won integer default 0,
  games_lost integer default 0,
  games_drawn integer default 0,
  created_at timestamptz default now()
);

-- Games
create table public.games (
  id uuid default uuid_generate_v4() primary key,
  player1_id uuid references public.profiles(id) on delete set null,
  player2_id uuid references public.profiles(id) on delete set null,
  winner_id uuid references public.profiles(id) on delete set null,
  game_type text not null check (game_type in ('ai', 'multiplayer', 'puzzle', 'local')),
  ai_difficulty text check (ai_difficulty in ('easy', 'normal', 'arman')),
  moves jsonb default '[]'::jsonb,
  ai_analysis jsonb,
  total_moves integer default 0,
  created_at timestamptz default now(),
  ended_at timestamptz
);

-- Multiplayer rooms
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  room_code text unique not null,
  player1_id uuid references public.profiles(id) on delete cascade,
  player2_id uuid references public.profiles(id) on delete set null,
  status text default 'waiting' check (status in ('waiting', 'playing', 'finished', 'abandoned')),
  board_state jsonb,
  current_turn text default 'red',
  last_move jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Puzzles
create table public.puzzles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'grandmaster')),
  board_state jsonb not null,
  solution_moves jsonb not null,
  is_daily boolean default false,
  daily_date date,
  created_by text default 'system',
  hint1 text,
  hint2 text,
  hint3 text,
  created_at timestamptz default now()
);

-- Puzzle completions
create table public.puzzle_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  puzzle_id uuid references public.puzzles(id) on delete cascade,
  time_seconds integer not null,
  hints_used integer default 0,
  score integer not null,
  completed_at timestamptz default now(),
  unique(user_id, puzzle_id)
);

-- ELO history
create table public.elo_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  rating_before integer not null,
  rating_after integer not null,
  delta integer not null,
  opponent_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.rooms enable row level security;
alter table public.puzzles enable row level security;
alter table public.puzzle_completions enable row level security;
alter table public.elo_history enable row level security;

-- Profiles: users can read all, only update own
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Games: readable by all
create policy "games_read_all" on public.games for select using (true);
create policy "games_insert_auth" on public.games for insert with check (auth.uid() is not null);
create policy "games_update_own" on public.games for update using (auth.uid() = player1_id or auth.uid() = player2_id);

-- Rooms: readable by all
create policy "rooms_read_all" on public.rooms for select using (true);
create policy "rooms_insert_auth" on public.rooms for insert with check (auth.uid() is not null);
create policy "rooms_update_players" on public.rooms for update using (auth.uid() = player1_id or auth.uid() = player2_id);

-- Puzzles: readable by all
create policy "puzzles_read_all" on public.puzzles for select using (true);

-- Puzzle completions: own only
create policy "pc_read_own" on public.puzzle_completions for select using (auth.uid() = user_id);
create policy "pc_insert_own" on public.puzzle_completions for insert with check (auth.uid() = user_id);
create policy "pc_update_own" on public.puzzle_completions for update using (auth.uid() = user_id);

-- ELO: readable by all
create policy "elo_read_all" on public.elo_history for select using (true);
create policy "elo_insert_auth" on public.elo_history for insert with check (auth.uid() is not null);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Leaderboard view
create or replace view public.leaderboard as
select
  p.id,
  p.username,
  p.city,
  p.elo_rating,
  p.games_won,
  p.games_lost,
  p.games_drawn,
  (p.games_won + p.games_lost + p.games_drawn) as total_games,
  rank() over (order by p.elo_rating desc) as global_rank
from public.profiles p
where (p.games_won + p.games_lost + p.games_drawn) > 0
order by p.elo_rating desc;
