import { createClient, type Session, type User } from "@supabase/supabase-js";
import { demoWorkspace } from "./demo-data";
import type {
  AppSettings,
  Certification,
  CertificationInput,
  Course,
  CourseInput,
  Employee,
  EmployeeInput,
  EmployeeSkill,
  Enrollment,
  Skill,
  SkillGap,
  SkillInput,
  WorkspaceData,
} from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;
const MODE_KEY = "skilltrack-data-mode-v1";
const DEMO_KEY = "skilltrack-demo-workspace-v1";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
const supabase =
  isSupabaseConfigured && supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

function setMode(mode: "demo" | "supabase") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent("skilltrack:data-mode", { detail: mode }));
}

export function getDataMode(): "demo" | "supabase" {
  if (typeof window === "undefined") return "demo";
  return window.localStorage.getItem(MODE_KEY) === "supabase" && supabase
    ? "supabase"
    : "demo";
}

export function useDemoMode() {
  setMode("demo");
}

export async function getAuthSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void,
): () => void {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<Session> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (!data.session) throw new Error("Sign-in did not return an active session.");
  setMode("supabase");
  return data.session;
}

export async function signUpWithPassword(
  email: string,
  password: string,
  profile: { displayName: string; organizationName: string },
) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: profile.displayName,
        organization_name: profile.organizationName,
      },
    },
  });
  if (error) throw error;
  if (data.session) setMode("supabase");
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  setMode("demo");
}

function cloneDemo(): WorkspaceData {
  return structuredClone(demoWorkspace);
}

function readDemo(): WorkspaceData {
  if (typeof window === "undefined") return cloneDemo();
  const stored = window.localStorage.getItem(DEMO_KEY);
  if (!stored) return cloneDemo();
  try {
    const parsed = JSON.parse(stored) as WorkspaceData;
    if (!Array.isArray(parsed.employees) || !Array.isArray(parsed.skills)) {
      return cloneDemo();
    }
    return { ...parsed, source: "demo" };
  } catch {
    window.localStorage.removeItem(DEMO_KEY);
    return cloneDemo();
  }
}

function writeDemo(data: WorkspaceData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DEMO_KEY,
    JSON.stringify({ ...data, source: "demo" }),
  );
  window.dispatchEvent(new Event("skilltrack:workspace-change"));
}

function changeDemo<T>(change: (data: WorkspaceData) => T): T {
  const data = readDemo();
  const result = change(data);
  writeDemo(data);
  return result;
}

function throwIfError(error: { message: string } | null): void {
  if (error) {
    const message = error.message.includes("Could not find the function")
      ? "The SkillTrack database setup has not been applied yet. Run supabase/schema.sql in your Supabase SQL Editor, then reload."
      : error.message;
    throw new Error(message);
  }
}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

async function currentUser(): Promise<User> {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  throwIfError(error);
  if (!data.user) throw new Error("Your session has ended. Please sign in again.");
  return data.user;
}

const defaultSettings = (user?: User): AppSettings => ({
  displayName:
    String(user?.user_metadata?.display_name ?? "").trim() || "HR Admin",
  email: user?.email ?? "",
  phone: "",
  location: "",
  organizationName:
    String(user?.user_metadata?.organization_name ?? "").trim() || "My organization",
  notifications: {
    certificationExpiry: true,
    trainingReminders: true,
    skillGapAlerts: true,
    weeklySummary: false,
  },
  trainingPreferences: {
    reminderDaysBeforeDue: 7,
    defaultCourseVisibility: "all",
  },
});

export async function loadWorkspaceData(): Promise<WorkspaceData> {
  if (getDataMode() === "demo" || !supabase) return readDemo();

  const user = await currentUser();
  const client = requireSupabase();
  const { data: employeeRows, error: employeeError } = await client
    .from("employees")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);
  throwIfError(employeeError);
  if (!employeeRows?.length) {
    const { error } = await client.rpc("seed_skilltrack_demo");
    throwIfError(error);
  }

  const [
    employeesResult,
    skillsResult,
    employeeSkillsResult,
    certificationsResult,
    coursesResult,
    enrollmentsResult,
    gapsResult,
    activitiesResult,
    profileResult,
  ] = await Promise.all([
    client.from("employees").select("*").eq("user_id", user.id).order("full_name"),
    client.from("skills").select("*").eq("user_id", user.id).order("name"),
    client.from("employee_skills").select("*").eq("user_id", user.id),
    client.from("certifications").select("*").eq("user_id", user.id).order("expiry_date"),
    client.from("training_courses").select("*").eq("user_id", user.id).order("name"),
    client.from("training_enrollments").select("*").eq("user_id", user.id),
    client.from("skill_gaps").select("*").eq("user_id", user.id).order("priority"),
    client.from("activities").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    client.from("skilltrack_profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  for (const result of [
    employeesResult,
    skillsResult,
    employeeSkillsResult,
    certificationsResult,
    coursesResult,
    enrollmentsResult,
    gapsResult,
    activitiesResult,
    profileResult,
  ]) {
    throwIfError(result.error);
  }

  const row = profileResult.data;
  const settings: AppSettings = row
    ? {
        displayName: row.display_name ?? "HR Admin",
        email: user.email ?? "",
        phone: row.phone ?? "",
        location: row.location ?? "",
        organizationName: row.organization_name ?? "My organization",
        notifications: {
          ...defaultSettings(user).notifications,
          ...(row.notifications ?? {}),
        },
        trainingPreferences: {
          ...defaultSettings(user).trainingPreferences,
          ...(row.training_preferences ?? {}),
        },
      }
    : defaultSettings(user);

  return {
    employees: (employeesResult.data ?? []).map((item) => ({
      id: item.id,
      employeeId: item.employee_id,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone ?? "",
      department: item.department,
      jobRole: item.job_role,
      joiningDate: item.joining_date,
      manager: item.manager ?? "",
      location: item.location ?? "",
      status: item.status,
    })),
    skills: (skillsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description ?? "",
    })),
    employeeSkills: (employeeSkillsResult.data ?? []).map((item) => ({
      id: item.id,
      employeeId: item.employee_id,
      skillId: item.skill_id,
      level: item.level,
      proficiency: item.proficiency,
    })),
    certifications: (certificationsResult.data ?? []).map((item) => ({
      id: item.id,
      employeeId: item.employee_id,
      name: item.name,
      provider: item.provider,
      issueDate: item.issue_date,
      expiryDate: item.expiry_date,
    })),
    courses: (coursesResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      instructor: item.instructor ?? "",
      duration: item.duration ?? "",
      category: item.category,
      requiredSkills: item.required_skills ?? [],
    })),
    enrollments: (enrollmentsResult.data ?? []).map((item) => ({
      id: item.id,
      employeeId: item.employee_id,
      courseId: item.course_id,
      progress: item.progress,
      dueDate: item.due_date,
      status: item.status,
    })),
    gaps: (gapsResult.data ?? []).map((item) => ({
      id: item.id,
      employeeId: item.employee_id,
      skillId: item.skill_id,
      currentLevel: item.current_level,
      requiredLevel: item.required_level,
      priority: item.priority,
      recommendedCourse: item.recommended_course ?? "",
      resolved: item.resolved,
    })),
    activities: (activitiesResult.data ?? []).map((item) => ({
      id: item.id,
      employeeId: item.employee_id ?? undefined,
      message: item.message,
      createdAt: item.created_at,
      type: item.type,
    })),
    settings,
    source: "supabase",
  };
}

export async function saveEmployee(input: EmployeeInput): Promise<Employee> {
  if (getDataMode() === "demo" || !supabase) {
    return changeDemo((data) => {
      const index = input.id
        ? data.employees.findIndex((item) => item.id === input.id)
        : -1;
      const employee = { ...input, id: input.id ?? `emp-${crypto.randomUUID()}` };
      if (index >= 0) data.employees[index] = employee;
      else data.employees.unshift(employee);
      return employee;
    });
  }
  const user = await currentUser();
  const client = requireSupabase();
  const payload = {
    user_id: user.id,
    employee_id: input.employeeId,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    department: input.department,
    job_role: input.jobRole,
    joining_date: input.joiningDate,
    manager: input.manager,
    location: input.location,
    status: input.status,
  };
  const query = input.id
    ? client.from("employees").update(payload).eq("id", input.id).eq("user_id", user.id)
    : client.from("employees").insert(payload);
  const { data, error } = await query.select("*").single();
  throwIfError(error);
  return {
    id: data.id,
    employeeId: data.employee_id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone ?? "",
    department: data.department,
    jobRole: data.job_role,
    joiningDate: data.joining_date,
    manager: data.manager ?? "",
    location: data.location ?? "",
    status: data.status,
  };
}

export async function deleteEmployee(id: string): Promise<void> {
  if (getDataMode() === "demo" || !supabase) {
    changeDemo((data) => {
      data.employees = data.employees.filter((item) => item.id !== id);
      data.employeeSkills = data.employeeSkills.filter((item) => item.employeeId !== id);
      data.certifications = data.certifications.filter((item) => item.employeeId !== id);
      data.enrollments = data.enrollments.filter((item) => item.employeeId !== id);
      data.gaps = data.gaps.filter((item) => item.employeeId !== id);
    });
    return;
  }
  const user = await currentUser();
  const { error } = await requireSupabase()
    .from("employees")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  throwIfError(error);
}

export async function saveSkill(input: SkillInput): Promise<Skill> {
  if (getDataMode() === "demo" || !supabase) {
    return changeDemo((data) => {
      const skill = { ...input, id: input.id ?? `skill-${crypto.randomUUID()}` };
      const index = data.skills.findIndex((item) => item.id === skill.id);
      if (index >= 0) data.skills[index] = skill;
      else data.skills.unshift(skill);
      return skill;
    });
  }
  const user = await currentUser();
  const client = requireSupabase();
  const payload = {
    user_id: user.id,
    name: input.name,
    category: input.category,
    description: input.description,
  };
  const query = input.id
    ? client.from("skills").update(payload).eq("id", input.id).eq("user_id", user.id)
    : client.from("skills").insert(payload);
  const { data, error } = await query.select("*").single();
  throwIfError(error);
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    description: data.description ?? "",
  };
}

export async function saveCertification(
  input: CertificationInput,
): Promise<Certification> {
  if (getDataMode() === "demo" || !supabase) {
    return changeDemo((data) => {
      const certification = {
        ...input,
        id: input.id ?? `cert-${crypto.randomUUID()}`,
      };
      const index = data.certifications.findIndex(
        (item) => item.id === certification.id,
      );
      if (index >= 0) data.certifications[index] = certification;
      else data.certifications.unshift(certification);
      return certification;
    });
  }
  const user = await currentUser();
  const client = requireSupabase();
  const payload = {
    user_id: user.id,
    employee_id: input.employeeId,
    name: input.name,
    provider: input.provider,
    issue_date: input.issueDate,
    expiry_date: input.expiryDate,
  };
  const query = input.id
    ? client.from("certifications").update(payload).eq("id", input.id).eq("user_id", user.id)
    : client.from("certifications").insert(payload);
  const { data, error } = await query.select("*").single();
  throwIfError(error);
  return {
    id: data.id,
    employeeId: data.employee_id,
    name: data.name,
    provider: data.provider,
    issueDate: data.issue_date,
    expiryDate: data.expiry_date,
  };
}

export async function saveCourse(input: CourseInput): Promise<Course> {
  if (getDataMode() === "demo" || !supabase) {
    return changeDemo((data) => {
      const course = { ...input, id: input.id ?? `course-${crypto.randomUUID()}` };
      const index = data.courses.findIndex((item) => item.id === course.id);
      if (index >= 0) data.courses[index] = course;
      else data.courses.unshift(course);
      return course;
    });
  }
  const user = await currentUser();
  const client = requireSupabase();
  const payload = {
    user_id: user.id,
    name: input.name,
    description: input.description,
    instructor: input.instructor,
    duration: input.duration,
    category: input.category,
    required_skills: input.requiredSkills,
  };
  const query = input.id
    ? client.from("training_courses").update(payload).eq("id", input.id).eq("user_id", user.id)
    : client.from("training_courses").insert(payload);
  const { data, error } = await query.select("*").single();
  throwIfError(error);
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? "",
    instructor: data.instructor ?? "",
    duration: data.duration ?? "",
    category: data.category,
    requiredSkills: data.required_skills ?? [],
  };
}

export async function updateEnrollment(
  id: string,
  progress: number,
): Promise<Enrollment> {
  const boundedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const status =
    boundedProgress === 100
      ? "Completed"
      : boundedProgress > 0
        ? "In progress"
        : "Not started";
  if (getDataMode() === "demo" || !supabase) {
    return changeDemo((data) => {
      const enrollment = data.enrollments.find((item) => item.id === id);
      if (!enrollment) throw new Error("Training enrollment could not be found.");
      enrollment.progress = boundedProgress;
      enrollment.status = status;
      return enrollment;
    });
  }
  const user = await currentUser();
  const { data, error } = await requireSupabase()
    .from("training_enrollments")
    .update({ progress: boundedProgress, status })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();
  throwIfError(error);
  return {
    id: data.id,
    employeeId: data.employee_id,
    courseId: data.course_id,
    progress: data.progress,
    dueDate: data.due_date,
    status: data.status,
  };
}

export async function enrollEmployee(
  employeeId: string,
  courseId: string,
): Promise<Enrollment> {
  const dueDate = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  if (getDataMode() === "demo" || !supabase) {
    return changeDemo((data) => {
      const existing = data.enrollments.find(
        (item) => item.employeeId === employeeId && item.courseId === courseId,
      );
      if (existing) return existing;
      const enrollment: Enrollment = {
        id: `en-${crypto.randomUUID()}`,
        employeeId,
        courseId,
        progress: 0,
        dueDate,
        status: "Not started",
      };
      data.enrollments.unshift(enrollment);
      return enrollment;
    });
  }
  const user = await currentUser();
  const { data, error } = await requireSupabase()
    .from("training_enrollments")
    .upsert(
      {
        user_id: user.id,
        employee_id: employeeId,
        course_id: courseId,
        progress: 0,
        due_date: dueDate,
        status: "Not started",
      },
      { onConflict: "user_id,employee_id,course_id", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();
  throwIfError(error);
  if (data) {
    return {
      id: data.id,
      employeeId: data.employee_id,
      courseId: data.course_id,
      progress: data.progress,
      dueDate: data.due_date,
      status: data.status,
    };
  }
  const { data: existing, error: existingError } = await requireSupabase()
    .from("training_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("employee_id", employeeId)
    .eq("course_id", courseId)
    .single();
  throwIfError(existingError);
  return {
    id: existing.id,
    employeeId: existing.employee_id,
    courseId: existing.course_id,
    progress: existing.progress,
    dueDate: existing.due_date,
    status: existing.status,
  };
}

export async function updateEmployeeSkill(
  employeeId: string,
  skillId: string,
  level: EmployeeSkill["level"],
  proficiency: number,
): Promise<EmployeeSkill> {
  const score = Math.min(100, Math.max(0, Math.round(proficiency)));
  if (getDataMode() === "demo" || !supabase) {
    return changeDemo((data) => {
      const existing = data.employeeSkills.find(
        (item) => item.employeeId === employeeId && item.skillId === skillId,
      );
      if (existing) {
        existing.level = level;
        existing.proficiency = score;
        return existing;
      }
      const employeeSkill = {
        id: `es-${crypto.randomUUID()}`,
        employeeId,
        skillId,
        level,
        proficiency: score,
      };
      data.employeeSkills.push(employeeSkill);
      return employeeSkill;
    });
  }
  const user = await currentUser();
  const { data, error } = await requireSupabase()
    .from("employee_skills")
    .upsert(
      {
        user_id: user.id,
        employee_id: employeeId,
        skill_id: skillId,
        level,
        proficiency: score,
      },
      { onConflict: "user_id,employee_id,skill_id" },
    )
    .select("*")
    .single();
  throwIfError(error);
  return {
    id: data.id,
    employeeId: data.employee_id,
    skillId: data.skill_id,
    level: data.level,
    proficiency: data.proficiency,
  };
}

export async function resolveGap(id: string): Promise<void> {
  if (getDataMode() === "demo" || !supabase) {
    changeDemo((data) => {
      const gap = data.gaps.find((item) => item.id === id);
      if (!gap) throw new Error("Skill gap could not be found.");
      gap.resolved = true;
    });
    return;
  }
  const user = await currentUser();
  const { error } = await requireSupabase()
    .from("skill_gaps")
    .update({ resolved: true })
    .eq("id", id)
    .eq("user_id", user.id);
  throwIfError(error);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (getDataMode() === "demo" || !supabase) {
    changeDemo((data) => {
      data.settings = structuredClone(settings);
    });
    return;
  }
  const user = await currentUser();
  const { error } = await requireSupabase().from("skilltrack_profiles").upsert({
    user_id: user.id,
    display_name: settings.displayName,
    phone: settings.phone,
    location: settings.location,
    organization_name: settings.organizationName,
    notifications: settings.notifications,
    training_preferences: settings.trainingPreferences,
    updated_at: new Date().toISOString(),
  });
  throwIfError(error);
}

export function subscribeWorkspace(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const listener = () => callback();
  window.addEventListener("skilltrack:workspace-change", listener);
  window.addEventListener("skilltrack:data-mode", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("skilltrack:workspace-change", listener);
    window.removeEventListener("skilltrack:data-mode", listener);
    window.removeEventListener("storage", listener);
  };
}
