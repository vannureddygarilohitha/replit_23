import type { WorkspaceData } from "./types";

const today = new Date();
const inDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const employees: WorkspaceData["employees"] = [
  { id: "emp-a1", employeeId: "EMP001", fullName: "Ananya Sharma", email: "ananya.sharma@northstar.io", phone: "+91 98765 41021", department: "Engineering", jobRole: "Frontend Developer", joiningDate: "2022-03-14", manager: "Vikram Desai", location: "Bengaluru", status: "Active" },
  { id: "emp-a2", employeeId: "EMP002", fullName: "Rahul Kumar", email: "rahul.kumar@northstar.io", phone: "+91 98765 41022", department: "Engineering", jobRole: "Backend Developer", joiningDate: "2021-08-09", manager: "Vikram Desai", location: "Hyderabad", status: "Active" },
  { id: "emp-a3", employeeId: "EMP003", fullName: "Priya Reddy", email: "priya.reddy@northstar.io", phone: "+91 98765 41023", department: "People & Culture", jobRole: "HR Specialist", joiningDate: "2023-01-23", manager: "Meera Iyer", location: "Hyderabad", status: "Active" },
  { id: "emp-a4", employeeId: "EMP004", fullName: "Arjun Mehta", email: "arjun.mehta@northstar.io", phone: "+91 98765 41024", department: "Engineering", jobRole: "Data Analyst", joiningDate: "2022-11-07", manager: "Nikhil Rao", location: "Pune", status: "Active" },
  { id: "emp-a5", employeeId: "EMP005", fullName: "Sneha Rao", email: "sneha.rao@northstar.io", phone: "+91 98765 41025", department: "Marketing", jobRole: "Marketing Executive", joiningDate: "2024-02-19", manager: "Kavya Nair", location: "Bengaluru", status: "Active" },
  { id: "emp-a6", employeeId: "EMP006", fullName: "Vikram Desai", email: "vikram.desai@northstar.io", phone: "+91 98765 41026", department: "Engineering", jobRole: "Engineering Manager", joiningDate: "2020-05-11", manager: "Nikhil Rao", location: "Bengaluru", status: "Active" },
  { id: "emp-a7", employeeId: "EMP007", fullName: "Kavya Nair", email: "kavya.nair@northstar.io", phone: "+91 98765 41027", department: "Marketing", jobRole: "Growth Lead", joiningDate: "2021-04-26", manager: "Meera Iyer", location: "Mumbai", status: "Active" },
  { id: "emp-a8", employeeId: "EMP008", fullName: "Rohan Kapoor", email: "rohan.kapoor@northstar.io", phone: "+91 98765 41028", department: "Finance", jobRole: "Financial Analyst", joiningDate: "2023-07-17", manager: "Nikhil Rao", location: "Pune", status: "Active" },
  { id: "emp-a9", employeeId: "EMP009", fullName: "Meera Iyer", email: "meera.iyer@northstar.io", phone: "+91 98765 41029", department: "People & Culture", jobRole: "People Operations Lead", joiningDate: "2019-10-03", manager: "Nikhil Rao", location: "Bengaluru", status: "Active" },
  { id: "emp-a10", employeeId: "EMP010", fullName: "Aditya Joshi", email: "aditya.joshi@northstar.io", phone: "+91 98765 41030", department: "Operations", jobRole: "Operations Specialist", joiningDate: "2022-01-31", manager: "Nikhil Rao", location: "Chennai", status: "Active" },
  { id: "emp-a11", employeeId: "EMP011", fullName: "Neha Bansal", email: "neha.bansal@northstar.io", phone: "+91 98765 41031", department: "Finance", jobRole: "Finance Manager", joiningDate: "2020-09-14", manager: "Nikhil Rao", location: "Hyderabad", status: "On leave" },
  { id: "emp-a12", employeeId: "EMP012", fullName: "Karan Malhotra", email: "karan.malhotra@northstar.io", phone: "+91 98765 41032", department: "Operations", jobRole: "Security Engineer", joiningDate: "2023-04-10", manager: "Vikram Desai", location: "Bengaluru", status: "Active" },
];

const skills: WorkspaceData["skills"] = [
  { id: "skill-react", name: "React", category: "Technical", description: "Building responsive interfaces with React." },
  { id: "skill-typescript", name: "TypeScript", category: "Technical", description: "Typed JavaScript development and application design." },
  { id: "skill-python", name: "Python", category: "Technical", description: "Python programming for services, automation and analytics." },
  { id: "skill-data", name: "Data Analytics", category: "Technical", description: "Turning business data into useful insights." },
  { id: "skill-cloud", name: "Cloud Computing", category: "Technical", description: "Designing and operating secure cloud services." },
  { id: "skill-sql", name: "SQL", category: "Technical", description: "Querying and modeling relational data." },
  { id: "skill-aws", name: "AWS", category: "Tools", description: "Working with core Amazon Web Services." },
  { id: "skill-communication", name: "Communication", category: "Soft Skill", description: "Clear written, verbal and cross-team communication." },
  { id: "skill-leadership", name: "Leadership", category: "Leadership", description: "Coaching teams and setting a shared direction." },
  { id: "skill-project", name: "Project Management", category: "Management", description: "Planning delivery, risks and stakeholder alignment." },
  { id: "skill-cyber", name: "Cybersecurity", category: "Domain", description: "Protecting systems, data and business operations." },
  { id: "skill-ux", name: "UX Research", category: "Domain", description: "Research methods for understanding user needs." },
];

const employeeSkills: WorkspaceData["employeeSkills"] = [
  { id: "es-1", employeeId: "emp-a1", skillId: "skill-react", level: "Advanced", proficiency: 92 },
  { id: "es-2", employeeId: "emp-a1", skillId: "skill-typescript", level: "Intermediate", proficiency: 72 },
  { id: "es-3", employeeId: "emp-a1", skillId: "skill-communication", level: "Advanced", proficiency: 85 },
  { id: "es-4", employeeId: "emp-a1", skillId: "skill-ux", level: "Intermediate", proficiency: 68 },
  { id: "es-5", employeeId: "emp-a2", skillId: "skill-python", level: "Advanced", proficiency: 88 },
  { id: "es-6", employeeId: "emp-a2", skillId: "skill-sql", level: "Advanced", proficiency: 86 },
  { id: "es-7", employeeId: "emp-a2", skillId: "skill-cloud", level: "Basic", proficiency: 42 },
  { id: "es-8", employeeId: "emp-a2", skillId: "skill-communication", level: "Intermediate", proficiency: 68 },
  { id: "es-9", employeeId: "emp-a3", skillId: "skill-communication", level: "Advanced", proficiency: 91 },
  { id: "es-10", employeeId: "emp-a3", skillId: "skill-project", level: "Intermediate", proficiency: 73 },
  { id: "es-11", employeeId: "emp-a3", skillId: "skill-leadership", level: "Intermediate", proficiency: 64 },
  { id: "es-12", employeeId: "emp-a4", skillId: "skill-python", level: "Advanced", proficiency: 89 },
  { id: "es-13", employeeId: "emp-a4", skillId: "skill-data", level: "Advanced", proficiency: 93 },
  { id: "es-14", employeeId: "emp-a4", skillId: "skill-sql", level: "Advanced", proficiency: 87 },
  { id: "es-15", employeeId: "emp-a5", skillId: "skill-communication", level: "Advanced", proficiency: 84 },
  { id: "es-16", employeeId: "emp-a5", skillId: "skill-data", level: "Intermediate", proficiency: 70 },
  { id: "es-17", employeeId: "emp-a5", skillId: "skill-project", level: "Intermediate", proficiency: 66 },
  { id: "es-18", employeeId: "emp-a6", skillId: "skill-leadership", level: "Expert", proficiency: 96 },
  { id: "es-19", employeeId: "emp-a6", skillId: "skill-cloud", level: "Advanced", proficiency: 88 },
  { id: "es-20", employeeId: "emp-a6", skillId: "skill-communication", level: "Advanced", proficiency: 91 },
  { id: "es-21", employeeId: "emp-a7", skillId: "skill-data", level: "Advanced", proficiency: 83 },
  { id: "es-22", employeeId: "emp-a7", skillId: "skill-leadership", level: "Advanced", proficiency: 85 },
  { id: "es-23", employeeId: "emp-a7", skillId: "skill-communication", level: "Advanced", proficiency: 89 },
  { id: "es-24", employeeId: "emp-a8", skillId: "skill-data", level: "Intermediate", proficiency: 74 },
  { id: "es-25", employeeId: "emp-a8", skillId: "skill-sql", level: "Intermediate", proficiency: 68 },
  { id: "es-26", employeeId: "emp-a8", skillId: "skill-python", level: "Basic", proficiency: 48 },
  { id: "es-27", employeeId: "emp-a9", skillId: "skill-leadership", level: "Expert", proficiency: 94 },
  { id: "es-28", employeeId: "emp-a9", skillId: "skill-communication", level: "Expert", proficiency: 97 },
  { id: "es-29", employeeId: "emp-a9", skillId: "skill-project", level: "Advanced", proficiency: 88 },
  { id: "es-30", employeeId: "emp-a10", skillId: "skill-project", level: "Advanced", proficiency: 82 },
  { id: "es-31", employeeId: "emp-a10", skillId: "skill-communication", level: "Intermediate", proficiency: 71 },
  { id: "es-32", employeeId: "emp-a11", skillId: "skill-data", level: "Advanced", proficiency: 87 },
  { id: "es-33", employeeId: "emp-a11", skillId: "skill-leadership", level: "Advanced", proficiency: 83 },
  { id: "es-34", employeeId: "emp-a12", skillId: "skill-cyber", level: "Advanced", proficiency: 91 },
  { id: "es-35", employeeId: "emp-a12", skillId: "skill-cloud", level: "Intermediate", proficiency: 70 },
];

const courses: WorkspaceData["courses"] = [
  { id: "course-react", name: "React Advanced Development", description: "Patterns for scalable, accessible React applications.", instructor: "Northstar Engineering", duration: "6 weeks", category: "Technical", requiredSkills: ["React", "TypeScript"] },
  { id: "course-cloud", name: "AWS Solutions Architect Fundamentals", description: "Core cloud architecture, security and cost principles.", instructor: "Learning Hub", duration: "8 weeks", category: "Technical", requiredSkills: ["Cloud Computing", "AWS"] },
  { id: "course-python", name: "Advanced Python for Data Professionals", description: "Production Python patterns for modern analytics teams.", instructor: "Data Guild", duration: "5 weeks", category: "Technical", requiredSkills: ["Python", "Data Analytics"] },
  { id: "course-leadership", name: "Leadership Essentials", description: "Build the habits that help teams do their best work.", instructor: "People & Culture", duration: "4 weeks", category: "Leadership", requiredSkills: ["Leadership", "Communication"] },
  { id: "course-communication", name: "Effective Communication", description: "Practical communication skills for distributed teams.", instructor: "Learning Hub", duration: "3 weeks", category: "Soft Skill", requiredSkills: ["Communication"] },
  { id: "course-cyber", name: "Cybersecurity Awareness", description: "Everyday security practices for modern workplaces.", instructor: "Security Office", duration: "2 weeks", category: "Domain", requiredSkills: ["Cybersecurity"] },
];

const certifications: WorkspaceData["certifications"] = [
  { id: "cert-1", employeeId: "emp-a1", name: "Google Data Analytics", provider: "Google", issueDate: "2025-11-05", expiryDate: inDays(28) },
  { id: "cert-2", employeeId: "emp-a2", name: "AWS Cloud Practitioner", provider: "Amazon Web Services", issueDate: "2025-10-20", expiryDate: inDays(14) },
  { id: "cert-3", employeeId: "emp-a4", name: "Microsoft Azure Fundamentals", provider: "Microsoft", issueDate: "2025-12-08", expiryDate: inDays(45) },
  { id: "cert-4", employeeId: "emp-a6", name: "AWS Solutions Architect", provider: "Amazon Web Services", issueDate: "2024-10-10", expiryDate: "2026-10-01" },
  { id: "cert-5", employeeId: "emp-a12", name: "CompTIA Security+", provider: "CompTIA", issueDate: "2025-06-14", expiryDate: "2027-06-14" },
  { id: "cert-6", employeeId: "emp-a3", name: "SHRM Certified Professional", provider: "SHRM", issueDate: "2025-03-20", expiryDate: "2027-03-20" },
  { id: "cert-7", employeeId: "emp-a7", name: "Google Analytics Certification", provider: "Google", issueDate: "2025-09-01", expiryDate: "2027-09-01" },
  { id: "cert-8", employeeId: "emp-a8", name: "Microsoft Power BI Data Analyst", provider: "Microsoft", issueDate: "2025-02-13", expiryDate: "2027-02-13" },
  { id: "cert-9", employeeId: "emp-a5", name: "HubSpot Content Marketing", provider: "HubSpot", issueDate: "2025-08-23", expiryDate: "2026-10-25" },
  { id: "cert-10", employeeId: "emp-a11", name: "CFA Investment Foundations", provider: "CFA Institute", issueDate: "2024-05-16", expiryDate: "2026-09-15" },
  { id: "cert-11", employeeId: "emp-a9", name: "SHRM Senior Certified Professional", provider: "SHRM", issueDate: "2024-12-01", expiryDate: "2027-12-01" },
];

const enrollments: WorkspaceData["enrollments"] = [
  { id: "en-1", employeeId: "emp-a1", courseId: "course-react", progress: 72, dueDate: inDays(18), status: "In progress" },
  { id: "en-2", employeeId: "emp-a2", courseId: "course-cloud", progress: 35, dueDate: inDays(24), status: "In progress" },
  { id: "en-3", employeeId: "emp-a3", courseId: "course-leadership", progress: 100, dueDate: inDays(-8), status: "Completed" },
  { id: "en-4", employeeId: "emp-a4", courseId: "course-python", progress: 54, dueDate: inDays(12), status: "In progress" },
  { id: "en-5", employeeId: "emp-a5", courseId: "course-communication", progress: 100, dueDate: inDays(-14), status: "Completed" },
  { id: "en-6", employeeId: "emp-a8", courseId: "course-python", progress: 20, dueDate: inDays(-3), status: "In progress" },
  { id: "en-7", employeeId: "emp-a10", courseId: "course-cyber", progress: 0, dueDate: inDays(8), status: "Not started" },
  { id: "en-8", employeeId: "emp-a12", courseId: "course-cyber", progress: 82, dueDate: inDays(10), status: "In progress" },
  { id: "en-9", employeeId: "emp-a7", courseId: "course-leadership", progress: 100, dueDate: inDays(-5), status: "Completed" },
];

const gaps: WorkspaceData["gaps"] = [
  { id: "gap-1", employeeId: "emp-a2", skillId: "skill-cloud", currentLevel: "Basic", requiredLevel: "Advanced", priority: "Critical", recommendedCourse: "AWS Solutions Architect Fundamentals", resolved: false },
  { id: "gap-2", employeeId: "emp-a1", skillId: "skill-typescript", currentLevel: "Intermediate", requiredLevel: "Advanced", priority: "High", recommendedCourse: "React Advanced Development", resolved: false },
  { id: "gap-3", employeeId: "emp-a8", skillId: "skill-python", currentLevel: "Basic", requiredLevel: "Intermediate", priority: "High", recommendedCourse: "Advanced Python for Data Professionals", resolved: false },
  { id: "gap-4", employeeId: "emp-a3", skillId: "skill-leadership", currentLevel: "Intermediate", requiredLevel: "Advanced", priority: "Medium", recommendedCourse: "Leadership Essentials", resolved: false },
  { id: "gap-5", employeeId: "emp-a10", skillId: "skill-communication", currentLevel: "Intermediate", requiredLevel: "Advanced", priority: "Medium", recommendedCourse: "Effective Communication", resolved: false },
  { id: "gap-6", employeeId: "emp-a12", skillId: "skill-cloud", currentLevel: "Intermediate", requiredLevel: "Advanced", priority: "Low", recommendedCourse: "AWS Solutions Architect Fundamentals", resolved: true },
];

const activities: WorkspaceData["activities"] = [
  { id: "act-1", employeeId: "emp-a1", message: "Ananya completed React Advanced certification", createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), type: "certification" },
  { id: "act-2", employeeId: "emp-a2", message: "Rahul enrolled in AWS Cloud Fundamentals", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: "training" },
  { id: "act-3", employeeId: "emp-a3", message: "Priya's leadership skill gap was updated", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), type: "skill-gap" },
  { id: "act-4", employeeId: "emp-a4", message: "Arjun completed Leadership Essentials training", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: "training" },
  { id: "act-5", employeeId: "emp-a5", message: "Sneha's Google certification expires soon", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: "certification" },
];

export const demoWorkspace: WorkspaceData = {
  employees,
  skills,
  employeeSkills,
  certifications,
  courses,
  enrollments,
  gaps,
  activities,
  settings: {
    displayName: "HR Admin",
    email: "hr.admin@northstar.io",
    phone: "+91 98765 41000",
    location: "Bengaluru",
    organizationName: "Northstar",
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
  },
  source: "demo",
};
