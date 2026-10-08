import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import {
  Activity,
  Award,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  GraduationCap,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Target,
  UserPlus,
  Users,
  X,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { LoginPage } from '@/pages/login-page';
import {
  saveEmployee,
  deleteEmployee,
  saveSkill,
  saveCertification,
  renewCertification,
  saveCourse,
  updateEnrollment,
  enrollEmployee,
  updateEmployeeSkill,
  resolveGap,
  saveSettings,
} from '@/lib/data';
import { logoutUser } from '@/lib/auth-service';
import type { AppSettings, CertificationInput, CourseInput, EmployeeInput, SkillInput, SkillLevel } from '@/lib/types';
import { useWorkspace } from '@/lib/use-workspace';
import { exportCsv, exportJson } from '@/lib/export-utils';

type AnyRow = Record<string, any>;
const arr = (d: AnyRow | null, ...keys: string[]): AnyRow[] => {
  for (const k of keys) if (Array.isArray(d?.[k])) return d[k];
  return [];
};
const nameOf = (e: AnyRow) => e.fullName || e.name || 'Unnamed';
const initials = (s: string) =>
  s
    .split(/\s+/)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';
const dateText = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
const pct = (n: any) => `${Math.round(Number(n) || 0)}%`;
const levelPercent = (level: any) =>
  typeof level === 'number'
    ? level * 20
    : ({ Beginner: 20, Basic: 35, Intermediate: 60, Advanced: 80, Expert: 100 } as Record<string, number>)[
        String(level)
      ] || 0;

function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        <div className="mb-2 text-[10px] font-mono font-bold uppercase tracking-[.18em] text-[#F26207]">
          {eyebrow}
        </div>
        <h1 className="font-[Manrope] text-[29px] font-extrabold leading-tight tracking-[-.045em] text-white md:text-[34px]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-300">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Button({
  children,
  onClick,
  secondary = false,
  testId,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  testId?: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`dynamic-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-[10px] text-[12px] font-bold cursor-pointer ${
        secondary
          ? 'border border-white/15 bg-slate-800/90 text-slate-200 hover:bg-slate-750 hover:border-orange-500/30 hover:text-white'
          : 'btn-primary-orange text-white shadow-[0_5px_18px_rgba(242,98,7,.3)]'
      }`}
    >
      {children}
    </button>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`dynamic-box rounded-2xl border border-white/10 bg-slate-900/85 backdrop-blur-xl shadow-xl text-slate-100 ${className}`}
    >
      {children}
    </section>
  );
}

function Empty({ label, onAdd }: { label: string; onAdd?: () => void }) {
  return (
    <div className="grid min-h-[230px] place-items-center p-7 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/15 border border-orange-500/30 text-[#F26207] shadow-[0_0_15px_rgba(242,98,7,0.2)]">
          <Sparkles size={19} />
        </div>
        <div className="text-sm font-bold text-white">A clear slate</div>
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">{label}</p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="dynamic-btn mt-4 text-xs font-bold text-[#F26207] hover:text-orange-300 underline cursor-pointer"
          >
            Add the first record
          </button>
        )}
      </div>
    </div>
  );
}

function TableEmpty({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center text-sm text-slate-400">
        {text}
      </td>
    </tr>
  );
}

function StatusBadge({ value }: { value: string }) {
  const v = value.toLowerCase();
  const cls =
    v.includes('active') || v.includes('complete') || v.includes('valid') || v.includes('current')
      ? 'bg-orange-500/15 text-orange-300 border border-orange-500/35 shadow-[0_0_8px_rgba(242,98,7,0.2)]'
      : v.includes('progress')
      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
      : v.includes('expir') || v.includes('due') || v.includes('leave')
      ? 'bg-orange-600/20 text-orange-200 border border-orange-600/40 shadow-[0_0_8px_rgba(234,88,12,0.2)]'
      : v.includes('critical') || v.includes('high')
      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
      : 'bg-slate-800 text-slate-400 border border-white/10';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${cls}`}>
      {value}
    </span>
  );
}

function RecordDialog({
  kind,
  initial,
  close,
  data,
  refresh,
}: {
  kind: string;
  initial?: AnyRow;
  close: () => void;
  data: AnyRow | null;
  refresh: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<AnyRow>(() => {
    if (initial) return { ...initial };
    if (kind === 'employee') {
      const emps = arr(data, 'employees', 'people');
      return {
        fullName: '',
        employeeId: `ST-${String(emps.length + 1).padStart(3, '0')}`,
        email: '',
        phone: '+1 (555) 234-5678',
        department: 'Engineering',
        jobRole: 'Software Engineer',
        manager: 'Avery Morgan',
        location: 'San Francisco, CA (Hybrid)',
        status: 'Active',
        joiningDate: new Date().toISOString().slice(0, 10),
      };
    }
    if (kind === 'certification') {
      const emps = arr(data, 'employees', 'people');
      return {
        name: '',
        provider: 'AWS / Cloud Academy',
        employeeId: emps[0]?.id || emps[0]?.employeeId || '',
        issueDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      };
    }
    if (kind === 'course') {
      return {
        name: '',
        instructor: 'Avery Morgan',
        duration: '4 weeks (self-paced)',
        category: 'Technical',
        requiredSkillsText: 'JavaScript, Problem Solving',
        description: '',
      };
    }
    if (kind === 'skill') {
      return {
        name: '',
        category: 'Technical',
        description: '',
      };
    }
    return {};
  });
  const update = (key: string, value: any) => setForm((prev: AnyRow) => ({ ...prev, [key]: value }));

  const field = (key: string, label: string, placeholder = '') => (
    <label className="block text-[11px] font-bold text-slate-300">
      {label}
      <input
        data-testid={`input-${key}`}
        value={form[key] ?? ''}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-[13px] font-normal text-white placeholder:text-slate-500 outline-none focus:border-[#F26207] focus:ring-2 focus:ring-orange-500/20"
      />
    </label>
  );

  const select = (key: string, label: string, options: string[]) => (
    <label className="block text-[11px] font-bold text-slate-300">
      {label}
      <select
        data-testid={`select-${key}`}
        value={form[key] ?? ''}
        onChange={(e) => update(key, e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
      >
        <option value="" className="bg-slate-900">Select…</option>
        {options.map((x) => (
          <option key={x} className="bg-slate-900">{x}</option>
        ))}
      </select>
    </label>
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (kind === 'employee') await saveEmployee({ ...form, status: form.status || 'Active' } as EmployeeInput);
      else if (kind === 'skill') await saveSkill({ ...form, description: form.description || '' } as SkillInput);
      else if (kind === 'certification') await saveCertification(form as CertificationInput);
      else if (kind === 'course') {
        const { requiredSkillsText, ...courseForm } = form;
        await saveCourse({
          ...courseForm,
          requiredSkills:
            typeof requiredSkillsText === 'string'
              ? requiredSkillsText.split(',').map((x: string) => x.trim()).filter(Boolean)
              : form.requiredSkills || [],
        } as CourseInput);
      } else if (kind === 'settings') await saveSettings(form as AppSettings);

      toast.success(`${kind[0].toUpperCase() + kind.slice(1)} saved successfully`);
      await refresh();
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setBusy(false);
    }
  };

  const title = `${initial ? 'Edit' : 'Add'} ${kind}`;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <form
        onSubmit={submit}
        className="max-h-[90dvh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl text-slate-100"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[.17em] text-[#F26207]">
              Workspace record
            </div>
            <h2 className="mt-1 font-[Manrope] text-xl font-extrabold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {kind === 'employee' && (
            <>
              {field('fullName', 'Full name', 'e.g. Sam Rivera')}
              {field('employeeId', 'Employee ID', 'ST-014')}
              {field('email', 'Work email', 'name@company.com')}
              {field('phone', 'Phone number')}
              {field('department', 'Department', 'Product')}
              {field('jobRole', 'Job role', 'Senior analyst')}
              {field('manager', 'Manager')}
              {field('location', 'Location')}
              {select('status', 'Status', ['Active', 'On leave', 'Inactive'])}
              {field('joiningDate', 'Joining date', 'YYYY-MM-DD')}
            </>
          )}
          {kind === 'skill' && (
            <>
              {field('name', 'Skill name')}
              {select('category', 'Category', [
                'Technical',
                'Soft Skill',
                'Leadership',
                'Domain',
                'Tools',
                'Management',
              ])}
              <label className="col-span-full block text-[11px] font-bold text-slate-300">
                Description
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 p-3 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
                />
              </label>
            </>
          )}
          {kind === 'certification' && (
            <>
              {field('name', 'Certification name', 'e.g. AWS Certified Solutions Architect')}
              {field('provider', 'Issuing provider', 'e.g. Amazon Web Services')}
              <label className="block text-[11px] font-bold text-slate-300">
                Credential holder
                <select
                  data-testid="select-cert-employee"
                  value={form.employeeId ?? ''}
                  onChange={(e) => update('employeeId', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
                >
                  <option value="" className="bg-slate-900">Select an employee…</option>
                  {arr(data, 'employees', 'people').map((emp: any) => (
                    <option key={emp.id ?? emp.employeeId} value={emp.id ?? emp.employeeId} className="bg-slate-900">
                      {nameOf(emp)} · {emp.department || 'General'} ({emp.employeeId || emp.id})
                    </option>
                  ))}
                </select>
              </label>
              {field('issueDate', 'Issue date', 'YYYY-MM-DD')}
              {field('expiryDate', 'Expiry date', 'YYYY-MM-DD')}
            </>
          )}
          {kind === 'course' && (
            <>
              {field('name', 'Course title')}
              {field('instructor', 'Instructor')}
              {field('duration', 'Duration')}
              {select('category', 'Category', [
                'Technical',
                'Soft Skill',
                'Leadership',
                'Domain',
                'Tools',
                'Management',
              ])}
              {field('requiredSkillsText', 'Required skills (comma separated)')}
              <label className="col-span-full block text-[11px] font-bold text-slate-300">
                Description
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 p-3 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
                />
              </label>
            </>
          )}
          {kind === 'settings' && (
            <>
              {field('organizationName', 'Organization name')}
              {field('displayName', 'Your name')}
              {field('email', 'Email')}
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button secondary onClick={close}>Cancel</Button>
          <button
            type="submit"
            disabled={busy}
            className="dynamic-btn rounded-xl btn-primary-orange px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: any;
  note: string;
  icon: any;
  tone: string;
}) {
  const colors: Record<string, string> = {
    orange: 'bg-orange-500/15 text-[#F26207] border border-orange-500/30 shadow-[0_0_15px_rgba(242,98,7,0.25)]',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    blue: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  };
  return (
    <Panel className="p-4 group">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-400">{label}</div>
          <div
            data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}
            className="mt-2 font-[Manrope] text-[31px] font-extrabold leading-none tracking-[-.05em] text-white"
          >
            {value}
          </div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${colors[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 text-[10px] text-slate-400">{note}</div>
    </Panel>
  );
}

function AttentionRow({
  color,
  value,
  label,
  href,
}: {
  color: string;
  value: any;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="dynamic-btn flex items-center gap-3 rounded-xl bg-slate-950/70 border border-white/5 px-3.5 py-3 no-underline hover:bg-slate-950 hover:border-orange-500/40 text-slate-200"
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          color === 'amber'
            ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            : color === 'rose'
            ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]'
            : 'bg-[#F26207] shadow-[0_0_8px_#f26207]'
        }`}
      />
      <span className="font-[Manrope] text-sm font-extrabold text-white">{value}</span>
      <span className="flex-1 text-[11px] text-slate-300">{label}</span>
      <ChevronRight size={14} className="text-slate-500" />
    </Link>
  );
}

function ActivityMark() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500/15 border border-orange-500/30 text-[#F26207]">
      <Activity size={15} />
    </div>
  );
}

function Dashboard({
  data,
  loading,
  error,
  refresh,
}: {
  data: AnyRow | null;
  loading: boolean;
  error: string;
  refresh: () => void;
}) {
  const people = arr(data, 'employees', 'people');
  const skills = arr(data, 'skills');
  const certs = arr(data, 'certifications');
  const courses = arr(data, 'courses');
  const gaps = arr(data, 'skillGaps', 'skillGapsData', 'gaps');
  const activities = arr(data, 'activities');
  const active = people.filter((e) => (e.status || 'Active').toLowerCase() === 'active').length;
  const expiring = certs.filter((c) => {
    const days = (new Date(c.expiryDate || 0).getTime() - Date.now()) / 86400000;
    return days >= 0 && days < 60;
  }).length;

  const [empDialog, setEmpDialog] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState(false);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPanel error={error} retry={refresh} />;

  return (
    <>
      <PageTitle
        eyebrow={`${new Date().toLocaleDateString('en', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })} · corporate intelligence`}
        title="People & skills, in focus."
        subtitle="A clear view of the capabilities your teams have today — and where to invest next."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setEmpDialog(true)}>
              <Plus size={15} /> Add employee
            </Button>
            <Button secondary onClick={() => setEnrollDialog(true)}>
              <GraduationCap size={15} /> Enroll learner
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active people" value={active} note={`${people.length} total profiles`} icon={Users} tone="orange" />
        <Metric label="Skills in library" value={skills.length} note="Across all technical categories" icon={BriefcaseBusiness} tone="blue" />
        <Metric label="Certifications at risk" value={expiring} note="Expiring in next 60 days" icon={Award} tone="amber" />
        <Metric label="Open skill gaps" value={gaps.filter((g) => !g.resolved).length} note="Prioritized development needs" icon={Target} tone="rose" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel className="p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-[Manrope] text-base font-extrabold text-white">Capability snapshot</h2>
              <p className="mt-1 text-xs text-slate-400">A live read on learning across the organization</p>
            </div>
            <span className="rounded-lg bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-orange-300">
              WORKFORCE
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-950/70 border border-white/10 p-4 dynamic-box hover:border-orange-500/40">
              <div className="text-[11px] font-semibold text-slate-400">Course catalogue</div>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-[Manrope] text-3xl font-extrabold text-white">{courses.length}</span>
                <span className="text-[10px] text-slate-400">available courses</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                  style={{ width: `${Math.min(100, courses.length * 8)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-white/10 p-4 dynamic-box hover:border-amber-500/40">
              <div className="text-[11px] font-semibold text-slate-400">Team coverage</div>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-[Manrope] text-3xl font-extrabold text-white">
                  {people.length
                    ? Math.round(((people.length - gaps.filter((g) => !g.resolved).length) / people.length) * 100)
                    : 0}
                  <small className="text-base">%</small>
                </span>
                <span className="text-[10px] text-slate-400">without open gaps</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{
                    width: `${
                      people.length
                        ? Math.max(8, 100 - (gaps.filter((g) => !g.resolved).length / people.length) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-xs text-slate-400">
              <span className="font-bold text-white">{arr(data, 'enrollments').length}</span> learning enrollments currently tracked
            </div>
            <Link href="/analytics" className="dynamic-btn flex items-center gap-1 text-xs font-bold text-[#F26207] hover:text-orange-300 no-underline">
              Explore analytics <ArrowRight size={14} />
            </Link>
          </div>
        </Panel>

        <Panel className="p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-[Manrope] text-base font-extrabold text-white">Needs your attention</h2>
              <p className="mt-1 text-xs text-slate-400">Small actions, meaningful progress</p>
            </div>
            <CircleAlert size={17} className="text-[#F26207]" />
          </div>

          <div className="space-y-2.5">
            <AttentionRow color="amber" value={expiring} label="certifications nearing expiry" href="/certifications" />
            <AttentionRow color="rose" value={gaps.filter((g) => !g.resolved).length} label="priority skill gaps to review" href="/skill-gaps" />
            <AttentionRow
              color="orange"
              value={arr(data, 'enrollments').filter((e) => e.status === 'in_progress' || e.status === 'In progress').length}
              label="learners currently in progress"
              href="/training"
            />
          </div>

          <div className="mt-5 rounded-xl bg-slate-950/70 border border-white/10 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
              <Clock3 size={14} className="text-[#F26207]" />
              <span>Upcoming reviews</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
              {activities.length ? `${activities.length} recent workspace updates to review.` : 'No upcoming review dates have been added yet.'}
            </p>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Panel>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-[Manrope] text-sm font-extrabold text-white">Priority development</h2>
              <p className="mt-1 text-[11px] text-slate-400">Highest priority open gaps</p>
            </div>
            <Link href="/skill-gaps" className="dynamic-btn text-xs font-bold text-[#F26207] hover:text-orange-300 no-underline">
              View all
            </Link>
          </div>
          {gaps.filter((g) => !g.resolved).slice(0, 4).map((g, i) => (
            <div key={g.id ?? i} className="flex items-center gap-3 border-b border-white/5 px-5 py-3 last:border-0 hover:bg-slate-800/40 transition-colors">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#F26207]">
                <Target size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-white">
                  {g.skillName || g.skill?.name || g.name || 'Skill development'}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {g.employeeName || g.fullName || 'Team member'} · {g.priority || 'Priority'} priority
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-500" />
            </div>
          ))}
          {!loading && gaps.filter((g) => !g.resolved).length === 0 && (
            <Empty label="No open skill gaps. Development planning is up to date." />
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-[Manrope] text-sm font-extrabold text-white">Recent activity</h2>
              <p className="mt-1 text-[11px] text-slate-400">Across your people workspace</p>
            </div>
            <ActivityMark />
          </div>
          {activities.slice(0, 4).map((a, i) => (
            <div key={a.id ?? i} className="flex gap-3 border-b border-white/5 px-5 py-3 last:border-0 hover:bg-slate-800/40 transition-colors">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#F26207] shadow-[0_0_8px_#f26207]" />
              <div>
                <div className="text-xs leading-5 text-slate-300">
                  {a.description || a.message || `${a.type || 'Workspace'} updated`}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">{dateText(a.createdAt || a.date || a.timestamp)}</div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <Empty label="Updates will appear here as your team records learning activity." />
          )}
        </Panel>
      </div>
      {empDialog && (
        <RecordDialog
          kind="employee"
          close={() => setEmpDialog(false)}
          data={data}
          refresh={refresh}
        />
      )}
      {enrollDialog && (
        <EnrollLearnerModal
          data={data}
          refresh={refresh}
          close={() => setEnrollDialog(false)}
        />
      )}
    </>
  );
}

function Employees({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const people = arr(data, 'employees', 'people');
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All departments');
  const [status, setStatus] = useState('All statuses');
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<AnyRow | undefined>();

  const departments = Array.from(new Set(people.map((e) => e.department).filter(Boolean)));
  const filtered = people.filter(
    (e) =>
      `${nameOf(e)} ${e.email || ''} ${e.jobRole || ''} ${e.department || ''}`.toLowerCase().includes(query.toLowerCase()) &&
      (dept === 'All departments' || e.department === dept) &&
      (status === 'All statuses' || (e.status || 'Active') === status)
  );

  const remove = async (row: AnyRow) => {
    if (!window.confirm(`Remove ${nameOf(row)} from the directory?`)) return;
    try {
      await deleteEmployee(row.id ?? row.employeeId);
      toast.success('Employee removed');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete employee.');
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="People directory"
        title="Employees"
        subtitle="Find a person, understand their role, and keep their growth plan moving."
        action={
          <div className="flex items-center gap-2">
            <Button
              secondary
              onClick={() => {
                const rows = filtered.map((e) => [
                  e.employeeId || e.id || '',
                  nameOf(e),
                  e.email || '',
                  e.jobRole || '',
                  e.department || '',
                  e.location || '',
                  e.status || 'Active',
                  e.manager || '',
                  e.joiningDate || '',
                ]);
                exportCsv(
                  `skilltrack-employees-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Employee ID', 'Full Name', 'Email', 'Role', 'Department', 'Location', 'Status', 'Manager', 'Joining Date'],
                  rows
                );
                toast.success(`Exported ${filtered.length} employees to CSV`);
              }}
              testId="button-export-employees"
            >
              <Download size={14} /> Export CSV
            </Button>
            <Button onClick={() => setDialog(true)} testId="button-add-employee">
              <Plus size={15} /> Add employee
            </Button>
          </div>
        }
      />
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between bg-slate-950/40">
          <div className="relative flex-1 md:max-w-[380px]">
            <Search size={15} className="absolute left-3 top-3 text-slate-500" />
            <input
              id="workspace-search"
              data-testid="input-search-employees"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, role, or email…"
              className="w-full rounded-xl border border-white/15 bg-slate-950/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#F26207]"
            />
          </div>
          <div className="flex gap-2">
            <select
              data-testid="filter-department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option className="bg-slate-900">All departments</option>
              {departments.map((d: any) => (
                <option key={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
            <select
              data-testid="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option className="bg-slate-900">All statuses</option>
              {['Active', 'On leave', 'Inactive'].map((s) => (
                <option key={s} className="bg-slate-900">{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-950/80 text-[10px] font-mono uppercase tracking-[.12em] text-slate-400 border-b border-white/10">
              <tr>
                {['Employee', 'Department / role', 'Manager', 'Location', 'Status', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((e, i) => (
                <tr
                  key={e.id ?? e.employeeId ?? i}
                  data-testid={`row-employee-${e.id ?? i}`}
                  className="group hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/employees/${e.id ?? e.employeeId}`} className="flex items-center gap-3 no-underline">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-300 shadow-sm">
                        {initials(nameOf(e))}
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-white group-hover:text-orange-300 transition">
                          {nameOf(e)}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          {e.email || e.employeeId || 'No email recorded'}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs font-semibold text-slate-200">{e.department || '—'}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{e.jobRole || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-300">{e.manager || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-300">{e.location || '—'}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge value={e.status || 'Active'} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        aria-label={`Edit ${nameOf(e)}`}
                        onClick={() => {
                          setSelected(e);
                          setDialog(true);
                        }}
                        className="dynamic-btn text-xs font-bold text-[#F26207] hover:text-orange-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        aria-label={`Delete ${nameOf(e)}`}
                        onClick={() => void remove(e)}
                        className="dynamic-btn text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <TableEmpty
                  colSpan={6}
                  text={
                    people.length
                      ? 'No people match those filters. Try broadening your search.'
                      : 'No employee records yet. Add the first person to get started.'
                  }
                />
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-[10px] text-slate-400 bg-slate-950/60 border-t border-white/10 font-mono">
          <span>Showing {filtered.length} of {people.length} people</span>
          <span>DIRECTORY · LIVE TELEMETRY</span>
        </div>
      </Panel>
      {dialog && (
        <RecordDialog
          kind="employee"
          initial={selected}
          close={() => {
            setDialog(false);
            setSelected(undefined);
          }}
          data={data}
          refresh={refresh}
        />
      )}
    </>
  );
}

function SkillProficiencyModal({
  skill,
  data,
  refresh,
  close,
}: {
  skill: AnyRow;
  data: AnyRow | null;
  refresh: () => void;
  close: () => void;
}) {
  const employees = arr(data, 'employees', 'people');
  const allEmployeeSkills = arr(data, 'employeeSkills');
  const proficiencies = allEmployeeSkills.filter(
    (es) => String(es.skillId) === String(skill.id)
  );

  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignLevel, setAssignLevel] = useState<SkillLevel>('Intermediate');
  const [assignScore, setAssignScore] = useState(65);
  const [busy, setBusy] = useState(false);

  // Available employees who do not currently have this skill
  const availableEmployees = employees.filter(
    (emp) => !proficiencies.some((p) => String(p.employeeId) === String(emp.id ?? emp.employeeId))
  );

  const handleLevelChange = async (empId: string, newLevel: SkillLevel, score: number) => {
    try {
      await updateEmployeeSkill(empId, skill.id, newLevel, score);
      toast.success('Proficiency level updated');
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update proficiency');
    }
  };

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignEmpId) {
      toast.error('Please select an employee to assign this skill to');
      return;
    }
    setBusy(true);
    try {
      await updateEmployeeSkill(assignEmpId, skill.id, assignLevel, assignScore);
      const emp = employees.find((e) => String(e.id ?? e.employeeId) === String(assignEmpId));
      toast.success(`Assigned ${skill.name} (${assignLevel}) to ${nameOf(emp || {})}`);
      setAssignEmpId('');
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not assign skill');
    } finally {
      setBusy(false);
    }
  };

  const rubricTiers = [
    {
      level: 'Beginner',
      range: '1–25%',
      badge: 'Level 1',
      score: 25,
      color: 'border-slate-700 bg-slate-850',
      description: 'Foundational concepts. Operates under regular supervision and follows established templates.',
    },
    {
      level: 'Basic',
      range: '26–45%',
      badge: 'Level 2',
      score: 40,
      color: 'border-amber-500/20 bg-amber-500/5',
      description: 'Practical baseline. Handles routine tasks independently and seeks guidance on complex issues.',
    },
    {
      level: 'Intermediate',
      range: '46–70%',
      badge: 'Level 3',
      score: 65,
      color: 'border-orange-500/30 bg-orange-500/10',
      description: 'Practitioner standard. Fully independent contributor, delivers production features end-to-end.',
    },
    {
      level: 'Advanced',
      range: '71–89%',
      badge: 'Level 4',
      score: 85,
      color: 'border-orange-400/35 bg-orange-500/15',
      description: 'Domain mastery. Solves complex edge cases, reviews architecture, and mentors junior team members.',
    },
    {
      level: 'Expert',
      range: '90–100%',
      badge: 'Level 5',
      score: 100,
      color: 'border-orange-500/50 bg-gradient-to-r from-orange-500/20 to-amber-500/15',
      description: 'Strategic leader. Shapes technology choices, leads cross-team patterns, and defines standards.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-7 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500/15 border border-orange-500/30 text-[#F26207] shadow-[0_0_15px_rgba(242,98,7,0.25)]">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-800 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[.08em] text-slate-300">
                  {skill.category || 'Capability'}
                </span>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-orange-300">
                  {proficiencies.length} proficient team {proficiencies.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <h2 className="mt-1.5 font-[Manrope] text-xl font-extrabold text-white sm:text-2xl">{skill.name}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                {skill.description || 'Enterprise capability standard defining performance and execution expectations across teams.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* 5-Tier Competency Rubric */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-[Manrope] text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Proficiency Benchmark Matrix (5-Tier Rubric)
            </h3>
            <span className="text-[10px] font-mono text-orange-400">Enterprise Standard</span>
          </div>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-5">
            {rubricTiers.map((tier) => (
              <div
                key={tier.badge}
                className={`rounded-2xl border p-3 flex flex-col justify-between ${tier.color} transition hover:scale-[1.02]`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase text-orange-300">{tier.badge}</span>
                    <span className="text-[9px] font-mono font-semibold text-slate-400">{tier.range}</span>
                  </div>
                  <div className="mt-1 font-[Manrope] text-xs font-bold text-white">{tier.level}</div>
                  <p className="mt-1.5 text-[10px] leading-4 text-slate-300">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proficient Team Members List */}
        <div className="mt-7 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-[Manrope] text-sm font-extrabold text-white">Proficient Team Members</h3>
              <p className="text-[11px] text-slate-400">Employees with verified capability and assessment history</p>
            </div>
            <span className="rounded-lg bg-slate-800 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-slate-300">
              {proficiencies.length} recorded
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {proficiencies.map((p, idx) => {
              const emp = employees.find((e) => String(e.id ?? e.employeeId) === String(p.employeeId));
              const currentLvl = p.level || 'Intermediate';
              const currentScore = p.proficiency || levelPercent(currentLvl);

              return (
                <div
                  key={p.id ?? idx}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950/60 border border-white/10 p-3.5 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/20 border border-orange-500/35 text-xs font-bold text-orange-300 shadow-sm">
                      {initials(nameOf(emp || {}))}
                    </span>
                    <div>
                      <Link
                        href={`/employees/${emp?.id ?? emp?.employeeId ?? p.employeeId}`}
                        onClick={close}
                        className="text-xs font-bold text-white hover:text-orange-300 transition no-underline"
                      >
                        {nameOf(emp || {})}
                      </Link>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {emp?.department || 'Engineering'} · {emp?.jobRole || 'Team Member'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28 text-right">
                      <div className="text-[10px] font-mono font-bold text-orange-300">
                        {currentLvl} ({currentScore}%)
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                          style={{ width: `${Math.min(100, currentScore)}%` }}
                        />
                      </div>
                    </div>

                    <select
                      value={currentLvl}
                      onChange={(e) => {
                        const lvl = e.target.value as SkillLevel;
                        const scoreMap: Record<string, number> = {
                          Beginner: 25,
                          Basic: 40,
                          Intermediate: 65,
                          Advanced: 85,
                          Expert: 100,
                        };
                        void handleLevelChange(emp?.id ?? p.employeeId, lvl, scoreMap[lvl] || 50);
                      }}
                      className="rounded-xl border border-white/15 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none focus:border-[#F26207]"
                    >
                      <option value="Beginner">Level 1 - Beginner (25%)</option>
                      <option value="Basic">Level 2 - Basic (40%)</option>
                      <option value="Intermediate">Level 3 - Intermediate (65%)</option>
                      <option value="Advanced">Level 4 - Advanced (85%)</option>
                      <option value="Expert">Level 5 - Expert (100%)</option>
                    </select>
                  </div>
                </div>
              );
            })}

            {!proficiencies.length && (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-xs text-slate-400">
                No team members are currently assigned to this skill. Use the form below to assess and assign a team member.
              </div>
            )}
          </div>
        </div>

        {/* Assign Skill to Another Employee */}
        <div className="mt-7 border-t border-white/10 pt-6">
          <h3 className="font-[Manrope] text-sm font-extrabold text-white">Assign Skill to Team Member</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Grant or record this capability for another member of your organization.
          </p>

          <form onSubmit={handleAssign} className="mt-4 grid gap-3 sm:grid-cols-[1.5fr_1fr_auto]">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Select Team Member
              </label>
              <select
                value={assignEmpId}
                onChange={(e) => setAssignEmpId(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-xs text-white outline-none focus:border-[#F26207]"
              >
                <option value="">Choose an employee…</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.id ?? emp.employeeId} value={emp.id ?? emp.employeeId}>
                    {nameOf(emp)} · {emp.department || 'General'} ({emp.employeeId || emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Proficiency Level
              </label>
              <select
                value={assignLevel}
                onChange={(e) => {
                  const lvl = e.target.value as SkillLevel;
                  setAssignLevel(lvl);
                  const scoreMap: Record<string, number> = {
                    Beginner: 25,
                    Basic: 40,
                    Intermediate: 65,
                    Advanced: 85,
                    Expert: 100,
                  };
                  setAssignScore(scoreMap[lvl] || 65);
                }}
                className="w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-xs text-white outline-none focus:border-[#F26207]"
              >
                <option value="Beginner">Level 1 - Beginner (25%)</option>
                <option value="Basic">Level 2 - Basic (40%)</option>
                <option value="Intermediate">Level 3 - Intermediate (65%)</option>
                <option value="Advanced">Level 4 - Advanced (85%)</option>
                <option value="Expert">Level 5 - Expert (100%)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={busy || !availableEmployees.length}
                className="w-full sm:w-auto dynamic-btn rounded-xl btn-primary-orange px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer shadow-md"
              >
                {busy ? 'Assigning…' : 'Assign Skill'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end border-t border-white/10 pt-4">
          <Button secondary onClick={close}>Done</Button>
        </div>
      </div>
    </div>
  );
}

function Skills({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const skills = arr(data, 'skills');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All categories');
  const [dialog, setDialog] = useState(false);
  const [proficiencySkill, setProficiencySkill] = useState<AnyRow | null>(null);

  const categories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));
  const filtered = skills.filter(
    (s) =>
      `${s.name} ${s.category || ''} ${s.description || ''}`.toLowerCase().includes(q.toLowerCase()) &&
      (category === 'All categories' || s.category === category)
  );

  return (
    <>
      <PageTitle
        eyebrow="Capability framework"
        title="Skills library"
        subtitle="The shared language for what your people know — and what they are ready to learn."
        action={
          <div className="flex items-center gap-2">
            <Button
              secondary
              onClick={() => {
                const rows = filtered.map((s) => [
                  s.id || '',
                  s.name || '',
                  s.category || '',
                  s.description || '',
                ]);
                exportCsv(
                  `skilltrack-skills-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Skill ID', 'Skill Name', 'Category', 'Description'],
                  rows
                );
                toast.success(`Exported ${filtered.length} skills to CSV`);
              }}
              testId="button-export-skills"
            >
              <Download size={14} /> Export CSV
            </Button>
            <Button onClick={() => setDialog(true)} testId="button-add-skill">
              <Plus size={15} /> Add a skill
            </Button>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-[380px]">
          <Search size={15} className="absolute left-3 top-3 text-slate-500" />
          <input
            data-testid="input-search-skills"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search skills…"
            className="w-full rounded-xl border border-white/15 bg-slate-950/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#F26207]"
          />
        </div>
        <select
          data-testid="filter-skill-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-xs text-slate-200 outline-none"
        >
          <option className="bg-slate-900">All categories</option>
          {categories.map((c: any) => (
            <option key={c} className="bg-slate-900">{c}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.slice(0, 5).map((c: any, i) => (
          <span
            key={c}
            className={`dynamic-btn rounded-full px-3 py-1.5 text-[10px] font-bold cursor-pointer ${
              i === 0
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_10px_rgba(242,98,7,0.15)]'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-orange-500/30'
            }`}
          >
            {c} <span className="ml-1 opacity-60">{skills.filter((s) => s.category === c).length}</span>
          </span>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y">
          {filtered.map((s, i) => (
            <article
              key={s.id ?? i}
              className="dynamic-box group p-5 transition-all hover:bg-slate-800/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#F26207]">
                  <BriefcaseBusiness size={18} />
                </div>
                <span className="rounded-full bg-slate-800/80 border border-white/10 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[.08em] text-slate-300">
                  {s.category || 'Uncategorized'}
                </span>
              </div>
              <h3 className="mt-4 font-[Manrope] text-sm font-extrabold text-white">{s.name}</h3>
              <p className="mt-1.5 min-h-10 text-xs leading-5 text-slate-400">
                {s.description || 'No description has been added for this capability yet.'}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-slate-400 font-mono">
                <span>
                  {arr(data, 'employeeSkills').filter((es) => String(es.skillId) === String(s.id)).length} team proficiencies
                </span>
                <button
                  type="button"
                  onClick={() => setProficiencySkill(s)}
                  className="dynamic-btn flex items-center gap-1.5 rounded-lg border border-orange-500/35 bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold text-[#F26207] hover:bg-orange-500/25 hover:text-orange-200 transition cursor-pointer shadow-sm"
                >
                  <Eye size={12} />
                  View proficiency
                </button>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <div className="col-span-full">
              <Empty
                label={
                  skills.length
                    ? 'No skills match the current search and category.'
                    : 'Add skills to create your organization’s capability framework.'
                }
                onAdd={() => setDialog(true)}
              />
            </div>
          )}
        </div>
      </Panel>
      {dialog && <RecordDialog kind="skill" close={() => setDialog(false)} data={data} refresh={refresh} />}
      {proficiencySkill && (
        <SkillProficiencyModal
          skill={proficiencySkill}
          data={data}
          refresh={refresh}
          close={() => setProficiencySkill(null)}
        />
      )}
    </>
  );
}

function MiniCount({ label, value, accent }: { label: string; value: number; accent: string }) {
  const col: Record<string, string> = {
    orange: 'text-[#F26207] bg-orange-500/15 border border-orange-500/30 shadow-[0_0_12px_rgba(242,98,7,0.2)]',
    amber: 'text-amber-400 bg-amber-500/15 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    rose: 'text-rose-400 bg-rose-500/15 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    blue: 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
  };
  return (
    <Panel className="flex items-center justify-between px-4 py-3">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className={`rounded-xl px-3 py-1 font-[Manrope] text-lg font-extrabold ${col[accent]}`}>{value}</div>
    </Panel>
  );
}

function Certifications({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const certifications = arr(data, 'certifications');
  const employees = arr(data, 'employees', 'people');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [dialog, setDialog] = useState(false);

  const getStatus = (c: AnyRow) => {
    const days = (new Date(c.expiryDate || 0).getTime() - Date.now()) / 86400000;
    return days < 0 ? 'Expired' : days < 61 ? 'Expiring soon' : 'Current';
  };

  const list = certifications.filter(
    (c) =>
      `${c.name} ${c.provider || ''} ${c.employeeName || ''}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === 'All statuses' || getStatus(c) === filter)
  );

  const nudge = (c: AnyRow) => {
    const holder = employees.find((e) => String(e.id ?? e.employeeId) === String(c.employeeId));
    if (!holder?.email) {
      toast.error('No email address is recorded for this credential holder.');
      return;
    }
    const subject = encodeURIComponent(`Certification renewal: ${c.name}`);
    const body = encodeURIComponent(
      `Hi ${holder.fullName || 'there'},\n\nThis is a reminder that your ${c.name} certification expires on ${dateText(
        c.expiryDate
      )}. Please share your renewal plan with People Operations.\n`
    );
    window.location.href = `mailto:${holder.email}?subject=${subject}&body=${body}`;
    toast.success('Reminder draft opened in your email app');
  };

  return (
    <>
      <PageTitle
        eyebrow="Credential register"
        title="Certifications"
        subtitle="Keep professional credentials visible, current, and ahead of expiry."
        action={
          <div className="flex items-center gap-2">
            <Button
              secondary
              onClick={() => {
                const rows = list.map((c) => [
                  c.name || '',
                  c.provider || '',
                  c.employeeName || employees.find((e) => String(e.id ?? e.employeeId) === String(c.employeeId))?.fullName || '',
                  c.issueDate || '',
                  c.expiryDate || '',
                  getStatus(c),
                ]);
                exportCsv(
                  `skilltrack-certifications-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Certification Name', 'Provider', 'Employee Holder', 'Issue Date', 'Expiry Date', 'Status'],
                  rows
                );
                toast.success(`Exported ${list.length} certifications to CSV`);
              }}
            >
              <Download size={14} /> Export CSV
            </Button>
            <Button onClick={() => setDialog(true)}>
              <Plus size={15} /> Add certification
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MiniCount label="Current" value={certifications.filter((c) => getStatus(c) === 'Current').length} accent="orange" />
        <MiniCount label="Expiring soon" value={certifications.filter((c) => getStatus(c) === 'Expiring soon').length} accent="amber" />
        <MiniCount label="Expired" value={certifications.filter((c) => getStatus(c) === 'Expired').length} accent="rose" />
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between bg-slate-950/40">
          <div className="relative max-w-[380px] flex-1">
            <Search size={15} className="absolute left-3 top-3 text-slate-500" />
            <input
              data-testid="input-search-certifications"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search credential, provider, or person…"
              className="w-full rounded-xl border border-white/15 bg-slate-950/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#F26207]"
            />
          </div>
          <select
            data-testid="filter-certification-status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-xs text-slate-200 outline-none"
          >
            <option className="bg-slate-900">All statuses</option>
            {['Current', 'Expiring soon', 'Expired'].map((x) => (
              <option key={x} className="bg-slate-900">{x}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-950/80 text-[10px] font-mono uppercase tracking-[.12em] text-slate-400 border-b border-white/10">
              <tr>
                {['Credential', 'Holder', 'Provider', 'Issued', 'Expires', 'Status', ''].map((x) => (
                  <th key={x} className="px-5 py-3 font-bold">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.map((c, i) => {
                const emp = employees.find((e) => String(e.id ?? e.employeeId) === String(c.employeeId));
                const status = getStatus(c);
                return (
                  <tr key={c.id ?? i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="mt-1 text-[10px] text-slate-400">{c.category || 'Professional credential'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-200">{c.employeeName || nameOf(emp || {})}</td>
                    <td className="px-5 py-4 text-xs text-slate-300">{c.provider || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-300">{dateText(c.issueDate)}</td>
                    <td className="px-5 py-4 text-xs text-slate-300">{dateText(c.expiryDate)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge value={status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await renewCertification(c.id, 1);
                              toast.success(`Renewed ${c.name} for 1 year`);
                              await refresh();
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : 'Could not renew certification.');
                            }
                          }}
                          className="dynamic-btn whitespace-nowrap rounded-lg border border-orange-500/35 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-orange-300 hover:bg-orange-500/25 hover:text-orange-200 transition cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <RotateCw size={11} />
                          Renew (+1 yr)
                        </button>
                        <button
                          type="button"
                          onClick={() => nudge(c)}
                          className="dynamic-btn whitespace-nowrap text-[11px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Send reminder
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!list.length && (
                <TableEmpty
                  colSpan={7}
                  text={certifications.length ? 'No credentials match those filters.' : 'No certifications are recorded yet.'}
                />
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      {dialog && <RecordDialog kind="certification" close={() => setDialog(false)} data={data} refresh={refresh} />}
    </>
  );
}

function EnrollLearnerModal({
  course,
  preselectedEmployeeId,
  data,
  refresh,
  close,
}: {
  course?: AnyRow | null;
  preselectedEmployeeId?: string;
  data: AnyRow | null;
  refresh: () => void;
  close: () => void;
}) {
  const employees = arr(data, 'employees', 'people');
  const courses = arr(data, 'courses');

  const [selectedCourseId, setSelectedCourseId] = useState(course?.id || courses[0]?.id || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    preselectedEmployeeId || employees[0]?.id || employees[0]?.employeeId || ''
  );
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [busy, setBusy] = useState(false);

  const activeCourse = courses.find((c) => String(c.id) === String(selectedCourseId)) || course;
  const activeEmployee = employees.find(
    (e) => String(e.id ?? e.employeeId) === String(selectedEmployeeId)
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('Please select a course to enroll.');
      return;
    }
    if (!selectedEmployeeId) {
      toast.error('Please select an employee.');
      return;
    }

    setBusy(true);
    try {
      await enrollEmployee(selectedEmployeeId, selectedCourseId, progress, dueDate);
      toast.success(
        `Enrolled ${nameOf(activeEmployee || {})} in ${activeCourse?.name || 'training course'}`
      );
      await refresh();
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not enroll employee.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[92dvh] w-full max-w-[540px] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-7 shadow-2xl text-slate-100"
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#F26207] shadow-[0_0_12px_rgba(242,98,7,0.25)]">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[.17em] text-[#F26207]">
                Training Enrollment
              </div>
              <h2 className="mt-0.5 font-[Manrope] text-xl font-extrabold text-white">Enroll a Learner</h2>
              <p className="mt-1 text-xs text-slate-300">
                Connect an employee to coursework and monitor progress.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Course Selection */}
        <div className="space-y-4">
          <label className="block text-[11px] font-bold text-slate-300">
            Training Course
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name} · {c.category || 'General'} ({c.duration || 'Flexible'})
                </option>
              ))}
            </select>
          </label>

          {/* Employee Selection */}
          <label className="block text-[11px] font-bold text-slate-300">
            Select Employee to Enroll
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
            >
              {employees.map((emp) => (
                <option key={emp.id ?? emp.employeeId} value={emp.id ?? emp.employeeId} className="bg-slate-900">
                  {nameOf(emp)} · {emp.department || 'Engineering'} — {emp.jobRole || 'Specialist'} ({emp.employeeId || emp.id})
                </option>
              ))}
            </select>
          </label>

          {/* Initial Progress & Due Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[11px] font-bold text-slate-300">
              Initial Progress
              <select
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
              >
                <option value={0} className="bg-slate-900">0% · Not started</option>
                <option value={25} className="bg-slate-900">25% · In progress (Started)</option>
                <option value={50} className="bg-slate-900">50% · In progress (Halfway)</option>
                <option value={75} className="bg-slate-900">75% · In progress (Near done)</option>
                <option value={100} className="bg-slate-900">100% · Completed</option>
              </select>
            </label>

            <label className="block text-[11px] font-bold text-slate-300">
              Target Completion Date
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-[13px] font-normal text-white outline-none focus:border-[#F26207]"
              />
            </label>
          </div>

          {/* Selected Preview Box */}
          {activeEmployee && activeCourse && (
            <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-3.5 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/20 border border-orange-500/35 text-xs font-bold text-orange-300">
                {initials(nameOf(activeEmployee))}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{nameOf(activeEmployee)}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  Enrolling in <span className="text-orange-400 font-semibold">{activeCourse.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button secondary onClick={close}>Cancel</Button>
          <button
            type="submit"
            disabled={busy || !employees.length || !courses.length}
            className="dynamic-btn rounded-xl btn-primary-orange px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-2"
          >
            {busy ? 'Enrolling…' : 'Confirm Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
}

function UpdateProgressModal({
  enrollment,
  data,
  refresh,
  close,
}: {
  enrollment: AnyRow | null;
  data: AnyRow | null;
  refresh: () => void;
  close: () => void;
}) {
  if (!enrollment) return null;

  const employees = arr(data, 'employees', 'people');
  const courses = arr(data, 'courses');
  const person = employees.find(
    (p) => String(p.id ?? p.employeeId) === String(enrollment.employeeId)
  );
  const course = courses.find((c) => String(c.id) === String(enrollment.courseId));

  const [progress, setProgress] = useState<number>(Number(enrollment.progress) || 0);
  const [busy, setBusy] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateEnrollment(enrollment.id, progress);
      toast.success('Course progress updated');
      await refresh();
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update progress.');
    } finally {
      setBusy(false);
    }
  };

  const presets = [0, 25, 50, 75, 100];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <form
        onSubmit={handleSave}
        className="w-full max-w-[460px] rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl text-slate-100"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[.17em] text-[#F26207]">
              Course Progress
            </div>
            <h2 className="mt-1 font-[Manrope] text-lg font-extrabold text-white">
              {course?.name || 'Training Course'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Learner: <span className="text-white font-semibold">{nameOf(person || {})}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-5 rounded-2xl bg-slate-950/70 border border-white/10 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progress</span>
            <span className="font-mono font-bold text-orange-400">{progress}%</span>
          </div>

          <div className="mt-2 h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex justify-between gap-1.5">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setProgress(val)}
                className={`flex-1 rounded-xl py-1.5 text-[11px] font-mono font-bold transition cursor-pointer ${
                  progress === val
                    ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(242,98,7,0.3)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button secondary onClick={close}>Cancel</Button>
          <button
            type="submit"
            disabled={busy}
            className="dynamic-btn rounded-xl btn-primary-orange px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer shadow-md"
          >
            {busy ? 'Saving…' : 'Save Progress'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Training({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const courses = arr(data, 'courses');
  const enrollments = arr(data, 'enrollments');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All courses');
  const [dialog, setDialog] = useState(false);
  const [enrollCourse, setEnrollCourse] = useState<AnyRow | null>(null);
  const [progressEnrollment, setProgressEnrollment] = useState<AnyRow | null>(null);

  const cats = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
  const list = courses.filter(
    (c) =>
      `${c.name} ${c.description || ''} ${c.category || ''}`.toLowerCase().includes(query.toLowerCase()) &&
      (category === 'All courses' || c.category === category)
  );

  return (
    <>
      <PageTitle
        eyebrow="Learning operations"
        title="Training"
        subtitle="A practical catalogue of learning, with progress that stays connected to the people doing it."
        action={
          <div className="flex items-center gap-2">
            <Button
              secondary
              onClick={() => {
                const rows = list.map((c) => [
                  c.id || '',
                  c.name || '',
                  c.category || '',
                  c.instructor || '',
                  c.duration || '',
                  enrollments.filter((e) => String(e.courseId) === String(c.id)).length,
                  c.description || '',
                ]);
                exportCsv(
                  `skilltrack-training-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Course ID', 'Course Name', 'Category', 'Instructor', 'Duration', 'Enrollments', 'Description'],
                  rows
                );
                toast.success(`Exported ${list.length} courses to CSV`);
              }}
            >
              <Download size={14} /> Export CSV
            </Button>
            <Button onClick={() => setEnrollCourse(courses[0] || {})}>
              <UserPlus size={15} /> Enroll learner
            </Button>
            <Button secondary onClick={() => setDialog(true)}>
              <Plus size={15} /> Add course
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-[390px] flex-1">
          <Search size={15} className="absolute left-3 top-3 text-slate-500" />
          <input
            data-testid="input-search-courses"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a course…"
            className="w-full rounded-xl border border-white/15 bg-slate-950/80 py-2.5 pl-9 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#F26207]"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-xs text-slate-200 outline-none"
        >
          <option className="bg-slate-900">All courses</option>
          {cats.map((c: any) => (
            <option key={c} className="bg-slate-900">{c}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((c, i) => {
          const enrolls = enrollments.filter((e) => String(e.courseId) === String(c.id));
          return (
            <Panel key={c.id ?? i} className="overflow-hidden group">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 bg-slate-950/40">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#F26207] shadow-[0_0_12px_rgba(242,98,7,0.25)]">
                  <GraduationCap size={21} />
                </div>
                <span className="rounded-full bg-slate-800 border border-white/10 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[.08em] text-slate-300">
                  {c.category || 'Learning'}
                </span>
              </div>
              <div className="p-5 pt-4">
                <Link
                  href={`/training/${c.id}`}
                  className="font-[Manrope] text-base font-extrabold text-white no-underline hover:text-orange-300 transition"
                >
                  {c.name}
                </Link>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
                  {c.description || 'Course details have not been added yet.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-400 font-mono">
                  <span>{c.instructor || 'Instructor not set'}</span>
                  <span>{c.duration || 'Duration not set'}</span>
                  <span className="text-orange-400 font-bold">{enrolls.length} enrolled</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-[#F26207]" />
                    {c.requiredSkills?.length || 0} required skills
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEnrollCourse(c)}
                      className="dynamic-btn rounded-xl btn-primary-orange px-3 py-2 text-[10px] font-bold text-white cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <UserPlus size={12} />
                      Enroll learner
                    </button>
                    {enrolls[0] && (
                      <button
                        type="button"
                        onClick={() => setProgressEnrollment(enrolls[0])}
                        className="dynamic-btn rounded-xl border border-white/15 bg-slate-800 px-3 py-2 text-[10px] font-bold text-slate-200 hover:text-white cursor-pointer"
                      >
                        Update progress
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
        {!list.length && (
          <div className="lg:col-span-2">
            <Panel>
              <Empty
                label={
                  courses.length
                    ? 'No courses match your search or category.'
                    : 'Add courses to build a learning catalogue for your teams.'
                }
                onAdd={() => setDialog(true)}
              />
            </Panel>
          </div>
        )}
      </div>
      {dialog && <RecordDialog kind="course" close={() => setDialog(false)} data={data} refresh={refresh} />}
      {enrollCourse && (
        <EnrollLearnerModal
          course={enrollCourse}
          data={data}
          refresh={refresh}
          close={() => setEnrollCourse(null)}
        />
      )}
      {progressEnrollment && (
        <UpdateProgressModal
          enrollment={progressEnrollment}
          data={data}
          refresh={refresh}
          close={() => setProgressEnrollment(null)}
        />
      )}
    </>
  );
}

function SkillGaps({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const gaps = arr(data, 'skillGaps', 'skillGapsData', 'gaps');
  const [priority, setPriority] = useState('All priorities');

  const list = gaps.filter(
    (g) =>
      !g.resolved &&
      (priority === 'All priorities' || String(g.priority || '').toLowerCase() === priority.toLowerCase())
  );

  const resolve = async (g: AnyRow) => {
    try {
      await resolveGap(g.id ?? g);
      toast.success('Skill gap marked resolved');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not resolve gap.');
    }
  };

  const enroll = async (g: AnyRow) => {
    if (!g.recommendedCourse) {
      toast.message('No course recommendation is linked to this gap yet.');
      return;
    }
    const course = arr(data, 'courses').find(
      (c) => String(c.id) === String(g.courseId ?? g.recommendedCourseId) || c.name === g.recommendedCourse
    );
    const courseId = course?.id ?? (typeof g.recommendedCourse === 'object' ? g.recommendedCourse.id : undefined);
    if (!courseId) {
      toast.error('The recommended course could not be found.');
      return;
    }
    try {
      await enrollEmployee(g.employeeId, courseId);
      toast.success('Recommended course assigned');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not enroll learner.');
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Workforce planning"
        title="Skill gaps"
        subtitle="Turn priority capability needs into a focused next step for each person."
        action={
          <select
            data-testid="filter-gap-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-xs text-slate-200 outline-none"
          >
            <option className="bg-slate-900">All priorities</option>
            {['High', 'Medium', 'Low'].map((x) => (
              <option key={x} className="bg-slate-900">{x}</option>
            ))}
          </select>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MiniCount
          label="Open priorities"
          value={gaps.filter((g) => !g.resolved && String(g.priority).toLowerCase() === 'high').length}
          accent="rose"
        />
        <MiniCount
          label="In development"
          value={arr(data, 'enrollments').filter((e) => e.status === 'In progress' || e.status === 'in_progress').length}
          accent="blue"
        />
        <MiniCount label="Resolved" value={gaps.filter((g) => g.resolved).length} accent="orange" />
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4 bg-slate-950/40">
          <h2 className="font-[Manrope] text-sm font-extrabold text-white">Prioritized development opportunities</h2>
          <p className="mt-1 text-[11px] text-slate-400">Match a capability gap with learning that moves it forward.</p>
        </div>

        <div className="divide-y divide-white/5">
          {list.map((g, i) => {
            const delta = Math.max(0, Math.round((levelPercent(g.requiredLevel) - levelPercent(g.currentLevel)) / 20));
            const course = typeof g.recommendedCourse === 'string' ? g.recommendedCourse : g.recommendedCourse?.name;
            const progress = levelPercent(g.currentLevel);
            return (
              <article
                key={g.id ?? i}
                className="dynamic-box grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-center hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      String(g.priority).toLowerCase() === 'high' || String(g.priority).toLowerCase() === 'critical'
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                        : 'bg-orange-500/15 border border-orange-500/30 text-[#F26207] shadow-[0_0_10px_rgba(242,98,7,0.25)]'
                    }`}
                  >
                    <Target size={17} />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {g.skillName || g.skill?.name || g.name || 'Capability gap'}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {g.employeeName || g.fullName || 'Team member'}
                      {g.department ? ` · ${g.department}` : ''}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Current → required</span>
                    <span className="font-mono font-medium text-orange-400">
                      {g.currentLevel ?? '—'} / {g.requiredLevel ?? '—'}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[9px] text-slate-400 font-mono">
                    {delta ? `${delta} level${delta === 1 ? '' : 's'} to close` : 'Level requirement met'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[9px] font-bold uppercase text-orange-300">
                    {g.priority || 'Normal'}
                  </span>
                  <button
                    onClick={() => void enroll(g)}
                    disabled={!g.recommendedCourse}
                    className="dynamic-btn rounded-xl btn-primary-orange px-3 py-2 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                  >
                    Assign course
                  </button>
                  <button
                    title="Mark resolved"
                    aria-label="Resolve skill gap"
                    onClick={() => void resolve(g)}
                    className="dynamic-btn rounded-xl border border-white/15 bg-slate-800 p-2 text-slate-300 hover:text-orange-400 hover:border-orange-500/30 cursor-pointer"
                  >
                    <Check size={14} />
                  </button>
                </div>

                <div className="md:col-start-2 -mt-2 text-[10px] text-slate-400">
                  Recommended: <span className="font-semibold text-orange-400">{course || 'No course recommendation'}</span>
                </div>
              </article>
            );
          })}
          {!list.length && (
            <Empty
              label={
                gaps.length
                  ? 'There are no open gaps at this priority.'
                  : 'Skill gap records will appear once capability requirements are mapped.'
              }
            />
          )}
        </div>
      </Panel>
    </>
  );
}

function Analytics({ data }: { data: AnyRow | null }) {
  const people = arr(data, 'employees', 'people');
  const enroll = arr(data, 'enrollments');
  const gaps = arr(data, 'skillGaps', 'skillGapsData', 'gaps');
  const depts = Array.from(new Set(people.map((e) => e.department).filter(Boolean)));
  const groups = depts.map((d: any) => {
    const members = people.filter((e) => e.department === d);
    const deptGaps = gaps.filter(
      (g) => members.some((m) => String(m.id ?? m.employeeId) === String(g.employeeId)) && !g.resolved
    );
    const learning = enroll.filter((e) => members.some((m) => String(m.id ?? m.employeeId) === String(e.employeeId)));
    return {
      name: d,
      total: members.length,
      gaps: deptGaps.length,
      learning: learning.length,
      complete: learning.filter((e) => Number(e.progress) >= 100 || e.status === 'Completed').length,
    };
  });
  const max = Math.max(1, ...groups.map((g) => g.total));

  return (
    <>
      <PageTitle
        eyebrow="People intelligence"
        title="Analytics"
        subtitle="Compare capability investment and learning momentum across departments."
        action={
          <div className="flex items-center gap-2">
            <Button
              secondary
              onClick={() => {
                exportJson(`skilltrack-analytics-summary-${new Date().toISOString().slice(0, 10)}.json`, {
                  exportedAt: new Date().toISOString(),
                  totalEmployees: people.length,
                  totalDepartments: depts.length,
                  departments: groups,
                });
                toast.success('Analytics summary downloaded as JSON');
              }}
            >
              <Download size={14} /> Export JSON
            </Button>
            <Button secondary onClick={() => window.print()}>
              <Eye size={14} /> Print view
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <Panel className="p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-[Manrope] text-base font-extrabold text-white">Department comparison</h2>
              <p className="mt-1 text-xs text-slate-400">Headcount against open skill gaps</p>
            </div>
            <span className="font-mono text-[9px] text-[#F26207] bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded">
              LIVE TELEMETRY
            </span>
          </div>

          {groups.length ? (
            <div className="mt-7 space-y-5">
              {groups.map((g) => (
                <div key={g.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-bold text-white">{g.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {g.total} people · {g.gaps} open gaps
                    </div>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                      style={{ width: `${(g.total / max) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-rose-400"
                      style={{ width: `${Math.min((g.total / max) * 100, (g.gaps / max) * 100 * 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty label="Department comparisons will appear as your employee records are organized." />
          )}

          <div className="mt-6 flex gap-4 border-t border-white/10 pt-4 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#F26207] shadow-[0_0_6px_#f26207]" />
              People
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              Open gaps
            </span>
          </div>
        </Panel>

        <Panel className="p-5 md:p-6">
          <h2 className="font-[Manrope] text-base font-extrabold text-white">Learning outcomes</h2>
          <p className="mt-1 text-xs text-slate-400">Enrollments across your teams</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <Outcome value={enroll.length} label="Total enrollments" tone="orange" />
            <Outcome
              value={enroll.filter((e) => e.status === 'In progress' || e.status === 'in_progress').length}
              label="In progress"
              tone="blue"
            />
            <Outcome
              value={enroll.filter((e) => Number(e.progress) >= 100 || e.status === 'Completed').length}
              label="Completed"
              tone="amber"
            />
            <Outcome value={gaps.filter((g) => g.resolved).length} label="Gaps resolved" tone="rose" />
          </div>

          <div className="mt-5 rounded-xl bg-slate-950/70 border border-white/10 p-4 dynamic-box hover:border-orange-500/40">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <ArrowUpRight size={15} className="text-[#F26207]" />
              <span>Completion rate</span>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-[Manrope] text-3xl font-extrabold text-white">
                {enroll.length
                  ? Math.round((enroll.filter((e) => Number(e.progress) >= 100 || e.status === 'Completed').length / enroll.length) * 100)
                  : 0}
                %
              </span>
              <span className="text-[10px] text-slate-400">of tracked enrollments</span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4 overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4 bg-slate-950/40">
          <h2 className="font-[Manrope] text-sm font-extrabold text-white">Department breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead className="bg-slate-950/80 text-[10px] font-mono uppercase tracking-[.1em] text-slate-400 border-b border-white/10">
              <tr>
                {['Department', 'People', 'Active enrollments', 'Completed', 'Open gaps'].map((x) => (
                  <th key={x} className="px-5 py-3">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groups.map((g) => (
                <tr key={g.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 text-xs font-bold text-white">{g.name}</td>
                  <td className="px-5 py-3 text-xs text-slate-300">{g.total}</td>
                  <td className="px-5 py-3 text-xs text-slate-300">{g.learning}</td>
                  <td className="px-5 py-3 text-xs text-orange-400 font-bold">{g.complete}</td>
                  <td className="px-5 py-3 text-xs text-rose-400 font-bold">{g.gaps}</td>
                </tr>
              ))}
              {!groups.length && <TableEmpty colSpan={5} text="Department data will populate from employee profiles." />}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function Outcome({ value, label, tone }: { value: number; label: string; tone: string }) {
  const colors: Record<string, string> = {
    orange: 'text-[#F26207]',
    blue: 'text-cyan-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  };
  return (
    <div className="dynamic-box rounded-xl bg-slate-950/70 border border-white/10 p-3.5 hover:border-white/20">
      <div className={`font-[Manrope] text-2xl font-extrabold ${colors[tone]}`}>{value}</div>
      <div className="mt-1 text-[10px] text-slate-400">{label}</div>
    </div>
  );
}

function EmployeeProfile({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const params = useParams<{ id: string }>();
  const people = arr(data, 'employees', 'people');
  const employee = people.find((e) => String(e.id ?? e.employeeId) === String(params.id));
  const proficiencies = arr(data, 'employeeSkills').filter((x) => String(x.employeeId) === String(params.id));
  const skills = arr(data, 'skills');
  const certs = arr(data, 'certifications').filter((x) => String(x.employeeId) === String(params.id));
  const enrollments = arr(data, 'enrollments').filter((x) => String(x.employeeId) === String(params.id));

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');
  const [addingSkill, setAddingSkill] = useState(false);

  const availableSkills = skills.filter(
    (s) => !proficiencies.some((p) => String(p.skillId) === String(s.id))
  );

  const changeSkill = async (id: any, level: string) => {
    const choices = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
    const normalized = choices[Number(level)] || level;
    const score: Record<string, number> = { Beginner: 25, Basic: 40, Intermediate: 65, Advanced: 85, Expert: 100 };
    try {
      await updateEmployeeSkill(params.id || '', String(id), normalized as SkillLevel, score[normalized] || 50);
      toast.success('Proficiency updated');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update proficiency.');
    }
  };

  const handleAddSkill = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSkillId) {
      toast.error('Please select a skill to add.');
      return;
    }
    setAddingSkill(true);
    const scoreMap: Record<string, number> = {
      Beginner: 25,
      Basic: 40,
      Intermediate: 65,
      Advanced: 85,
      Expert: 100,
    };
    try {
      await updateEmployeeSkill(
        employee?.id || params.id || '',
        newSkillId,
        newSkillLevel,
        scoreMap[newSkillLevel] || 65
      );
      const skillName = skills.find((s) => s.id === newSkillId)?.name || 'skill';
      toast.success(`Added ${skillName} (${newSkillLevel}) to profile`);
      setNewSkillId('');
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  if (!employee)
    return (
      <>
        <Link href="/employees" className="dynamic-btn text-xs font-bold text-[#F26207] no-underline">
          ← Back to people
        </Link>
        <div className="mt-5">
          <Empty label="This employee profile could not be found in the current workspace." />
        </div>
      </>
    );

  return (
    <>
      <Link href="/employees" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#F26207] no-underline hover:text-orange-300">
        ← All employees
      </Link>
      <PageTitle
        eyebrow="Employee profile"
        title={nameOf(employee)}
        subtitle={`${employee.jobRole || 'Role not set'} · ${employee.department || 'Department not set'}`}
        action={
          <Button secondary onClick={() => setEditProfileOpen(true)}>
            Edit profile
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <Panel className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-500/20 border border-orange-500/35 text-lg font-bold text-orange-300 shadow-[0_0_15px_rgba(242,98,7,0.25)]">
              {initials(nameOf(employee))}
            </div>
            <div>
              <h2 className="font-[Manrope] text-lg font-extrabold text-white">{nameOf(employee)}</h2>
              <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                <span>{employee.employeeId || employee.id}</span>
                <span>·</span>
                <StatusBadge value={employee.status || 'Active'} />
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            {[
              ['Email', employee.email],
              ['Phone', employee.phone],
              ['Manager', employee.manager],
              ['Location', employee.location],
              ['Joined', dateText(employee.joiningDate)],
              ['Department', employee.department],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[9px] font-mono font-bold uppercase tracking-[.12em] text-slate-400">{k}</div>
                <div className="mt-1 break-words text-xs text-slate-200">{v || 'Not provided'}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[Manrope] text-sm font-extrabold text-white">Development plan</h2>
              <p className="mt-1 text-[11px] text-slate-400">Skills to grow, courses underway, and credentials</p>
            </div>
            <span className="rounded-lg bg-orange-500/15 border border-orange-500/30 px-2 py-1 text-[9px] font-mono font-bold text-orange-400">
              {proficiencies.length} tracked skills
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {proficiencies.map((p, i) => {
              const skill = skills.find((s) => String(s.id) === String(p.skillId));
              return (
                <div
                  key={p.id ?? i}
                  className="dynamic-box flex items-center gap-3 rounded-xl bg-slate-950/70 border border-white/10 p-3 hover:border-orange-500/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-white">{skill?.name || p.skillName || 'Skill'}</div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {skill?.category || 'Capability'} · current level {p.level ?? p.proficiency ?? '—'}
                    </div>
                  </div>
                  <select
                    aria-label={`Update ${skill?.name || 'skill'} proficiency`}
                    value={p.level || 'Intermediate'}
                    onChange={(e) => void changeSkill(p.skillId, e.target.value)}
                    className="rounded-lg border border-white/15 bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white outline-none focus:border-[#F26207]"
                  >
                    <option value="Beginner" className="bg-slate-900">Beginner (25%)</option>
                    <option value="Basic" className="bg-slate-900">Basic (40%)</option>
                    <option value="Intermediate" className="bg-slate-900">Intermediate (65%)</option>
                    <option value="Advanced" className="bg-slate-900">Advanced (85%)</option>
                    <option value="Expert" className="bg-slate-900">Expert (100% )</option>
                  </select>
                </div>
              );
            })}
            {!proficiencies.length && (
              <p className="py-4 text-center text-xs text-slate-400">No skills have been assessed for this employee yet.</p>
            )}
          </div>

          {/* Quick Add Skill Form */}
          {availableSkills.length > 0 && (
            <form onSubmit={handleAddSkill} className="mt-4 border-t border-white/10 pt-3 flex flex-wrap items-center gap-2">
              <select
                value={newSkillId}
                onChange={(e) => setNewSkillId(e.target.value)}
                className="flex-1 min-w-[150px] rounded-xl border border-white/15 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-[#F26207]"
              >
                <option value="">+ Assign another skill…</option>
                {availableSkills.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900">
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="rounded-xl border border-white/15 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-[#F26207]"
              >
                <option value="Beginner" className="bg-slate-900">Beginner</option>
                <option value="Basic" className="bg-slate-900">Basic</option>
                <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                <option value="Advanced" className="bg-slate-900">Advanced</option>
                <option value="Expert" className="bg-slate-900">Expert</option>
              </select>
              <button
                type="submit"
                disabled={addingSkill || !newSkillId}
                className="dynamic-btn rounded-xl btn-primary-orange px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                {addingSkill ? 'Adding…' : 'Add Skill'}
              </button>
            </form>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-[Manrope] text-sm font-extrabold text-white">Credentials</h2>
            <button
              type="button"
              onClick={() => setCertDialogOpen(true)}
              className="dynamic-btn rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 transition cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} /> Add credential
            </button>
          </div>
          {certs.map((c, i) => (
            <div key={c.id ?? i} className="mt-3 flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
              <div>
                <div className="text-xs font-bold text-white">{c.name}</div>
                <div className="mt-1 text-[10px] text-slate-400">{c.provider || 'Provider not set'}</div>
              </div>
              <StatusBadge value={dateText(c.expiryDate)} />
            </div>
          ))}
          {!certs.length && <div className="mt-3 text-xs text-slate-400">No certifications recorded.</div>}
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-[Manrope] text-sm font-extrabold text-white">Learning activity</h2>
            <button
              type="button"
              onClick={() => setEnrollOpen(true)}
              className="dynamic-btn rounded-lg btn-primary-orange px-2.5 py-1 text-[11px] font-bold text-white hover:brightness-110 transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <UserPlus size={12} /> Enroll in course
            </button>
          </div>
          {enrollments.map((en, i) => {
            const course = arr(data, 'courses').find((c) => String(c.id) === String(en.courseId));
            return (
              <div key={en.id ?? i} className="mt-3 border-b border-white/5 pb-3 last:border-0">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">{course?.name || en.courseName || 'Course enrollment'}</span>
                  <span className="font-mono text-[10px] text-orange-400">{pct(en.progress)}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                    style={{ width: pct(en.progress) }}
                  />
                </div>
              </div>
            );
          })}
          {!enrollments.length && <div className="mt-3 text-xs text-slate-400">No active course enrollments.</div>}
        </Panel>
      </div>

      {editProfileOpen && (
        <RecordDialog
          kind="employee"
          initial={employee}
          close={() => setEditProfileOpen(false)}
          data={data}
          refresh={refresh}
        />
      )}
      {certDialogOpen && (
        <RecordDialog
          kind="certification"
          initial={{ employeeId: employee.id ?? employee.employeeId }}
          close={() => setCertDialogOpen(false)}
          data={data}
          refresh={refresh}
        />
      )}
      {enrollOpen && (
        <EnrollLearnerModal
          preselectedEmployeeId={employee.id ?? employee.employeeId}
          data={data}
          refresh={refresh}
          close={() => setEnrollOpen(false)}
        />
      )}
    </>
  );
}

function CourseDetail({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const { id } = useParams<{ id: string }>();
  const course = arr(data, 'courses').find((c) => String(c.id) === String(id));
  const enrollments = arr(data, 'enrollments').filter((e) => String(e.courseId) === String(id));

  const [enrollOpen, setEnrollOpen] = useState(false);
  const [updatingEnrollment, setUpdatingEnrollment] = useState<AnyRow | null>(null);

  if (!course)
    return (
      <>
        <Link href="/training" className="dynamic-btn text-xs font-bold text-[#F26207] no-underline">
          ← Training catalogue
        </Link>
        <div className="mt-4">
          <Empty label="This course is not available in the current workspace." />
        </div>
      </>
    );

  return (
    <>
      <Link href="/training" className="mb-5 inline-flex text-xs font-bold text-[#F26207] no-underline hover:text-orange-300">
        ← Training catalogue
      </Link>
      <PageTitle
        eyebrow={course.category || 'Learning course'}
        title={course.name}
        subtitle={course.description || 'Course information and enrollment progress.'}
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => setEnrollOpen(true)}>
              <UserPlus size={15} /> Enroll learner
            </Button>
            <Button secondary onClick={() => toast.message('Edit course details from the training catalogue.')}>
              Edit course
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
        <Panel className="p-5">
          <h2 className="font-[Manrope] text-sm font-extrabold text-white">Course details</h2>
          <div className="mt-4 space-y-3">
            {[
              ['Instructor', course.instructor],
              ['Duration', course.duration],
              ['Category', course.category],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-[9px] font-mono font-bold uppercase tracking-[.12em] text-slate-400">{l}</div>
                <div className="mt-1 text-xs text-slate-200">{v || 'Not provided'}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="text-[9px] font-mono font-bold uppercase tracking-[.12em] text-slate-400">Required skills</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(course.requiredSkills || []).map((s: any, i: number) => (
                <span
                  key={i}
                  className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[10px] font-semibold text-orange-300"
                >
                  {typeof s === 'string' ? s : s.name}
                </span>
              ))}
              {!course.requiredSkills?.length && (
                <span className="text-xs text-slate-400">No prerequisite skills listed.</span>
              )}
            </div>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="border-b border-white/10 p-5 bg-slate-950/40 flex items-center justify-between">
            <div>
              <h2 className="font-[Manrope] text-sm font-extrabold text-white">Learner progress</h2>
              <p className="mt-1 text-[11px] text-slate-400">{enrollments.length} enrolled in this course</p>
            </div>
            <button
              type="button"
              onClick={() => setEnrollOpen(true)}
              className="dynamic-btn rounded-xl btn-primary-orange px-3.5 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <UserPlus size={13} />
              Enroll learner
            </button>
          </div>
          {enrollments.map((en, i) => {
            const person = arr(data, 'employees', 'people').find((p) => String(p.id ?? p.employeeId) === String(en.employeeId));
            return (
              <div
                key={en.id ?? i}
                className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-4 last:border-0 hover:bg-slate-800/40 transition-colors"
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-300">
                  {initials(nameOf(person || {}))}
                </div>
                <div className="min-w-[120px] flex-1">
                  <div className="text-xs font-bold text-white">{nameOf(person || {})}</div>
                  <div className="mt-1 text-[10px] text-slate-400">Due {dateText(en.dueDate)}</div>
                </div>
                <div className="w-[120px]">
                  <div className="mb-1 text-right font-mono text-[9px] text-slate-400">{pct(en.progress)}</div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                      style={{ width: pct(en.progress) }}
                    />
                  </div>
                </div>
                <StatusBadge value={en.status || 'Not started'} />
                <button
                  type="button"
                  onClick={() => setUpdatingEnrollment(en)}
                  className="dynamic-btn rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-[10px] font-bold text-slate-200 hover:text-white cursor-pointer"
                >
                  Update
                </button>
              </div>
            );
          })}
          {!enrollments.length && (
            <div className="p-6 text-center">
              <Empty
                label="No one is enrolled in this course yet. Click below to enroll a team member."
                onAdd={() => setEnrollOpen(true)}
              />
            </div>
          )}
        </Panel>
      </div>

      {enrollOpen && (
        <EnrollLearnerModal
          course={course}
          data={data}
          refresh={refresh}
          close={() => setEnrollOpen(false)}
        />
      )}
      {updatingEnrollment && (
        <UpdateProgressModal
          enrollment={updatingEnrollment}
          data={data}
          refresh={refresh}
          close={() => setUpdatingEnrollment(null)}
        />
      )}
    </>
  );
}

function SettingsPage({ data, refresh }: { data: AnyRow | null; refresh: () => void }) {
  const s = { ...(data?.settings || {}), name: data?.settings?.displayName };
  const [dialog, setDialog] = useState(false);
  const [, setLoc] = useLocation();
  const [prefs, setPrefs] = useState({
    certificationExpiry: s.notifications?.certificationExpiry ?? true,
    trainingReminders: s.notifications?.trainingReminders ?? true,
    skillGapAlerts: s.notifications?.skillGapAlerts ?? true,
    weeklySummary: s.notifications?.weeklySummary ?? false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const savePrefs = async () => {
    try {
      await saveSettings({ ...s, notifications: prefs } as AppSettings);
      toast.success('Preferences saved');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save preferences.');
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Workspace administration"
        title="Settings"
        subtitle="Manage your organization profile and the updates your team receives."
        action={
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('skilltrack:request-signout'));
            }}
            className="dynamic-btn rounded-xl border border-white/15 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-rose-400 hover:border-rose-500/30 transition shadow-xs cursor-pointer"
          >
            Sign out
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <Panel className="p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-[Manrope] text-base font-extrabold text-white">Organization</h2>
              <p className="mt-1 text-xs text-slate-400">Workspace identity and contact details</p>
            </div>
            <Button secondary onClick={() => setDialog(true)}>Edit details</Button>
          </div>

          <div className="mt-5 rounded-xl bg-slate-950/70 border border-white/10 p-4 dynamic-box hover:border-orange-500/40">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#F26207]">
                <BriefcaseBusiness size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{s.organizationName || 'Northstar Group'}</div>
                <div className="mt-1 text-[10px] text-slate-400">SkillTrack Enterprise Workspace</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-[.12em] text-slate-400">Workspace owner</div>
                <div className="mt-1 text-xs text-slate-200">{s.name || 'Avery Morgan'}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-[.12em] text-slate-400">Contact email</div>
                <div className="mt-1 break-all text-xs text-slate-200">{s.email || 'avery.morgan@northstar.io'}</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 md:p-6">
          <h2 className="font-[Manrope] text-base font-extrabold text-white">Preferences</h2>
          <p className="mt-1 text-xs text-slate-400">Control the signals that keep your team informed.</p>
          <div className="mt-4 divide-y divide-white/5">
            {(
              [
                ['certificationExpiry', 'Certification expiry reminders', 'Get ahead of credentials that need renewal'],
                ['trainingReminders', 'Training reminders', 'Nudge learners when due dates approach'],
                ['skillGapAlerts', 'Skill gap alerts', 'Keep priority development needs visible'],
                ['weeklySummary', 'Weekly learning digest', 'A Monday overview of course progress'],
              ] as [keyof typeof prefs, string, string][]
            ).map(([key, title, detail]) => (
              <label key={key} className="flex cursor-pointer items-center gap-4 py-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <span className="flex-1">
                  <span className="block text-xs font-bold text-white">{title}</span>
                  <span className="mt-1 block text-[10px] text-slate-400">{detail}</span>
                </span>
                <input
                  data-testid={`toggle-${key}`}
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={() => toggle(key)}
                  className="h-4 w-4 accent-[#F26207] rounded cursor-pointer"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => void savePrefs()}>Save preferences</Button>
          </div>
        </Panel>

        <Panel className="p-5 md:p-6 xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-[Manrope] text-base font-extrabold text-white flex items-center gap-2">
                <Download size={18} className="text-[#F26207]" /> Data & File Exports
              </h2>
              <p className="mt-1 text-xs text-slate-400">Download and backup your workforce records anytime as spreadsheets or JSON.</p>
            </div>
            <Button
              onClick={() => {
                exportJson(`skilltrack-full-backup-${new Date().toISOString().slice(0, 10)}.json`, data);
                toast.success('Complete workspace backup downloaded as JSON');
              }}
            >
              <Download size={15} /> Download Full Backup (JSON)
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => {
                const emps = arr(data, 'employees', 'people');
                const rows = emps.map((e) => [
                  e.employeeId || e.id || '',
                  nameOf(e),
                  e.email || '',
                  e.jobRole || '',
                  e.department || '',
                  e.location || '',
                  e.status || 'Active',
                  e.manager || '',
                  e.joiningDate || '',
                ]);
                exportCsv(`skilltrack-employees-${new Date().toISOString().slice(0, 10)}.csv`, ['Employee ID', 'Full Name', 'Email', 'Role', 'Department', 'Location', 'Status', 'Manager', 'Joining Date'], rows);
                toast.success('Employees CSV downloaded');
              }}
              className="dynamic-btn flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-800/80 hover:border-orange-500/40 text-left transition cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white">Employees Directory</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spreadsheet (.CSV)</div>
              </div>
              <Download size={14} className="text-orange-400" />
            </button>

            <button
              onClick={() => {
                const certs = arr(data, 'certifications');
                const emps = arr(data, 'employees', 'people');
                const rows = certs.map((c) => [
                  c.name || '',
                  c.provider || '',
                  c.employeeName || emps.find((e) => String(e.id ?? e.employeeId) === String(c.employeeId))?.fullName || '',
                  c.issueDate || '',
                  c.expiryDate || '',
                ]);
                exportCsv(`skilltrack-certifications-${new Date().toISOString().slice(0, 10)}.csv`, ['Certification Name', 'Provider', 'Employee', 'Issue Date', 'Expiry Date'], rows);
                toast.success('Certifications CSV downloaded');
              }}
              className="dynamic-btn flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-800/80 hover:border-orange-500/40 text-left transition cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white">Certifications Register</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spreadsheet (.CSV)</div>
              </div>
              <Download size={14} className="text-orange-400" />
            </button>

            <button
              onClick={() => {
                const skills = arr(data, 'skills');
                const rows = skills.map((s) => [s.id || '', s.name || '', s.category || '', s.description || '']);
                exportCsv(`skilltrack-skills-${new Date().toISOString().slice(0, 10)}.csv`, ['Skill ID', 'Skill Name', 'Category', 'Description'], rows);
                toast.success('Skills CSV downloaded');
              }}
              className="dynamic-btn flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-800/80 hover:border-orange-500/40 text-left transition cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white">Skills Matrix</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spreadsheet (.CSV)</div>
              </div>
              <Download size={14} className="text-orange-400" />
            </button>

            <button
              onClick={() => {
                const courses = arr(data, 'courses');
                const rows = courses.map((c) => [c.id || '', c.name || '', c.category || '', c.instructor || '', c.duration || '', c.description || '']);
                exportCsv(`skilltrack-training-${new Date().toISOString().slice(0, 10)}.csv`, ['Course ID', 'Course Name', 'Category', 'Instructor', 'Duration', 'Description'], rows);
                toast.success('Training Courses CSV downloaded');
              }}
              className="dynamic-btn flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-800/80 hover:border-orange-500/40 text-left transition cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white">Training Catalogue</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spreadsheet (.CSV)</div>
              </div>
              <Download size={14} className="text-orange-400" />
            </button>
          </div>
        </Panel>
      </div>

      {dialog && <RecordDialog kind="settings" initial={s} close={() => setDialog(false)} data={data} refresh={refresh} />}
    </>
  );
}

function LoadingPage() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="mb-8 h-8 w-64 rounded bg-slate-800" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((x) => (
          <div key={x} className="h-28 rounded-2xl bg-slate-900 border border-white/5" />
        ))}
      </div>
      <div className="mt-5 h-72 rounded-2xl bg-slate-900 border border-white/5" />
    </div>
  );
}

function ErrorPanel({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-slate-900 p-8 text-white shadow-xl">
      <div className="font-[Manrope] font-bold text-rose-400">Workspace data unavailable</div>
      <p className="mt-2 text-sm text-slate-300">{error}</p>
      <button onClick={retry} className="dynamic-btn mt-4 rounded-xl btn-primary-orange px-4 py-2 text-xs font-bold text-white cursor-pointer">
        Retry
      </button>
    </div>
  );
}

export function WorkspacePages() {
  const { data, error, loading, refresh } = useWorkspace();
  const [path] = useLocation();

  if (path === '/auth' || path === '/auth/signup' || path === '/login' || path === '/signup') return <LoginPage />;
  if (loading) return <LoadingPage />;
  if (error) return <ErrorPanel error={error} retry={refresh} />;

  let page;
  if (path === '/dashboard') page = <Dashboard data={data} loading={loading} error={error} refresh={refresh} />;
  else if (path === '/employees') page = <Employees data={data} refresh={refresh} />;
  else if (path.startsWith('/employees/')) page = <EmployeeProfile data={data} refresh={refresh} />;
  else if (path === '/skills') page = <Skills data={data} refresh={refresh} />;
  else if (path === '/certifications') page = <Certifications data={data} refresh={refresh} />;
  else if (path === '/training') page = <Training data={data} refresh={refresh} />;
  else if (path.startsWith('/training/')) page = <CourseDetail data={data} refresh={refresh} />;
  else if (path === '/skill-gaps') page = <SkillGaps data={data} refresh={refresh} />;
  else if (path === '/analytics') page = <Analytics data={data} />;
  else if (path === '/settings') page = <SettingsPage data={data} refresh={refresh} />;
  else page = <Dashboard data={data} loading={loading} error={error} refresh={refresh} />;

  return <>{page}</>;
}
