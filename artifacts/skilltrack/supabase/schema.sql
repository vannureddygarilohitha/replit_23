-- SkillTrack schema for Supabase.
-- Run this file once in the Supabase SQL Editor. All app tables are tenant
-- scoped to the signed-in Supabase user and protected by row-level security.

create table if not exists public.skilltrack_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'HR Admin',
  phone text not null default '',
  location text not null default '',
  organization_name text not null default 'My organization',
  demo_seeded boolean not null default false,
  notifications jsonb not null default '{"certificationExpiry":true,"trainingReminders":true,"skillGapAlerts":true,"weeklySummary":false}'::jsonb,
  training_preferences jsonb not null default '{"reminderDaysBeforeDue":7,"defaultCourseVisibility":"all"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id text not null,
  full_name text not null,
  email text not null,
  phone text not null default '',
  department text not null,
  job_role text not null,
  joining_date date not null,
  manager text not null default '',
  location text not null default '',
  status text not null default 'Active' check (status in ('Active', 'On leave', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, employee_id),
  unique (user_id, id)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Technical', 'Soft Skill', 'Leadership', 'Domain', 'Tools', 'Management')),
  description text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, name),
  unique (user_id, id)
);

create table if not exists public.employee_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id uuid not null,
  skill_id uuid not null,
  level text not null check (level in ('Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert')),
  proficiency integer not null default 0 check (proficiency between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, employee_id, skill_id),
  foreign key (user_id, employee_id) references public.employees(user_id, id) on delete cascade,
  foreign key (user_id, skill_id) references public.skills(user_id, id) on delete cascade
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id uuid not null,
  name text not null,
  provider text not null,
  issue_date date not null,
  expiry_date date not null,
  created_at timestamptz not null default now(),
  foreign key (user_id, employee_id) references public.employees(user_id, id) on delete cascade
);

create table if not exists public.training_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  instructor text not null default '',
  duration text not null default '',
  category text not null check (category in ('Technical', 'Soft Skill', 'Leadership', 'Domain', 'Tools', 'Management')),
  required_skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, name),
  unique (user_id, id)
);

create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id uuid not null,
  course_id uuid not null,
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date not null,
  status text not null default 'Not started' check (status in ('Not started', 'In progress', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, employee_id, course_id),
  foreign key (user_id, employee_id) references public.employees(user_id, id) on delete cascade,
  foreign key (user_id, course_id) references public.training_courses(user_id, id) on delete cascade
);

create table if not exists public.skill_gaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id uuid not null,
  skill_id uuid not null,
  current_level text not null check (current_level in ('Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert')),
  required_level text not null check (required_level in ('Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert')),
  priority text not null check (priority in ('Critical', 'High', 'Medium', 'Low')),
  recommended_course text not null default '',
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, employee_id, skill_id),
  foreign key (user_id, employee_id) references public.employees(user_id, id) on delete cascade,
  foreign key (user_id, skill_id) references public.skills(user_id, id) on delete cascade
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  message text not null,
  type text not null check (type in ('certification', 'training', 'skill-gap', 'skill')),
  created_at timestamptz not null default now()
);

create index if not exists employees_user_department_idx on public.employees(user_id, department);
create index if not exists certifications_user_expiry_idx on public.certifications(user_id, expiry_date);
create index if not exists enrollments_user_due_date_idx on public.training_enrollments(user_id, due_date);
create index if not exists gaps_user_priority_idx on public.skill_gaps(user_id, priority);
create index if not exists activities_user_created_idx on public.activities(user_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'skilltrack_profiles',
    'employees',
    'skills',
    'employee_skills',
    'certifications',
    'training_courses',
    'training_enrollments',
    'skill_gaps',
    'activities'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists skilltrack_owner_access on public.%I', table_name);
    execute format(
      'create policy skilltrack_owner_access on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      table_name
    );
  end loop;
end $$;

create or replace function public.seed_skilltrack_demo()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then
    raise exception 'Sign in before initializing a SkillTrack workspace.';
  end if;
  insert into public.skilltrack_profiles (user_id, display_name, organization_name)
  values (
    owner_id,
    coalesce(auth.jwt() -> 'user_metadata' ->> 'display_name', 'HR Admin'),
    coalesce(auth.jwt() -> 'user_metadata' ->> 'organization_name', 'Northstar')
  )
  on conflict (user_id) do nothing;

  if exists (
    select 1 from public.skilltrack_profiles
    where user_id = owner_id and demo_seeded
  ) then
    return;
  end if;

  insert into public.employees
    (user_id, employee_id, full_name, email, phone, department, job_role, joining_date, manager, location, status)
  values
    (owner_id, 'EMP001', 'Ananya Sharma', 'ananya.sharma@northstar.io', '+91 98765 41021', 'Engineering', 'Frontend Developer', '2022-03-14', 'Vikram Desai', 'Bengaluru', 'Active'),
    (owner_id, 'EMP002', 'Rahul Kumar', 'rahul.kumar@northstar.io', '+91 98765 41022', 'Engineering', 'Backend Developer', '2021-08-09', 'Vikram Desai', 'Hyderabad', 'Active'),
    (owner_id, 'EMP003', 'Priya Reddy', 'priya.reddy@northstar.io', '+91 98765 41023', 'People & Culture', 'HR Specialist', '2023-01-23', 'Meera Iyer', 'Hyderabad', 'Active'),
    (owner_id, 'EMP004', 'Arjun Mehta', 'arjun.mehta@northstar.io', '+91 98765 41024', 'Engineering', 'Data Analyst', '2022-11-07', 'Nikhil Rao', 'Pune', 'Active'),
    (owner_id, 'EMP005', 'Sneha Rao', 'sneha.rao@northstar.io', '+91 98765 41025', 'Marketing', 'Marketing Executive', '2024-02-19', 'Kavya Nair', 'Bengaluru', 'Active'),
    (owner_id, 'EMP006', 'Vikram Desai', 'vikram.desai@northstar.io', '+91 98765 41026', 'Engineering', 'Engineering Manager', '2020-05-11', 'Nikhil Rao', 'Bengaluru', 'Active'),
    (owner_id, 'EMP007', 'Kavya Nair', 'kavya.nair@northstar.io', '+91 98765 41027', 'Marketing', 'Growth Lead', '2021-04-26', 'Meera Iyer', 'Mumbai', 'Active'),
    (owner_id, 'EMP008', 'Rohan Kapoor', 'rohan.kapoor@northstar.io', '+91 98765 41028', 'Finance', 'Financial Analyst', '2023-07-17', 'Nikhil Rao', 'Pune', 'Active'),
    (owner_id, 'EMP009', 'Meera Iyer', 'meera.iyer@northstar.io', '+91 98765 41029', 'People & Culture', 'People Operations Lead', '2019-10-03', 'Nikhil Rao', 'Bengaluru', 'Active'),
    (owner_id, 'EMP010', 'Aditya Joshi', 'aditya.joshi@northstar.io', '+91 98765 41030', 'Operations', 'Operations Specialist', '2022-01-31', 'Nikhil Rao', 'Chennai', 'Active'),
    (owner_id, 'EMP011', 'Neha Bansal', 'neha.bansal@northstar.io', '+91 98765 41031', 'Finance', 'Finance Manager', '2020-09-14', 'Nikhil Rao', 'Hyderabad', 'On leave'),
    (owner_id, 'EMP012', 'Karan Malhotra', 'karan.malhotra@northstar.io', '+91 98765 41032', 'Operations', 'Security Engineer', '2023-04-10', 'Vikram Desai', 'Bengaluru', 'Active');

  insert into public.skills (user_id, name, category, description)
  values
    (owner_id, 'React', 'Technical', 'Building responsive interfaces with React.'),
    (owner_id, 'TypeScript', 'Technical', 'Typed JavaScript development and application design.'),
    (owner_id, 'Python', 'Technical', 'Python programming for services, automation and analytics.'),
    (owner_id, 'Data Analytics', 'Technical', 'Turning business data into useful insights.'),
    (owner_id, 'Cloud Computing', 'Technical', 'Designing and operating secure cloud services.'),
    (owner_id, 'SQL', 'Technical', 'Querying and modeling relational data.'),
    (owner_id, 'AWS', 'Tools', 'Working with core Amazon Web Services.'),
    (owner_id, 'Communication', 'Soft Skill', 'Clear written, verbal and cross-team communication.'),
    (owner_id, 'Leadership', 'Leadership', 'Coaching teams and setting a shared direction.'),
    (owner_id, 'Project Management', 'Management', 'Planning delivery, risks and stakeholder alignment.'),
    (owner_id, 'Cybersecurity', 'Domain', 'Protecting systems, data and business operations.'),
    (owner_id, 'UX Research', 'Domain', 'Research methods for understanding user needs.')
  on conflict (user_id, name) do nothing;

  insert into public.training_courses (user_id, name, description, instructor, duration, category, required_skills)
  values
    (owner_id, 'React Advanced Development', 'Patterns for scalable, accessible React applications.', 'Northstar Engineering', '6 weeks', 'Technical', array['React', 'TypeScript']),
    (owner_id, 'AWS Solutions Architect Fundamentals', 'Core cloud architecture, security and cost principles.', 'Learning Hub', '8 weeks', 'Technical', array['Cloud Computing', 'AWS']),
    (owner_id, 'Advanced Python for Data Professionals', 'Production Python patterns for modern analytics teams.', 'Data Guild', '5 weeks', 'Technical', array['Python', 'Data Analytics']),
    (owner_id, 'Leadership Essentials', 'Build the habits that help teams do their best work.', 'People & Culture', '4 weeks', 'Leadership', array['Leadership', 'Communication']),
    (owner_id, 'Effective Communication', 'Practical communication skills for distributed teams.', 'Learning Hub', '3 weeks', 'Soft Skill', array['Communication']),
    (owner_id, 'Cybersecurity Awareness', 'Everyday security practices for modern workplaces.', 'Security Office', '2 weeks', 'Domain', array['Cybersecurity'])
  on conflict (user_id, name) do nothing;

  insert into public.employee_skills (user_id, employee_id, skill_id, level, proficiency)
  select owner_id, e.id, s.id, seed.level, seed.proficiency
  from (values
    ('EMP001', 'React', 'Advanced', 92),
    ('EMP001', 'TypeScript', 'Intermediate', 72),
    ('EMP001', 'Communication', 'Advanced', 85),
    ('EMP002', 'Python', 'Advanced', 88),
    ('EMP002', 'SQL', 'Advanced', 86),
    ('EMP002', 'Cloud Computing', 'Basic', 42),
    ('EMP003', 'Communication', 'Advanced', 91),
    ('EMP003', 'Leadership', 'Intermediate', 64),
    ('EMP004', 'Python', 'Advanced', 89),
    ('EMP004', 'Data Analytics', 'Advanced', 93),
    ('EMP004', 'SQL', 'Advanced', 87),
    ('EMP005', 'Communication', 'Advanced', 84),
    ('EMP005', 'Data Analytics', 'Intermediate', 70),
    ('EMP006', 'Leadership', 'Expert', 96),
    ('EMP006', 'Cloud Computing', 'Advanced', 88),
    ('EMP007', 'Data Analytics', 'Advanced', 83),
    ('EMP007', 'Leadership', 'Advanced', 85),
    ('EMP008', 'Data Analytics', 'Intermediate', 74),
    ('EMP008', 'SQL', 'Intermediate', 68),
    ('EMP008', 'Python', 'Basic', 48),
    ('EMP009', 'Leadership', 'Expert', 94),
    ('EMP009', 'Communication', 'Expert', 97),
    ('EMP010', 'Project Management', 'Advanced', 82),
    ('EMP011', 'Data Analytics', 'Advanced', 87),
    ('EMP011', 'Leadership', 'Advanced', 83),
    ('EMP012', 'Cybersecurity', 'Advanced', 91),
    ('EMP012', 'Cloud Computing', 'Intermediate', 70)
  ) as seed(employee_code, skill_name, level, proficiency)
  join public.employees e on e.user_id = owner_id and e.employee_id = seed.employee_code
  join public.skills s on s.user_id = owner_id and s.name = seed.skill_name
  on conflict (user_id, employee_id, skill_id) do nothing;

  insert into public.certifications (user_id, employee_id, name, provider, issue_date, expiry_date)
  select owner_id, e.id, seed.name, seed.provider, current_date - seed.issued_days, current_date + seed.expires_days
  from (values
    ('EMP001', 'Google Data Analytics', 'Google', 335, 28),
    ('EMP002', 'AWS Cloud Practitioner', 'Amazon Web Services', 351, 14),
    ('EMP004', 'Microsoft Azure Fundamentals', 'Microsoft', 302, 45),
    ('EMP006', 'AWS Solutions Architect', 'Amazon Web Services', 726, -5),
    ('EMP012', 'CompTIA Security+', 'CompTIA', 480, 251),
    ('EMP003', 'SHRM Certified Professional', 'SHRM', 200, 165),
    ('EMP007', 'Google Analytics Certification', 'Google', 400, 330),
    ('EMP008', 'Microsoft Power BI Data Analyst', 'Microsoft', 500, 130),
    ('EMP005', 'HubSpot Content Marketing', 'HubSpot', 405, 19),
    ('EMP011', 'CFA Investment Foundations', 'CFA Institute', 700, -21),
    ('EMP009', 'SHRM Senior Certified Professional', 'SHRM', 680, 425)
  ) as seed(employee_code, name, provider, issued_days, expires_days)
  join public.employees e on e.user_id = owner_id and e.employee_id = seed.employee_code;

  insert into public.training_enrollments (user_id, employee_id, course_id, progress, due_date, status)
  select owner_id, e.id, c.id, seed.progress, current_date + seed.due_days, seed.status
  from (values
    ('EMP001', 'React Advanced Development', 72, 18, 'In progress'),
    ('EMP002', 'AWS Solutions Architect Fundamentals', 35, 24, 'In progress'),
    ('EMP003', 'Leadership Essentials', 100, -8, 'Completed'),
    ('EMP004', 'Advanced Python for Data Professionals', 54, 12, 'In progress'),
    ('EMP005', 'Effective Communication', 100, -14, 'Completed'),
    ('EMP008', 'Advanced Python for Data Professionals', 20, -3, 'In progress'),
    ('EMP010', 'Cybersecurity Awareness', 0, 8, 'Not started'),
    ('EMP012', 'Cybersecurity Awareness', 82, 10, 'In progress'),
    ('EMP007', 'Leadership Essentials', 100, -5, 'Completed')
  ) as seed(employee_code, course_name, progress, due_days, status)
  join public.employees e on e.user_id = owner_id and e.employee_id = seed.employee_code
  join public.training_courses c on c.user_id = owner_id and c.name = seed.course_name
  on conflict (user_id, employee_id, course_id) do nothing;

  insert into public.skill_gaps (user_id, employee_id, skill_id, current_level, required_level, priority, recommended_course, resolved)
  select owner_id, e.id, s.id, seed.current_level, seed.required_level, seed.priority, seed.recommended_course, seed.resolved
  from (values
    ('EMP002', 'Cloud Computing', 'Basic', 'Advanced', 'Critical', 'AWS Solutions Architect Fundamentals', false),
    ('EMP001', 'TypeScript', 'Intermediate', 'Advanced', 'High', 'React Advanced Development', false),
    ('EMP008', 'Python', 'Basic', 'Intermediate', 'High', 'Advanced Python for Data Professionals', false),
    ('EMP003', 'Leadership', 'Intermediate', 'Advanced', 'Medium', 'Leadership Essentials', false),
    ('EMP010', 'Communication', 'Intermediate', 'Advanced', 'Medium', 'Effective Communication', false),
    ('EMP012', 'Cloud Computing', 'Intermediate', 'Advanced', 'Low', 'AWS Solutions Architect Fundamentals', true)
  ) as seed(employee_code, skill_name, current_level, required_level, priority, recommended_course, resolved)
  join public.employees e on e.user_id = owner_id and e.employee_id = seed.employee_code
  join public.skills s on s.user_id = owner_id and s.name = seed.skill_name
  on conflict (user_id, employee_id, skill_id) do nothing;

  insert into public.activities (user_id, employee_id, message, type, created_at)
  select owner_id, e.id, seed.message, seed.type, now() - make_interval(mins => seed.minutes_ago)
  from (values
    ('EMP001', 'Ananya completed React Advanced certification', 'certification', 25),
    ('EMP002', 'Rahul enrolled in AWS Cloud Fundamentals', 'training', 120),
    ('EMP003', 'Priya''s leadership skill gap was updated', 'skill-gap', 300),
    ('EMP004', 'Arjun completed Leadership Essentials training', 'training', 1440),
    ('EMP005', 'Sneha''s Google certification expires soon', 'certification', 2880)
  ) as seed(employee_code, message, type, minutes_ago)
  join public.employees e on e.user_id = owner_id and e.employee_id = seed.employee_code;

  update public.skilltrack_profiles
  set demo_seeded = true, updated_at = now()
  where user_id = owner_id;
end;
$$;

revoke all on function public.seed_skilltrack_demo() from public;
grant execute on function public.seed_skilltrack_demo() to authenticated;

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.skilltrack_profiles,
  public.employees,
  public.skills,
  public.employee_skills,
  public.certifications,
  public.training_courses,
  public.training_enrollments,
  public.skill_gaps,
  public.activities
to authenticated;
