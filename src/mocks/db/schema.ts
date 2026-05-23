export interface DbUser {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: "admin" | "coordinator" | "teacher" | "student";
  isActive: boolean;
  verificationToken?: string;
}

export interface DbStudent {
  id: string;
  cne: string;
  majorId: string;
  levelId: string;
}

export interface DbTeacher {
  id: string;
  gradeId: string;
  departmentId: string;
}

export interface DbCoordinator {
  id: string;
}

export interface DbDepartment {
  id: string;
  name: string;
  code: string;
  headId?: string;
}

export interface DbSession {
  id: string;
  name: string;
  type: string;
  status: "active" | "draft" | "archived";
  startDate: string;
  endDate: string;
}

export interface DbRoom {
  id: string;
  name: string;
  capacity: number;
  departmentId: string;
}

export interface DbMajor {
  id: string;
  name: string;
}

export interface DbLevel {
  id: string;
  name: string;
}

export interface DbGrade {
  id: string;
  name: string;
}

export type DbDefenseType = "pfe" | "memoire" | "these";

export interface DbDefenseSession {
  id: string;
  globalSessionId: string;
  name: string;
  defenseType: DbDefenseType;
  status: "draft" | "active" | "scheduled" | "completed" | "archived";
  maxGroupSize: number;
  defenseDuration: number;
  breakDuration: number;
  submissionDeadline: string;
  evaluationCoefficients: Record<string, number>;
  juryRoleTemplateId: string;
  startDate: string;
  endDate: string;
}

export interface DbJuryRoleTemplate {
  id: string;
  name: string;
  defenseType: string;
  roles: { name: string; count: number; coefficient: number }[];
}

export interface DbDefenseSettings {
  startTime: string;
  endTime: string;
  defenseDuration: number;
  breakDuration: number;
  groupCreationStartDate: string;
  groupCreationEndDate: string;
}

export interface DbProject {
  id: string;
  title: string;
  description: string;
  supervisorId: string;
  defenseType: DbDefenseType;
  status: "pending" | "approved" | "rejected";
}

export interface DbProjectStudent {
  projectId: string;
  studentId: string;
}

export interface DbJury {
  id: string;
  projectId: string;
  templateId: string;
  members: { roleName: string; teacherId: string }[];
}

export interface DbGroup {
  id: string;
  projectId: string;
  sessionId: string;
}

export interface DbGroupMember {
  groupId: string;
  studentId: string;
}

export interface DbDefense {
  id: string;
  projectId: string;
  defenseType: DbDefenseType;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  status: "scheduled" | "completed";
}

export interface DbDefenseTeacher {
  defenseId: string;
  teacherId: string;
  role: string;
}

export interface DbEvaluation {
  id: string;
  defenseId: string;
  teacherId: string;
  score?: number;
  comment?: string;
  status: "pending" | "submitted";
  submittedAt?: string;
}

export interface DbUnavailability {
  id: string;
  teacherId: string;
  date: string;
  slots: string[];
}

export interface DbStudentGroup {
  id: string;
  groupName: string;
  memberIds: string[];
  projectId: string | null;
}

export interface DbStudentDocument {
  id: string;
  name: string;
  type: string;
  deadline: string;
  status: "submitted" | "missing" | "validated";
  submittedAt?: string;
}

export interface Tables {
  juryRoleTemplates: DbJuryRoleTemplate[];
  users: DbUser[];
  defenseSessions: DbDefenseSession[];
  students: DbStudent[];
  teachers: DbTeacher[];
  coordinators: DbCoordinator[];
  departments: DbDepartment[];
  sessions: DbSession[];
  rooms: DbRoom[];
  majors: DbMajor[];
  levels: DbLevel[];
  grades: DbGrade[];
  defenseSettings: DbDefenseSettings;
  projects: DbProject[];
  projectStudents: DbProjectStudent[];
  juries: DbJury[];
  groups: DbGroup[];
  groupMembers: DbGroupMember[];
  defenses: DbDefense[];
  defenseTeachers: DbDefenseTeacher[];
  evaluations: DbEvaluation[];
  unavailability: DbUnavailability[];
  studentGroups: DbStudentGroup[];
  studentDocuments: DbStudentDocument[];
}
