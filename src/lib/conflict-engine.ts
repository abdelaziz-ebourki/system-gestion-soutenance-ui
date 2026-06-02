export interface ConflictIssue {
  type: "room_capacity" | "teacher_double_booked" | "student_double_booked" | "supervisor_conflict" | "break_violation" | "out_of_bounds" | "slot_occupied" | "project_already_scheduled" | "teacher_unavailable";
  severity: "error" | "warning";
  message: string;
  slot: string;
  suggestedResolution?: string;
}

export interface SlotAssignment {
  id: string;
  title: string;
  date: string;
  time: string;
  roomId: string;
  studentIds?: string[];
  supervisorId?: string;
  juryTeacherIds?: string[];
}

export interface ConflictContext {
  schedule: Record<string, SlotAssignment>;
  rooms: Record<string, { id: string; name: string; capacity: number }>;
  groups: Record<string, { id: string; studentIds: string[] }>;
  projects: Record<string, { id: string; studentIds: string[]; supervisorId: string }>;
  teachers: Record<string, { id: string; name: string }>;
  juries: Record<string, { id: string; projectId: string; teacherIds: string[] }>;
  unavailability: Record<string, { date: string; slots: string[]; teacherId: string }[]>;
  defenseSession?: { startDate: string; endDate: string; breakDuration: number };
}

export function validateSlotAssignment(
  projectId: string,
  slot: string,
  context: ConflictContext,
): { isValid: boolean; issues: ConflictIssue[] } {
  const issues: ConflictIssue[] = [];
  const [date, roomId, time] = slot.split("|");

  if (!date || !roomId || !time) {
    return { isValid: false, issues: [{ type: "slot_occupied", severity: "error", message: "Format de créneau invalide.", slot }] };
  }

  // Check 1: Project already scheduled
  const isAlreadyScheduled = Object.values(context.schedule).some((p) => p.id === projectId);
  if (isAlreadyScheduled) {
    issues.push({
      type: "project_already_scheduled",
      severity: "error",
      message: "Ce projet est déjà planifié sur un autre créneau.",
      slot,
    });
  }

  // Check 2: Slot already occupied
  if (context.schedule[slot]) {
    issues.push({
      type: "slot_occupied",
      severity: "error",
      message: "Ce créneau est déjà occupé.",
      slot,
      suggestedResolution: "Choisissez un autre créneau horaire ou une autre salle.",
    });
  }

  // Check 3: Room capacity
  const room = context.rooms[roomId];
  const project = context.projects[projectId];
  if (room && project) {
    const studentCount = project.studentIds.length;
    if (studentCount > room.capacity) {
      issues.push({
        type: "room_capacity",
        severity: "error",
        message: `La salle "${room.name}" a une capacité de ${room.capacity} mais le projet a ${studentCount} étudiants.`,
        slot,
        suggestedResolution: `Utilisez une salle avec capacité ≥ ${studentCount} ou divisez le groupe.`,
      });
    }
  }

  // Check 4: Defense session date boundaries
  if (context.defenseSession) {
    if (date < context.defenseSession.startDate || date > context.defenseSession.endDate) {
      issues.push({
        type: "out_of_bounds",
        severity: "error",
        message: `La date ${date} est en dehors des limites de la session (${context.defenseSession.startDate} — ${context.defenseSession.endDate}).`,
        slot,
      });
    }
  }

  // Check 5: Teacher double-booking
  const projectJury = context.juries && Object.values(context.juries).find((j) => j.projectId === projectId);
  const teacherIds = projectJury?.teacherIds ?? [];

  if (teacherIds.length > 0) {
    for (const [, existing] of Object.entries(context.schedule)) {
      if (existing.date !== date) continue;
      const existingJury = context.juries && Object.values(context.juries).find((j) => j.projectId === existing.id);
      const existingTeachers = existingJury?.teacherIds ?? [];
      const overlap = teacherIds.filter((t) => existingTeachers.includes(t));
      if (overlap.length > 0) {
        for (const teacherId of overlap) {
          const teacher = context.teachers[teacherId];
          issues.push({
            type: "teacher_double_booked",
            severity: "error",
            message: `${teacher?.name ?? "Un enseignant"} est déjà affecté à "${existing.title}" le ${existing.date}.`,
            slot,
            suggestedResolution: "Remplacez le membre du jury en conflit ou modifiez l'autre créneau.",
          });
        }
      }
    }
  }

  // Check 6: Supervisor time conflict
  if (project?.supervisorId) {
    const supervisorId = project.supervisorId;
    for (const [, existing] of Object.entries(context.schedule)) {
      if (existing.date !== date) continue;
      const existingProject = context.projects[existing.id];
      if (existingProject?.supervisorId === supervisorId) {
        issues.push({
          type: "supervisor_conflict",
          severity: "error",
          message: `L'encadrant est également encadrant de "${existing.title}" le même jour.`,
          slot,
          suggestedResolution: "Planifiez les deux passages le même jour avec suffisamment d'écart ou répartissez sur des jours différents.",
        });
      }
    }
  }

  // Check 7: Student double-booking
  if (project?.studentIds?.length) {
    for (const [, existing] of Object.entries(context.schedule)) {
      if (existing.date !== date) continue;
      const existingProject = context.projects[existing.id];
      const overlapping = project.studentIds.filter((sid) => existingProject?.studentIds.includes(sid));
      if (overlapping.length > 0) {
        issues.push({
          type: "student_double_booked",
          severity: "error",
          message: `L'étudiant "${overlapping[0]}" est déjà dans "${existing.title}" le ${existing.date}.`,
          slot,
          suggestedResolution: "Réaffectez les étudiants pour éviter les chevauchements.",
        });
      }
    }
  }

  // Check 8: Break interval violation
  if (context.defenseSession && roomId) {
    const existingSlotsInRoom = Object.values(context.schedule)
      .filter((s) => s.date === date && s.roomId === roomId && s.time !== time)
      .map((s) => s.time)
      .sort();

    const [th, tm] = time.split(":").map(Number);
    const thisMinutes = th * 60 + tm;

    // Check gap with nearest preceding slot
    const precedingSlots = existingSlotsInRoom.filter((t) => t < time);
    if (precedingSlots.length > 0) {
      const nearestTime = precedingSlots[precedingSlots.length - 1];
      const [nh, nm] = nearestTime.split(":").map(Number);
      const nearestMinutes = nh * 60 + nm;
      const gap = thisMinutes - nearestMinutes - (context.defenseSession.breakDuration || 0);

      if (gap < 0) {
        issues.push({
          type: "break_violation",
          severity: "warning",
          message: `Pause insuffisante entre ${nearestTime} et ${time} dans la même salle.`,
          slot,
          suggestedResolution: `Ajoutez au moins ${Math.abs(gap)} minutes de plus ou changez de créneau.`,
        });
      }
    }
  }

  // Check 9: Teacher unavailability
  if (teacherIds.length > 0 && context.unavailability) {
    const allUnavailability = Object.values(context.unavailability).flat();
    for (const teacherId of teacherIds) {
      const unavailable = allUnavailability.find(
        (u) => u.teacherId === teacherId && u.date === date && u.slots.includes(time),
      );
      if (unavailable) {
        const teacher = context.teachers[teacherId];
        issues.push({
          type: "teacher_unavailable",
          severity: "error",
          message: `${teacher?.name ?? "Un enseignant"} est indisponible le ${date} à ${time}.`,
          slot,
          suggestedResolution: "Choisissez un créneau où tous les membres du jury sont disponibles.",
        });
      }
    }
  }

  return {
    isValid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}

export function getAllConflicts(
  schedule: Record<string, SlotAssignment>,
  context: ConflictContext,
): ConflictIssue[] {
  const all: ConflictIssue[] = [];
  for (const [slot, assignment] of Object.entries(schedule)) {
    const result = validateSlotAssignment(assignment.id, slot, context);
    all.push(...result.issues);
  }
  return all;
}
