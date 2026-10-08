export type SkillLevel =
  | "Beginner"
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export type SkillCategory =
  | "Technical"
  | "Soft Skill"
  | "Leadership"
  | "Domain"
  | "Tools"
  | "Management";

export type EmployeeStatus = "Active" | "On leave" | "Inactive";
export type GapPriority = "Critical" | "High" | "Medium" | "Low";
export type EnrollmentStatus = "Not started" | "In progress" | "Completed";

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobRole: string;
  joiningDate: string;
  manager: string;
  location: string;
  status: EmployeeStatus;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillId: string;
  level: SkillLevel;
  proficiency: number;
}

export interface Certification {
  id: string;
  employeeId: string;
  name: string;
  provider: string;
  issueDate: string;
  expiryDate: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  duration: string;
  category: SkillCategory;
  requiredSkills: string[];
}

export interface Enrollment {
  id: string;
  employeeId: string;
  courseId: string;
  progress: number;
  dueDate: string;
  status: EnrollmentStatus;
}

export interface SkillGap {
  id: string;
  employeeId: string;
  skillId: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  priority: GapPriority;
  recommendedCourse: string;
  resolved: boolean;
}

export interface Activity {
  id: string;
  employeeId?: string;
  message: string;
  createdAt: string;
  type: "certification" | "training" | "skill-gap" | "skill" | "employee";
}

export interface AppSettings {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  organizationName: string;
  notifications: {
    certificationExpiry: boolean;
    trainingReminders: boolean;
    skillGapAlerts: boolean;
    weeklySummary: boolean;
  };
  trainingPreferences: {
    reminderDaysBeforeDue: number;
    defaultCourseVisibility: "all" | "department";
  };
}

export interface WorkspaceData {
  employees: Employee[];
  skills: Skill[];
  employeeSkills: EmployeeSkill[];
  certifications: Certification[];
  courses: Course[];
  enrollments: Enrollment[];
  gaps: SkillGap[];
  activities: Activity[];
  settings: AppSettings;
  source: "demo" | "supabase";
}

export type EmployeeInput = Omit<Employee, "id"> & { id?: string };
export type SkillInput = Omit<Skill, "id"> & { id?: string };
export type CertificationInput = Omit<Certification, "id"> & { id?: string };
export type CourseInput = Omit<Course, "id"> & { id?: string };
