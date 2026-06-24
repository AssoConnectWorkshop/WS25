create table tombolas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  ticket_price int not null default 0,
  draw_date timestamptz,
  status text not null default 'open' check (status in ('open', 'closed', 'drawn')),
  created_at timestamptz default now()
);

alter table tombolas enable row level security;
create policy "public read" on tombolas for select using (true);
create policy "public insert" on tombolas for insert with check (true);
create policy "public update" on tombolas for update using (true);

create table lots (
  id uuid primary key default gen_random_uuid(),
  tombola_id uuid not null references tombolas(id) on delete cascade,
  name text not null,
  photo_url text,
  position int not null default 0,
  created_at timestamptz default now()
);

alter table lots enable row level security;
create policy "public read" on lots for select using (true);
create policy "public insert" on lots for insert with check (true);
create policy "public update" on lots for update using (true);
create policy "public delete" on lots for delete using (true);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  tombola_id uuid not null references tombolas(id) on delete cascade,
  number int not null,
  participant_name text not null,
  participant_email text not null,
  lot_id uuid references lots(id),
  created_at timestamptz default now(),
  unique(tombola_id, number)
);

alter table tickets enable row level security;
create policy "public read" on tickets for select using (true);
create policy "public insert" on tickets for insert with check (true);
create policy "public update" on tickets for update using (true);
