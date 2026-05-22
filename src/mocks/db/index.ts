import type {
  User, Student,
  Project, Jury,
  TeacherDefense, TeacherEvaluation, TeacherUnavailability,
  StudentGroupDetails, StudentGroupWorkspace, StudentDefenseDetails,
} from "@/types";
import type { AuditLog } from "@/types/audit-log";
import { DEFENSE_SESSION_LIFECYCLE } from "@/lib/constants";
import { users as _users, generateStudents } from "./users";
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

export { majors, levels, grades, juryRoleTemplates } from "./config";
export type {
  DbUser, DbStudent, DbTeacher, DbCoordinator,
  DbDepartment, DbSession, DbRoom,
  DbMajor, DbLevel, DbGrade, DbDefenseSession, DbDefenseSettings, DbJuryRoleTemplate,
  DbProject, DbProjectStudent,
  DbJury, DbGroup, DbGroupMember,
  DbDefense, DbDefenseTeacher, DbEvaluation,
  DbUnavailability, DbStudentGroup, DbStudentDocument,
} from "./schema";

export const MOCK_DELAY = Number(import.meta.env.VITE_MOCK_DELAY) || 1000;

export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Mutable table data ───────────────────────────────────────────

const generatedUsers = generateStudents();
const generatedStudents = _students.slice(1); // skip std-demo (already in _users)

export const tblUsers: ReturnType<typeof generateStudents> = [..._users, ...generatedUsers];
export const tblStudents: typeof _students = [..._students, ...generatedStudents];
export const tblTeachers: typeof _teachers = [..._teachers];
export const tblCoordinators: typeof _coordinators = [..._coordinators];
export const tblDepartments: typeof _departments = [..._departments];
export const tblSessions: typeof _sessions = [..._sessions];
export const tblRooms: typeof _rooms = [..._rooms];
export const tblDefenseSessions: typeof _defenseSessions = [..._defenseSessions];
export const tblDefenseSettings = { ..._defenseSettings };
// Re-exported for backward compatibility
export const defenseSettings = tblDefenseSettings;
export const tblProjects: typeof _projects = [..._projects];
export const tblProjectStudents: typeof _projectStudents = [..._projectStudents];
export const tblJuries: typeof _juries = [..._juries];
export const tblDefenses: typeof _defenses = [..._defenses];
export const tblDefenseTeachers: typeof defenseTeachers = [...defenseTeachers];
export const tblEvaluations: typeof _evaluations = [..._evaluations];
export const tblGroups: typeof _groups = [..._groups];
export const tblGroupMembers: typeof _groupMembers = [..._groupMembers];
export const tblStudentGroups: typeof _studentGroups = [..._studentGroups];
export const tblStudentDocuments: typeof _studentDocuments = [..._studentDocuments];
export const tblUnavailability: typeof _unavailability = [..._unavailability];

// The demo student ID used for student flows
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
  return {
    id: j.id,
    projectId: j.projectId,
    projectTitle: project?.title ?? "",
    defenseType: (project?.defenseType ?? "pfe") as Jury["defenseType"],
    presidentId: j.presidentId,
    presidentName: getUserFullName(j.presidentId),
    reporterId: j.reporterId,
    reporterName: getUserFullName(j.reporterId),
    examinerId: j.examinerId,
    examinerName: getUserFullName(j.examinerId),
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

  return {
    projectTitle: project.title,
    projectDescription: project.description,
    supervisorName: getUserFullName(project.supervisorId),
    juryMembers: jury
      ? [
          { name: getUserFullName(jury.presidentId), role: "President" },
          { name: getUserFullName(jury.reporterId), role: "Rapporteur" },
          { name: getUserFullName(jury.examinerId), role: "Examinateur" },
        ]
      : [],
    date: project.id === "p5" ? daysFromNow(3) : undefined,
    startTime: project.id === "p5" ? "10:15" : undefined,
    endTime: project.id === "p5" ? "11:45" : undefined,
    roomName: project.id === "p5" ? "Salle 101" : undefined,
    status: project.id === "p5" ? ("scheduled" as const) : ("pending" as const),
    convocationUrl: project.id === "p5" ? "/api/student/convocation" : undefined,
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

export function prependJury(jury: Jury) {
  tblJuries.unshift({
    id: jury.id,
    projectId: jury.projectId,
    presidentId: jury.presidentId,
    reporterId: jury.reporterId,
    examinerId: jury.examinerId,
  });
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
export const tblAuditLogs: AuditLog[] = [
  {
    id: "1",
    action: "LOGIN",
    entity: "user",
    entityId: "1",
    adminEmail: "admin@univ.com",
    details: "Connexion réussie",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    action: "CREATE",
    entity: "user",
    entityId: "5",
    adminEmail: "admin@univ.com",
    details: "Création d'un nouvel étudiant",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

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
