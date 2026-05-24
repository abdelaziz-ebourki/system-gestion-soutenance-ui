import type {
  User, Student,
  Project, Jury,
  TeacherDefense, TeacherEvaluation, TeacherUnavailability,
  StudentGroupDetails, StudentGroupWorkspace, StudentDefenseDetails,
} from "@/types";
import type { AuditLog } from "@/types/audit-log";
import { DEFENSE_SESSION_LIFECYCLE } from "@/lib/constants";
import { createPersisted } from "./persist";
import { users as _users } from "./users";
import { students as _students } from "./students";
import { teachers as _teachers } from "./teachers";
import { coordinators as _coordinators } from "./coordinators";
import { departments as _departments } from "./departments";
import { sessions as _sessions } from "./sessions";
import { rooms as _rooms } from "./rooms";
import { defenseSettings as _defenseSettings } from "./config";
import { defenseSessions as _defenseSessions } from "./defense-sessions";
import { projects as _projects, projectStudents as _projectStudents } from "./projects";
import { juries as _juries } from "./juries";
import { defenses as _defenses, defenseTeachers, evaluations as _evaluations } from "./defenses";
import { groups as _groups, groupMembers as _groupMembers } from "./groups";
import { studentGroups as _studentGroups, studentDocuments as _studentDocuments } from "./student";
import { unavailability as _unavailability } from "./unavailability";
import { notifications as _notifications } from "./notifications";
import { generalSettings, defenseTypeConfig, documentConfig, emailConfig } from "./config";

export { majors, levels, grades, juryRoleTemplates, generalSettings, defenseTypeConfig, documentConfig } from "./config";
export type {
  DbUser, DbStudent, DbTeacher, DbCoordinator,
  DbDepartment, DbSession, DbRoom,
  DbMajor, DbLevel, DbGrade, DbDefenseSession, DbDefenseSettings, DbJuryRoleTemplate,
  DbProject, DbProjectStudent,
  DbJury, DbGroup, DbGroupMember,
  DbDefense, DbDefenseTeacher, DbEvaluation,
  DbUnavailability, DbStudentGroup, DbStudentDocument, DbEmailConfig,
} from "./schema";

export const MOCK_DELAY = Number(import.meta.env.VITE_MOCK_DELAY) || 1000;

export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Mutable table data ───────────────────────────────────────────

export const tblUsers: typeof _users = createPersisted("users", [..._users]);
export const tblStudents: typeof _students = createPersisted("students", [..._students]);
export const tblTeachers: typeof _teachers = createPersisted("teachers", [..._teachers]);
export const tblCoordinators: typeof _coordinators = createPersisted("coordinators", [..._coordinators]);
export const tblDepartments: typeof _departments = createPersisted("departments", [..._departments]);
export const tblSessions: typeof _sessions = createPersisted("sessions", [..._sessions]);
export const tblRooms: typeof _rooms = createPersisted("rooms", [..._rooms]);
export const tblDefenseSessions: typeof _defenseSessions = createPersisted("defenseSessions", [..._defenseSessions]);
export const tblDefenseSettings = createPersisted("defenseSettings", { ..._defenseSettings });
export const tblGeneralSettings = createPersisted("generalSettings", { ...generalSettings });
export const tblDefenseTypeConfig = createPersisted("defenseTypeConfig", { ...defenseTypeConfig });
export const tblDocumentConfig = createPersisted("documentConfig", { ...documentConfig });
export const tblEmailConfig = createPersisted("emailConfig", { ...emailConfig });

export const defenseSettings = tblDefenseSettings;
export const tblProjects: typeof _projects = createPersisted("projects", [..._projects]);
export const tblProjectStudents: typeof _projectStudents = createPersisted("projectStudents", [..._projectStudents]);
export const tblJuries: typeof _juries = createPersisted("juries", [..._juries]);
export const tblDefenses: typeof _defenses = createPersisted("defenses", [..._defenses]);
export const tblDefenseTeachers: typeof defenseTeachers = createPersisted("defenseTeachers", [...defenseTeachers]);
export const tblEvaluations: typeof _evaluations = createPersisted("evaluations", [..._evaluations]);
export const tblGroups: typeof _groups = createPersisted("groups", [..._groups]);
export const tblGroupMembers: typeof _groupMembers = createPersisted("groupMembers", [..._groupMembers]);
export const tblStudentGroups: typeof _studentGroups = createPersisted("studentGroups", [..._studentGroups]);
export const tblStudentDocuments: typeof _studentDocuments = createPersisted("studentDocuments", [..._studentDocuments]);
export const tblUnavailability: typeof _unavailability = createPersisted("unavailability", [..._unavailability]);
export const tblNotifications: typeof _notifications = createPersisted("notifications", [..._notifications]);

  // The demo student ID used for student flows (no seed student anymore)
export const currentStudentId = "std-demo";

// ─── JOIN helpers ──────────────────────────────────────────────────

export function getUserFullName(userId: string): string {
  const user = tblUsers.find((u) => u.id === userId);
  return user ? `${user.lastName} ${user.firstName}` : "Utilisateur inconnu";
}

export function getStudentEmail(studentId: string): string {
  const student = tblUsers.find((u) => u.id === studentId) as Student | undefined;
  return student?.email || "";
}

function resolveStudentNames(studentIds: string[]): string[] {
  return studentIds.map((id) => getUserFullName(id));
}

export function getProjectView(p: typeof _projects[number]): Project {
  const stIds = tblProjectStudents
    .filter((ps) => ps.projectId === p.id)
    .map((ps) => ps.studentId);
  return {
    id: p.id,
    title: p.title,
    description: p.description || undefined,
    studentIds: stIds,
    studentNames: resolveStudentNames(stIds),
    supervisorId: p.supervisorId,
    supervisorName: getUserFullName(p.supervisorId),
    defenseType: p.defenseType,
    status: p.status,
  };
}

export function getAllProjectViews(): Project[] {
  return tblProjects.map(getProjectView);
}

export function getJuryView(j: typeof _juries[number]): Jury {
  const project = tblProjects.find((p) => p.id === j.projectId);
  const template = juryRoleTemplates.find((t) => t.id === j.templateId);
  return {
    id: j.id,
    projectId: j.projectId,
    projectTitle: project?.title ?? "",
    defenseType: (project?.defenseType ?? "pfe") as Jury["defenseType"],
    templateId: j.templateId,
    templateName: template?.name ?? "",
    members: j.members.map((m) => ({
      roleName: m.roleName,
      teacherId: m.teacherId,
      teacherName: getUserFullName(m.teacherId),
    })),
  };
}

export function getAllJuryViews(): Jury[] {
  return tblJuries.map(getJuryView);
}

export function getDefenseView(d: typeof _defenses[number]): TeacherDefense {
  const project = tblProjects.find((p) => p.id === d.projectId);
  const dt = tblDefenseTeachers.find((dt) => dt.defenseId === d.id);
  const stIds = tblProjectStudents
    .filter((ps) => ps.projectId === d.projectId)
    .map((ps) => ps.studentId);
  const room = tblRooms.find((r) => r.id === d.roomId);
  return {
    id: d.id,
    projectId: d.projectId,
    projectTitle: project?.title ?? "",
    studentNames: resolveStudentNames(stIds),
    date: d.date,
    startTime: d.startTime,
    endTime: d.endTime,
    roomName: room?.name ?? "",
    role: dt?.role ?? "supervisor",
    status: d.status,
  };
}

export function getAllDefenseViews(): TeacherDefense[] {
  return tblDefenses.map(getDefenseView);
}

export function getEvaluationView(e: typeof _evaluations[number]): TeacherEvaluation {
  const defense = tblDefenses.find((d) => d.id === e.defenseId);
  const project = defense ? tblProjects.find((p) => p.id === defense.projectId) : undefined;
  const dt = tblDefenseTeachers.find(
    (dt) => dt.defenseId === e.defenseId && dt.teacherId === e.teacherId,
  );
  const stIds = project
    ? tblProjectStudents.filter((ps) => ps.projectId === project.id).map((ps) => ps.studentId)
    : [];
  return {
    id: e.id,
    defenseId: e.defenseId,
    projectTitle: project?.title ?? "",
    studentNames: resolveStudentNames(stIds),
    role: dt?.role ?? "supervisor",
    score: e.score,
    comment: e.comment,
    status: e.status,
    submittedAt: e.submittedAt,
  };
}

export function getAllEvaluationViews(): TeacherEvaluation[] {
  return tblEvaluations.map(getEvaluationView);
}

export function getStudentGroupView(sg: typeof _studentGroups[number]): StudentGroupDetails {
  const project = sg.projectId
    ? tblProjects.find((p) => p.id === sg.projectId)
    : undefined;
  return {
    id: sg.id,
    groupName: sg.groupName,
    projectTitle: project?.title,
    supervisorName: project ? getUserFullName(project.supervisorId) : undefined,
    members: sg.memberIds.map((memberId, idx) => ({
      id: memberId,
      fullName: getUserFullName(memberId),
      email: getStudentEmail(memberId),
      role: idx === 0 ? ("leader" as const) : ("member" as const),
    })),
  };
}

export function getCurrentStudentGroup(): typeof _studentGroups[number] | null {
  return tblStudentGroups.find((g) => g.memberIds.includes(currentStudentId)) ?? null;
}

export function getStudentGroupWorkspace(): StudentGroupWorkspace {
  const currentGroup = getCurrentStudentGroup();
  return {
    currentGroup: currentGroup ? getStudentGroupView(currentGroup) : null,
    availableGroups: tblStudentGroups
      .filter((g) => !g.memberIds.includes(currentStudentId))
      .map((g) => ({
        id: g.id,
        groupName: g.groupName,
        memberCount: g.memberIds.length,
      })),
    groupCreationStartDate: tblDefenseSettings.groupCreationStartDate,
    groupCreationEndDate: tblDefenseSettings.groupCreationEndDate,
    isGroupCreationOpen: isGroupCreationOpen(),
  };
}

export function isGroupCreationOpen(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return (
    today >= tblDefenseSettings.groupCreationStartDate &&
    today <= tblDefenseSettings.groupCreationEndDate
  );
}

export function getStudentDefenseDetails(): StudentDefenseDetails {
  const currentGroup = getCurrentStudentGroup();
  const project = currentGroup?.projectId
    ? tblProjects.find((p) => p.id === currentGroup.projectId)
    : undefined;
  const jury = project
    ? tblJuries.find((j) => j.projectId === project.id)
    : undefined;

  if (!project) {
    return {
      projectTitle: "Aucun projet affecte",
      projectDescription:
        "Creez ou rejoignez un groupe pendant la periode autorisee pour demarrer votre dossier.",
      supervisorName: "En attente",
      juryMembers: [],
      status: "pending",
    };
  }

  const defense = project ? tblDefenses.find((d) => d.projectId === project.id) : undefined;
  const gradeResult = defense ? getDefenseGrade(defense.id) : null;
  const allSubmitted = gradeResult?.individualScores.every((s) => s.score !== undefined) ?? false;

  return {
    projectTitle: project.title,
    projectDescription: project.description,
    supervisorName: getUserFullName(project.supervisorId),
    juryMembers: jury
      ? jury.members.map((m) => ({
          name: getUserFullName(m.teacherId),
          role: m.roleName,
        }))
      : [],
    date: defense?.date ?? undefined,
    startTime: defense?.startTime ?? undefined,
    endTime: defense?.endTime ?? undefined,
    roomName: defense
      ? tblRooms.find((r) => r.id === defense.roomId)?.name ?? undefined
      : undefined,
    status: defense ? "scheduled" as const : "pending" as const,
    convocationUrl: undefined,
    result: gradeResult && allSubmitted && gradeResult.finalScore !== null
      ? {
          decision: gradeResult.finalScore >= 10 ? "Admis" : "Ajourné",
          score: gradeResult.finalScore,
        }
      : undefined,
  };
}

// ─── Mutation helpers ──────────────────────────────────────────────

export function prependProject(project: Project) {
  tblProjects.unshift({
    id: project.id,
    title: project.title,
    description: project.description ?? "",
    supervisorId: project.supervisorId,
    defenseType: project.defenseType,
    status: project.status,
  });
  tblProjectStudents.unshift(
    ...project.studentIds.map((studentId) => ({ projectId: project.id, studentId })),
  );
}

export function prependJury(jury: DbJury) {
  tblJuries.unshift(jury);
}

export function removeJuryByProject(projectId: string) {
  const idx = tblJuries.findIndex((j) => j.projectId === projectId);
  if (idx !== -1) tblJuries.splice(idx, 1);
}

export function replaceTeacherUnavailability(data: TeacherUnavailability) {
  tblUnavailability.length = 0;
  for (const [date, slots] of Object.entries(data.slotsByDate)) {
    tblUnavailability.push({
      id: `ua-${date}`,
      teacherId: "3",
      date,
      slots,
    });
  }
}

// Backward-compatible helper for handlers that need user lists
export const tblAuditLogs: AuditLog[] = createPersisted("auditLogs", []);

export function prependAuditLog(entry: AuditLog) {
  tblAuditLogs.unshift(entry);
}

export function isDefenseSessionTransitionValid(
  from: string,
  to: string,
): boolean {
  return DEFENSE_SESSION_LIFECYCLE[from]?.includes(to) ?? false;
}

export function getFlatUser(uid: string): User | undefined {
  const user = tblUsers.find((u) => u.id === uid);
  if (!user) return undefined;
  const safe = { ...user };
  delete (safe as Record<string, unknown>).password;
  return safe;
}

/** Derive evaluationCoefficients from a jury role template's roles. */
export function deriveEvaluationCoefficients(templateId: string): Record<string, number> {
  const template = juryRoleTemplates.find((t) => t.id === templateId);
  if (!template) return {};
  const coeffs: Record<string, number> = {};
  for (const role of template.roles) {
    coeffs[role.name] = role.coefficient;
  }
  return coeffs;
}

/** Calculate weighted final grade for a defense. */
export function getDefenseGrade(defenseId: string): {
  finalScore: number | null;
  evaluationCoefficients: Record<string, number>;
  individualScores: { roleName: string; teacherName: string; score: number | undefined }[];
} {
  const defense = tblDefenses.find((d) => d.id === defenseId);
  if (!defense) return { finalScore: null, evaluationCoefficients: {}, individualScores: [] };

  const jury = tblJuries.find((j) => j.projectId === defense.projectId);
  if (!jury) return { finalScore: null, evaluationCoefficients: {}, individualScores: [] };

  const session = tblDefenseSessions.find((s) => s.juryRoleTemplateId === jury.templateId);
  const template = juryRoleTemplates.find((t) => t.id === jury.templateId);
  const coeffs = (session?.evaluationCoefficients && Object.keys(session.evaluationCoefficients).length > 0)
    ? session.evaluationCoefficients
    : template
      ? deriveEvaluationCoefficients(template.id)
      : {};

  const evaluations = tblEvaluations.filter((e) => e.defenseId === defenseId);
  const individualScores = jury.members.map((m) => {
    const evalRec = evaluations.find((e) => e.teacherId === m.teacherId);
    return {
      roleName: m.roleName,
      teacherName: getUserFullName(m.teacherId),
      score: evalRec?.score,
    };
  });

  let weightedSum = 0;
  let totalCoeff = 0;
  for (const item of individualScores) {
    const coeff = coeffs[item.roleName] ?? 0;
    if (item.score !== undefined && coeff > 0) {
      weightedSum += item.score * coeff;
      totalCoeff += coeff;
    }
  }

  const finalScore = totalCoeff > 0 ? Math.round((weightedSum / totalCoeff) * 100) / 100 : null;

  return { finalScore, evaluationCoefficients: coeffs, individualScores };
}

// ─── Notification helpers ──────────────────────────────────────────

export interface CreateNotificationParams {
  type?: string;
  title: string;
  message: string;
  actionLink?: string;
  actor?: string;
}

export function createNotification(params: CreateNotificationParams) {
  const n = {
    id: `n${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: params.type ?? "info",
    title: params.title,
    message: params.message,
    timestamp: new Date().toISOString(),
    read: false,
    actionLink: params.actionLink,
    actor: params.actor ?? "system",
  };
  tblNotifications.push(n);

  // Simulate email notification when email is configured
  const emailSenderName = tblEmailConfig?.senderName;
  if (emailSenderName) {
    console.log(
      `[EMAIL] To: teachers/students involved | Subject: ${params.title} | Body: ${params.message}`,
    );
  }

  return n;
}

// ─── Auto-schedule helper ─────────────────────────────────────────

export function generateAutoSchedule(defenseSessionId: string): Record<string, SlotAssignment> {
  const session = tblDefenseSessions.find((s) => s.id === defenseSessionId);
  if (!session) return {};

  const schedule: Record<string, SlotAssignment> = {};
  const rooms = tblRooms;
  const projects = tblProjects.filter(
    (p) => p.status === "approved" && !Object.values(schedule).some((s) => s.id === p.id),
  );

  // Generate time slots
  const times: string[] = [];
  const startHour = 8;
  const endHour = 18;
  const duration = session.defenseDuration || 30;
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += duration) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  // Iterate days within session range
  const startDate = new Date(session.startDate);
  const endDate = new Date(session.endDate);
  const days: string[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }

  for (const date of days) {
    for (const room of rooms) {
      for (const time of times) {
        const slotKey = `${date}|${room.id}|${time}`;
        const candidate = projects.find((p) => {
          if (Object.values(schedule).some((s) => s.id === p.id)) return false;
          return true;
        });
        if (!candidate) continue;

        const jury = tblJuries.find((j) => j.projectId === candidate.id);
        schedule[slotKey] = {
          id: candidate.id,
          title: candidate.title,
          date,
          time,
          roomId: room.id,
          supervisorId: candidate.supervisorId,
          juryTeacherIds: jury?.members.map((m) => m.teacherId) ?? [],
        };
      }
    }
  }

  return schedule;
}
