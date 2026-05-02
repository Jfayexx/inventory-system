create table items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text unique not null,
  threshold int default 0,
  created_at timestamp default now()
);

create table stock_in (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id),
  quantity int not null,
  supplier text,
  reference text,
  date timestamp default now()
);

create table stock_out (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id),
  quantity int not null,
  reason text,
  reference text,
  date timestamp default now()
);

create table sales (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id),
  campaign text,
  units_sold int,
  revenue numeric,
  date timestamp default now()
);