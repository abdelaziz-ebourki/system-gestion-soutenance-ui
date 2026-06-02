import { describe, it, expect } from "vitest";
import { validateSlotAssignment, getAllConflicts, type ConflictContext } from "@/lib/conflict-engine";

describe("Conflict Engine", () => {
  const mockContext: ConflictContext = {
    schedule: {},
    rooms: {
      "room1": { id: "room1", name: "Salle A", capacity: 10 },
      "room2": { id: "room2", name: "Salle B", capacity: 2 },
    },
    groups: {
      "group1": { id: "group1", studentIds: ["s1", "s2"] },
    },
    projects: {
      "proj1": { id: "proj1", studentIds: ["s1", "s2"], supervisorId: "sup1" },
      "proj2": { id: "proj2", studentIds: ["s3", "s4", "s5"], supervisorId: "sup1" }, // Same supervisor as proj1
      "proj3": { id: "proj3", studentIds: ["s6", "s7", "s8", "s9", "s10", "s11"], supervisorId: "sup2" }, // Too many for room2
    },
    teachers: {
      "t1": { id: "t1", name: "Teacher 1" },
      "t2": { id: "t2", name: "Teacher 2" },
      "t3": { id: "t3", name: "Teacher 3" },
    },
    juries: {
      "proj1": { id: "proj1", projectId: "proj1", teacherIds: ["t1", "t2"] },
      "proj2": { id: "proj2", projectId: "proj2", teacherIds: ["t2", "t3"] }, // t2 is shared
      "proj3": { id: "proj3", projectId: "proj3", teacherIds: ["t1", "t3"] },
    },
    unavailability: {
      "t1": [{ date: "2026-06-01", slots: ["09:00", "10:00"], teacherId: "t1" }],
    },
    defenseSession: {
      startDate: "2026-06-01",
      endDate: "2026-06-14",
      breakDuration: 15,
    },
  };

  describe("validateSlotAssignment", () => {
    it("should return error for invalid slot format", () => {
      const result = validateSlotAssignment("proj1", "invalid-slot", mockContext);
      expect(result.isValid).toBe(false);
      expect(result.issues[0].type).toBe("slot_occupied");
      expect(result.issues[0].message).toContain("Format de créneau invalide");
    });

    it("should return error if project is already scheduled", () => {
      const context = {
        ...mockContext,
        schedule: { "2026-06-01|room1|09:00": { id: "proj1", title: "P1", date: "2026-06-01", time: "09:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-02|room1|09:00", context);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === "project_already_scheduled")).toBe(true);
    });

    it("should return error if slot is already occupied", () => {
      const context = {
        ...mockContext,
        schedule: { "2026-06-01|room1|09:00": { id: "proj2", title: "P2", date: "2026-06-01", time: "09:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:00", context);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === "slot_occupied")).toBe(true);
    });

    it("should return error if room capacity is exceeded", () => {
      // proj3 has 6 students, room2 has capacity 2
      const result = validateSlotAssignment("proj3", "2026-06-01|room2|09:00", mockContext);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === "room_capacity")).toBe(true);
      expect(result.issues.find(i => i.type === "room_capacity")?.message).toContain("capacité de 2 mais le projet a 6");
    });

    it("should return error if date is out of session boundaries", () => {
      const resultBefore = validateSlotAssignment("proj1", "2026-05-31|room1|09:00", mockContext);
      const resultAfter = validateSlotAssignment("proj1", "2026-06-15|room1|09:00", mockContext);
      
      expect(resultBefore.isValid).toBe(false);
      expect(resultBefore.issues.some(i => i.type === "out_of_bounds")).toBe(true);
      expect(resultAfter.isValid).toBe(false);
      expect(resultAfter.issues.some(i => i.type === "out_of_bounds")).toBe(true);
    });

    it("should return error if teacher is double-booked on the same date", () => {
      // proj1 and proj2 both have teacher t2. 
      // We schedule proj2 on 2026-06-01.
      const context = {
        ...mockContext,
        schedule: { "2026-06-01|room1|11:00": { id: "proj2", title: "Proj 2", date: "2026-06-01", time: "11:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room2|09:00", context);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === "teacher_double_booked")).toBe(true);
      expect(result.issues.find(i => i.type === "teacher_double_booked")?.message).toContain("Teacher 2");
    });

    it("should return error if student is double-booked on the same date", () => {
      // proj1 has students s1,s2 and projDouble has s2,s5 (s2 overlap)
      const context = {
        ...mockContext,
        projects: {
          ...mockContext.projects,
          projDouble: { id: "projDouble", studentIds: ["s2", "s5"], supervisorId: "sup3" },
        },
        schedule: {
          "2026-06-01|room1|11:00": { id: "projDouble", title: "Proj Double", date: "2026-06-01", time: "11:00", roomId: "room1" },
        },
        juries: {
          ...mockContext.juries,
          projDouble: { id: "projDouble", projectId: "projDouble", teacherIds: ["t1"] },
        },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room2|09:00", context);
      expect(result.issues.some(i => i.type === "student_double_booked")).toBe(true);
      expect(result.issues.find(i => i.type === "student_double_booked")?.severity).toBe("error");
      expect(result.issues.find(i => i.type === "student_double_booked")?.message).toContain("s2");
    });

    it("should not flag student double-booking if students are on different dates", () => {
      const context = {
        ...mockContext,
        schedule: {
          "2026-06-02|room1|11:00": { id: "proj2", title: "Proj 2", date: "2026-06-02", time: "11:00", roomId: "room1" },
        },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:00", context);
      expect(result.issues.some(i => i.type === "student_double_booked")).toBe(false);
    });

    it("should return error if supervisor has another project on the same date", () => {
      // proj1 and proj2 have same supervisor sup1.
      const context = {
        ...mockContext,
        schedule: { "2026-06-01|room1|11:00": { id: "proj2", title: "Proj 2", date: "2026-06-01", time: "11:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room2|09:00", context);
      // Note: this will also trigger teacher_double_booked since t2 is shared, 
      // but we specifically check for the supervisor error.
      expect(result.issues.some(i => i.type === "supervisor_conflict")).toBe(true);
      expect(result.issues.find(i => i.type === "supervisor_conflict")?.severity).toBe("error");
    });

    it("should return warning if break interval is violated in the same room", () => {
      // breakDuration is 15. 
      // Existing slot at 09:00. Current slot at 09:10. 
      // Gap = 10 - 0 - 15 = -5.
      const context = {
        ...mockContext,
        schedule: { "2026-06-01|room1|09:00": { id: "proj2", title: "Proj 2", date: "2026-06-01", time: "09:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:10", context);
      expect(result.issues.some(i => i.type === "break_violation")).toBe(true);
      expect(result.issues.find(i => i.type === "break_violation")?.message).toContain("Pause insuffisante");
    });

    it("should pass break interval check if gap is sufficient", () => {
      const context = {
        ...mockContext,
        schedule: { "2026-06-01|room1|09:00": { id: "proj2", title: "Proj 2", date: "2026-06-01", time: "09:00", roomId: "room1" } },
      };
      // Gap = 30 - 0 - 15 = 15. Valid.
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:30", context);
      expect(result.issues.some(i => i.type === "break_violation")).toBe(false);
    });

    it("should return error if teacher is unavailable for the slot", () => {
      // t1 is unavailable on 2026-06-01 at 09:00
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:00", mockContext);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === "teacher_unavailable")).toBe(true);
      expect(result.issues.find(i => i.type === "teacher_unavailable")?.message).toContain("Teacher 1");
    });

    it("should be valid when no conflicts exist", () => {
      const result = validateSlotAssignment("proj1", "2026-06-02|room1|09:00", mockContext);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should handle missing optional context data gracefully", () => {
      const minimalContext: ConflictContext = {
        schedule: {},
        rooms: {},
        groups: {},
        projects: { "p1": { id: "p1", studentIds: [], supervisorId: "s1" } },
        teachers: {},
        juries: {},
        unavailability: {},
      };
      const result = validateSlotAssignment("p1", "2026-06-01|r1|09:00", minimalContext);
      expect(result.isValid).toBe(true);
    });

    it("should handle missing breakDuration in defenseSession", () => {
      const context: ConflictContext = {
        ...mockContext,
        defenseSession: { startDate: "2026-06-01", endDate: "2026-06-14", breakDuration: 0 },
        schedule: { "2026-06-01|room1|09:00": { id: "proj2", title: "P2", date: "2026-06-01", time: "09:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:01", context);
      // No violation expected if breakDuration is 0 (default)
      expect(result.issues.some(i => i.type === "break_violation")).toBe(false);
    });

    it("should handle missing juries context", () => {
      const context = { ...mockContext, juries: {} };
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:00", context);
      expect(result.isValid).toBe(true);
    });

    it("should handle missing teacher names in unavailability message", () => {
      const context = {
        ...mockContext,
        teachers: {}, // No names
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:00", context);
      expect(result.issues.find(i => i.type === "teacher_unavailable")?.message).toContain("Un enseignant");
    });

    it("should handle missing teacher names in double booking message", () => {
      const context = {
        ...mockContext,
        teachers: {}, 
        schedule: { "2026-06-01|room1|11:00": { id: "proj2", title: "P2", date: "2026-06-01", time: "11:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room2|09:00", context);
      expect(result.issues.find(i => i.type === "teacher_double_booked")?.message).toContain("Un enseignant");
    });

    it("should handle existing projects without supervisors in supervisor conflict check", () => {
      const context = {
        ...mockContext,
        projects: {
          ...mockContext.projects,
          projNoSup: { id: "projNoSup", studentIds: ["s99"], supervisorId: "" },
        },
        schedule: { "2026-06-01|room1|09:00": { id: "projNoSup", title: "No Sup", date: "2026-06-01", time: "09:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room2|11:00", context);
      expect(result.issues.some(i => i.type === "supervisor_conflict")).toBe(false);
    });

    it("should handle existing projects with no jury in double-booking check", () => {
       const context = {
        ...mockContext,
        juries: {
          "proj1": { id: "proj1", projectId: "proj1", teacherIds: ["t1"] },
          // proj2 has no jury entry
        },
        schedule: { "2026-06-01|room1|09:00": { id: "proj2", title: "P2", date: "2026-06-01", time: "09:00", roomId: "room1" } },
      };
      const result = validateSlotAssignment("proj1", "2026-06-01|room2|11:00", context);
      expect(result.issues.some(i => i.type === "teacher_double_booked")).toBe(false);
    });

    it("should handle missing unavailability context", () => {
      const context = { ...mockContext, unavailability: {} };
      const result = validateSlotAssignment("proj1", "2026-06-01|room1|09:00", context);
      expect(result.isValid).toBe(true);
    });

    it("should skip break violation check if roomId is missing", () => {
      // slot = "date||time" -> date="date", roomId="", time="time"
      const result = validateSlotAssignment("proj1", "2026-06-01||09:00", mockContext);
      expect(result.issues.some(i => i.type === "break_violation")).toBe(false);
    });
  });

  describe("getAllConflicts", () => {
    it("should aggregate all conflicts from the schedule", () => {
      const realSchedule = {
        "2026-06-01|room1|09:00": { id: "proj1", title: "P1", date: "2026-06-01", time: "09:00", roomId: "room1" },
        "2026-06-01|room1|09:10": { id: "proj2", title: "P2", date: "2026-06-01", time: "09:10", roomId: "room1" }, // Break violation
      };
      
      const contextWithSchedule = {
        ...mockContext,
        schedule: realSchedule,
      };

      const conflicts = getAllConflicts(realSchedule, contextWithSchedule);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(c => c.type === "break_violation")).toBe(true);
    });
  });
});
