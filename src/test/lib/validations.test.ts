import { describe, it, expect } from "vitest";
import { validate } from "@/lib/validations";
import {
  loginSchema,
  verifyAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  defenseSessionSchema,
  defenseSessionTransitionSchema,
  roomSchema,
  departmentSchema,
  studentSchema,
  teacherSchema,
  coordinatorSchema,
  configNameSchema,
  defenseSettingsSchema,
  generalSettingsSchema,
  documentConfigSchema,
  evaluationSchema,
  projectSchema,
  juryMemberSchema,
  jurySchema,
  unavailabilitySchema,
} from "@/lib/validations";

describe("validate helper", () => {
  it("returns null for valid data", () => {
    expect(validate(loginSchema, { email: "test@test.com", password: "123456" })).toBeNull();
  });

  it("returns errors for invalid data", () => {
    const errors = validate(loginSchema, { email: "", password: "" });
    expect(errors).not.toBeNull();
    expect(errors).toHaveProperty("email");
    expect(errors).toHaveProperty("password");
  });
});

describe("loginSchema", () => {
  it("accepts valid login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "p" }).success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ email: "", password: "p" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({ email: "notanemail", password: "p" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("verifyAccountSchema", () => {
  it("accepts matching passwords", () => {
    const result = verifyAccountSchema.safeParse({ password: "12345678", confirmPassword: "12345678" });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = verifyAccountSchema.safeParse({ password: "123", confirmPassword: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = verifyAccountSchema.safeParse({ password: "12345678", confirmPassword: "different" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("rejects empty email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords", () => {
    const result = resetPasswordSchema.safeParse({ password: "12345678", confirmPassword: "12345678" });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords (refine branch)", () => {
    const result = resetPasswordSchema.safeParse({ password: "12345678", confirmPassword: "different" });
    expect(result.success).toBe(false);
  });
});

describe("defenseSessionSchema", () => {
  const valid = {
    name: "Session PFE",
    status: "draft" as const,
    maxGroupSize: 3,
    defenseDuration: 60,
    breakDuration: 15,
    submissionDeadline: "2026-06-01",
    juryRoleTemplateId: "t1",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
  };

  it("accepts valid session", () => {
    expect(defenseSessionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects endDate before startDate (refine branch)", () => {
    const result = defenseSessionSchema.safeParse({ ...valid, startDate: "2026-07-01", endDate: "2026-06-01" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("endDate");
    }
  });

  it("rejects missing name", () => {
    expect(defenseSessionSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects maxGroupSize exceeding limit", () => {
    expect(defenseSessionSchema.safeParse({ ...valid, maxGroupSize: 11 }).success).toBe(false);
  });

  it("rejects defenseDuration exceeding limit", () => {
    expect(defenseSessionSchema.safeParse({ ...valid, defenseDuration: 200 }).success).toBe(false);
  });

  it("rejects missing template", () => {
    expect(defenseSessionSchema.safeParse({ ...valid, juryRoleTemplateId: "" }).success).toBe(false);
  });

  it("handles coerce for numeric fields", () => {
    const result = defenseSessionSchema.safeParse({ ...valid, maxGroupSize: "3", defenseDuration: "60", breakDuration: "15" });
    expect(result.success).toBe(true);
  });
});

describe("defenseSessionTransitionSchema", () => {
  it("accepts valid transition", () => {
    expect(defenseSessionTransitionSchema.safeParse({ fromStatus: "draft", toStatus: "active" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(defenseSessionTransitionSchema.safeParse({ fromStatus: "invalid", toStatus: "active" }).success).toBe(false);
  });
});

describe("roomSchema", () => {
  it("accepts valid room", () => {
    expect(roomSchema.safeParse({ name: "S101", departmentId: "d1", capacity: 30 }).success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(roomSchema.safeParse({ name: "", departmentId: "d1", capacity: 30 }).success).toBe(false);
  });

  it("rejects capacity of 0", () => {
    expect(roomSchema.safeParse({ name: "S101", departmentId: "d1", capacity: 0 }).success).toBe(false);
  });

  it("handles coerce for capacity", () => {
    expect(roomSchema.safeParse({ name: "S101", departmentId: "d1", capacity: "30" }).success).toBe(true);
  });
});

describe("departmentSchema", () => {
  it("accepts valid department", () => {
    expect(departmentSchema.safeParse({ name: "Info", code: "INFO", headId: "t1" }).success).toBe(true);
  });

  it("accepts department without head", () => {
    expect(departmentSchema.safeParse({ name: "Info", code: "INFO" }).success).toBe(true);
  });

  it("rejects missing code", () => {
    expect(departmentSchema.safeParse({ name: "Info", code: "" }).success).toBe(false);
  });
});

describe("studentSchema", () => {
  it("accepts valid student", () => {
    expect(studentSchema.safeParse({ lastName: "Dupont", firstName: "Jean", email: "j@test.com", cne: "CNE001", majorId: "m1", levelId: "l1" }).success).toBe(true);
  });

  it("rejects missing cne", () => {
    expect(studentSchema.safeParse({ lastName: "Dupont", firstName: "Jean", email: "j@test.com", cne: "", majorId: "m1", levelId: "l1" }).success).toBe(false);
  });
});

describe("teacherSchema", () => {
  it("accepts valid teacher", () => {
    expect(teacherSchema.safeParse({ lastName: "Benali", firstName: "A", email: "a@test.com", departmentId: "d1" }).success).toBe(true);
  });

  it("rejects missing department", () => {
    expect(teacherSchema.safeParse({ lastName: "Benali", firstName: "A", email: "a@test.com", departmentId: "" }).success).toBe(false);
  });
});

describe("coordinatorSchema", () => {
  it("accepts valid coordinator", () => {
    expect(coordinatorSchema.safeParse({ lastName: "Idrissi", firstName: "H", email: "h@test.com" }).success).toBe(true);
  });
});

describe("configNameSchema", () => {
  it("accepts valid name", () => {
    expect(configNameSchema.safeParse({ name: "Test" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(configNameSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("defenseSettingsSchema", () => {
  const valid = {
    startTime: "08:00",
    endTime: "18:00",
    defenseDuration: 60,
    breakDuration: 15,
    groupCreationStartDate: "2026-01-01",
    groupCreationEndDate: "2026-06-01",
  };

  it("accepts valid settings", () => {
    expect(defenseSettingsSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects endDate before startDate (refine branch)", () => {
    const result = defenseSettingsSchema.safeParse({
      ...valid,
      groupCreationStartDate: "2026-07-01",
      groupCreationEndDate: "2026-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("groupCreationEndDate");
    }
  });

  it("rejects missing startTime", () => {
    expect(defenseSettingsSchema.safeParse({ ...valid, startTime: "" }).success).toBe(false);
  });

  it("rejects defenseDuration of 0", () => {
    expect(defenseSettingsSchema.safeParse({ ...valid, defenseDuration: 0 }).success).toBe(false);
  });
});

describe("generalSettingsSchema", () => {
  it("accepts valid settings", () => {
    expect(generalSettingsSchema.safeParse({ institutionName: "Univ", timezone: "UTC", dateFormat: "DD/MM/YYYY" }).success).toBe(true);
  });

  it("rejects empty institution name", () => {
    expect(generalSettingsSchema.safeParse({ institutionName: "", timezone: "UTC", dateFormat: "DD/MM/YYYY" }).success).toBe(false);
  });

  it("accepts with optional fields", () => {
    expect(generalSettingsSchema.safeParse({ institutionName: "Univ", institutionLogoUrl: "logo.png", timezone: "UTC", dateFormat: "DD/MM/YYYY", setupCompleted: true }).success).toBe(true);
  });
});

describe("documentConfigSchema", () => {
  it("accepts valid config", () => {
    expect(documentConfigSchema.safeParse({ maxFileSizeMb: 10, allowedExtensions: "pdf,doc", versionLimit: 5 }).success).toBe(true);
  });

  it("rejects maxFileSize under 1", () => {
    expect(documentConfigSchema.safeParse({ maxFileSizeMb: 0, allowedExtensions: "pdf", versionLimit: 1 }).success).toBe(false);
  });

  it("rejects versionLimit over 50", () => {
    expect(documentConfigSchema.safeParse({ maxFileSizeMb: 10, allowedExtensions: "pdf", versionLimit: 100 }).success).toBe(false);
  });
});

describe("evaluationSchema", () => {
  it("accepts valid score", () => {
    expect(evaluationSchema.safeParse({ score: 15, comment: "Good" }).success).toBe(true);
  });

  it("accepts score without comment", () => {
    expect(evaluationSchema.safeParse({ score: 10 }).success).toBe(true);
  });

  it("rejects score below 0", () => {
    expect(evaluationSchema.safeParse({ score: -1 }).success).toBe(false);
  });

  it("rejects score above 20", () => {
    expect(evaluationSchema.safeParse({ score: 25 }).success).toBe(false);
  });
});

describe("projectSchema", () => {
  it("accepts valid project", () => {
    expect(projectSchema.safeParse({ title: "Proj", supervisorId: "t1", studentIds: ["s1"], defenseType: "pfe" }).success).toBe(true);
  });

  it("rejects missing title", () => {
    expect(projectSchema.safeParse({ title: "", supervisorId: "t1", studentIds: [] }).success).toBe(false);
  });

  it("rejects missing supervisor", () => {
    expect(projectSchema.safeParse({ title: "Proj", supervisorId: "", studentIds: [] }).success).toBe(false);
  });

  it("defaults defenseType to pfe", () => {
    const result = projectSchema.safeParse({ title: "Proj", supervisorId: "t1", studentIds: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defenseType).toBe("pfe");
    }
  });

  it("accepts memoire defense type", () => {
    expect(projectSchema.safeParse({ title: "Proj", supervisorId: "t1", studentIds: [], defenseType: "memoire" }).success).toBe(true);
  });
});

describe("jurySchema", () => {
  const members = [
    { roleName: "President", teacherId: "t1" },
    { roleName: "Rapporteur", teacherId: "t2" },
  ];

  it("accepts valid jury", () => {
    expect(jurySchema.safeParse({ projectId: "p1", templateId: "t1", members }).success).toBe(true);
  });

  it("rejects duplicate members (refine branch)", () => {
    const dupes = [
      { roleName: "President", teacherId: "t1" },
      { roleName: "Rapporteur", teacherId: "t1" },
    ];
    const result = jurySchema.safeParse({ projectId: "p1", templateId: "t1", members: dupes });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("différentes"))).toBe(true);
    }
  });

  it("rejects empty members", () => {
    const result = jurySchema.safeParse({ projectId: "p1", templateId: "t1", members: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing member teacherId", () => {
    const result = jurySchema.safeParse({
      projectId: "p1", templateId: "t1",
      members: [{ roleName: "President", teacherId: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing projectId", () => {
    expect(jurySchema.safeParse({ projectId: "", templateId: "t1", members }).success).toBe(false);
  });
});

describe("unavailabilitySchema", () => {
  it("accepts valid unavailability", () => {
    expect(unavailabilitySchema.safeParse({ slotsByDate: { "2026-06-01": ["08:00", "09:00"] } }).success).toBe(true);
  });

  it("accepts empty slots", () => {
    expect(unavailabilitySchema.safeParse({ slotsByDate: {} }).success).toBe(true);
  });
});

describe("juryMemberSchema", () => {
  it("accepts valid member", () => {
    expect(juryMemberSchema.safeParse({ roleName: "President", teacherId: "t1" }).success).toBe(true);
  });

  it("rejects empty teacherId", () => {
    expect(juryMemberSchema.safeParse({ roleName: "President", teacherId: "" }).success).toBe(false);
  });
});
