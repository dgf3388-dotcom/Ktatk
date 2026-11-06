-- قطعتك: مخطط قاعدة البيانات (Supabase). نفّذه كاملاً في SQL Editor.
create extension if not exists pgcrypto;
create sequence if not exists part_request_seq start 1001;

create table if not exists public.part_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique not null,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (phone ~ '^05[0-9]{8}$'),
  city text not null check (char_length(city) between 2 and 60),
  car_make text not null check (char_length(car_make) between 1 and 60),
  car_model text not null check (char_length(car_model) between 1 and 60),
  car_year int not null check (car_year between 1950 and 2100),
  car_trim text check (char_length(car_trim) <= 60),
  engine text check (char_length(engine) <= 60),
  vin text check (vin is null or vin = '' or vin ~ '^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$'),
  part_name text not null check (char_length(part_name) between 2 and 150),
  part_number text check (char_length(part_number) <= 60),
  part_condition text not null default 'any' check (part_condition in ('new','used','any')),
  part_type text not null default 'any' check (part_type in ('original','aftermarket','any')),
  description text check (char_length(description) <= 2000),
  image_paths text[] not null default '{}' check (array_length(image_paths,1) is null or array_length(image_paths,1) <= 6),
  contact_method text not null default 'whatsapp' check (contact_method in ('whatsapp','call','sms')),
  status text not null default 'new' check (status in ('new','searching','found','quote_sent','awaiting_customer','agreed','purchased','shipped','completed','unavailable')),
  internal_notes text,
  suggested_price numeric(10,2),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists part_requests_created_idx on public.part_requests (created_at desc);
create index if not exists part_requests_status_idx on public.part_requests (status);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_touch on public.part_requests;
create trigger trg_touch before update on public.part_requests
  for each row execute function public.touch_updated_at();

-- الإرسال العام الوحيد: دالة تُرجع رقم الطلب فقط، دون أي قراءة للبيانات
create or replace function public.submit_part_request(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_num text; v_paths text[];
begin
  v_id := coalesce((p->>'id')::uuid, gen_random_uuid());
  v_num := 'QT-' || to_char(now(),'YY') || '-' || lpad(nextval('part_request_seq')::text, 6, '0');
  select coalesce(array_agg(x), '{}') into v_paths from jsonb_array_elements_text(coalesce(p->'image_paths','[]'::jsonb)) x
   where x like v_id::text || '/%';
  insert into public.part_requests (id, request_number, customer_name, phone, city, car_make, car_model, car_year,
    car_trim, engine, vin, part_name, part_number, part_condition, part_type, description, image_paths, contact_method)
  values (v_id, v_num, trim(p->>'customer_name'), p->>'phone', trim(p->>'city'), trim(p->>'car_make'), trim(p->>'car_model'),
    (p->>'car_year')::int, nullif(trim(p->>'car_trim'),''), nullif(trim(p->>'engine'),''), nullif(upper(trim(p->>'vin')),''),
    trim(p->>'part_name'), nullif(trim(p->>'part_number'),''), coalesce(p->>'part_condition','any'), coalesce(p->>'part_type','any'),
    nullif(trim(p->>'description'),''), v_paths, coalesce(p->>'contact_method','whatsapp'));
  return v_num;
end $$;
revoke all on function public.submit_part_request(jsonb) from public;
grant execute on function public.submit_part_request(jsonb) to anon, authenticated;

-- RLS
alter table public.part_requests enable row level security;
alter table public.admins enable row level security;
drop policy if exists admin_select on public.part_requests;
drop policy if exists admin_update on public.part_requests;
create policy admin_select on public.part_requests for select to authenticated using (public.is_admin());
create policy admin_update on public.part_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());
-- لا توجد أي سياسة للزوار (anon) على الجدول: لا قراءة ولا كتابة مباشرة.

-- التخزين: حاوية خاصة، الزوار يرفعون فقط، والإدارة تقرأ
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('request-images','request-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "visitors upload request images" on storage.objects;
drop policy if exists "admins read request images" on storage.objects;
create policy "visitors upload request images" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'request-images');
create policy "admins read request images" on storage.objects for select to authenticated
  using (bucket_id = 'request-images' and public.is_admin());

-- بعد إنشاء مستخدم الإدارة من Authentication > Users، فعّله مرة واحدة:
-- insert into public.admins (user_id) select id from auth.users where email = 'ADMIN_EMAIL_HERE';
