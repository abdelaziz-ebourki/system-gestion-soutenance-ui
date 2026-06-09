export { api, getNotifications, markNotificationRead, markAllNotificationsRead, sendNotificationEmail, type PaginatedResponse, type ApiResponse, type DefenseSettings, type GeneralSettings, type DocumentConfig, type EmailConfig } from "./api-core";
export * from "./api-admin";
export {
  getCoordinatorStats, getProjects, createProject, updateProject, deleteProject,
  getGroups, createGroup, deleteGroup,
  getJuries, createJury, updateJury, deleteJury,
  getCoordinatorDefenseSessions, createCoordinatorDefenseSession, updateCoordinatorDefenseSession, deleteCoordinatorDefenseSession,
  transitionDefenseSession, getSchedules, saveSchedules, autoGenerateSchedules, publishSchedule,
  cancelDefense, validateConflicts, getCoordinatorUnavailability, getCoordinatorUsers, assignProjectToGroup,
  getEvaluationSheet, getAttendanceList, getJuryConvocations, getDefenseScheduleDoc, getProcesVerbal,
  type CreateProjectPayload, type UpdateProjectPayload, type MemberEntry, type CreateJuryPayload, type UpdateJuryPayload,
  type ScheduleSlot, type ScheduleResponse, type ConflictDetail, type EvaluationSheetResponse,
  type AttendanceListResponse, type JuryConvocationResponse, type ScheduleDocResponse, type MinutesResponse,
  type CoordinatorStats, type UnavailabilityEntry,
} from "./api-coordinator";
export { getGrades as getCoordinatorGrades } from "./api-coordinator";
export * from "./api-teacher";
export * from "./api-student";
