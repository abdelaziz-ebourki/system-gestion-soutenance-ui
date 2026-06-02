export * from "./users-types";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
  totalRooms: number;
  activeSessions: number;
  upcomingDefenses: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  studentIds: string[];
  studentNames?: string[];
  supervisorId: string;
  supervisorName: string;
  defenseType: DefenseType;
  status: "pending" | "approved" | "rejected";
}

export interface Group {
  id: string;
  projectId: string;
  studentIds: string[];
  sessionId: string;
}

export interface Jury {
  id: string;
  projectId: string;
  projectTitle: string;
  studentNames: string[];
  defenseType: DefenseType;
  templateId: string;
  templateName: string;
  members: JuryMember[];
}

export interface DefenseSlot {
  id: string;
  projectId: string;
  slot: string;
  date: string;
  roomId: string;
}

export interface TeacherStats {
  upcomingDefenses: number;
  pendingEvaluations: number;
  declaredUnavailabilitySlots: number;
  juryAssignments: number;
}

export interface TeacherDefense {
  id: string;
  projectId: string;
  projectTitle: string;
  studentNames: string[];
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  role: "president" | "reporter" | "examiner" | "supervisor";
  status: "scheduled" | "completed";
}

export interface TeacherEvaluation {
  id: string;
  defenseId: string;
  projectTitle: string;
  studentNames: string[];
  role: "president" | "reporter" | "examiner" | "supervisor";
  score?: number;
  comment?: string;
  status: "pending" | "submitted";
  submittedAt?: string;
}

export interface TeacherUnavailability {
  slotsByDate: Record<string, string[]>;
}

export interface StudentStats {
  documentCount: number;
  missingDocuments: number;
  groupMembers: number;
  defenseStatus: "scheduled" | "pending";
}

export interface StudentDefenseDetails {
  projectTitle: string;
  projectDescription?: string;
  supervisorName: string;
  juryMembers: Array<{
    name: string;
    role: string;
  }>;
  date?: string;
  startTime?: string;
  endTime?: string;
  roomName?: string;
  status: "scheduled" | "pending";
  convocationUrl?: string;
  result?: {
    decision: string;
    score?: number;
  };
}

export interface StudentGroupDetails {
  id: string;
  groupName: string;
  projectTitle?: string;
  supervisorName?: string;
  members: Array<{
    id: string;
    fullName: string;
    email: string;
    role: "leader" | "member";
  }>;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: string;
  deadline: string;
  status: "submitted" | "missing" | "validated" | "rejected";
  submittedAt?: string;
}

export type DefenseType = "pfe" | "memoire" | "these";

export type DefenseSessionStatus = "draft" | "active" | "scheduled" | "completed" | "archived";

export interface AppNotification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink?: string;
  actor?: string;
}

export interface JuryRole {
  name: string;
  count: number;
  coefficient: number;
}

export interface JuryRoleTemplate {
  id: string;
  name: string;
  defenseType: string;
  roles: JuryRole[];
}

export interface JuryMember {
  roleName: string;
  role?: string;
  teacherId: string;
  teacherName: string;
}

export interface DefenseSession {
  id: string;
  name: string;
  defenseType: DefenseType;
  status: DefenseSessionStatus;
  maxGroupSize: number;
  defenseDuration: number;
  breakDuration: number;
  submissionDeadline: string;
  evaluationCoefficients: Record<string, number>;
  juryRoleTemplateId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface StudentGroupWorkspace {
  currentGroup: StudentGroupDetails | null;
  availableGroups: Array<{
    id: string;
    groupName: string;
    memberCount: number;
  }>;
  groupCreationStartDate: string;
  groupCreationEndDate: string;
  isGroupCreationOpen: boolean;
}
