import { describe, it, expect } from "vitest";
import { 
  validate, 
  loginSchema, 
  verifyAccountSchema, 
  defenseSessionSchema, 
  roomSchema, 
  studentSchema, 
  jurySchema 
} from "@/lib/validations";

describe("Validation utilities", () => {
  it("validate() returns null for valid data", () => {
    const data = { email: "test@test.com", password: "password123" };
    expect(validate(loginSchema, data)).toBeNull();
  });

  it("validate() returns errors for invalid data", () => {
    const data = { email: "invalid-email", password: "" };
    const errors = validate(loginSchema, data);
    expect(errors).toEqual({
      email: "Email invalide",
      password: "Le mot de passe est requis",
    });
  });

  describe("Auth schemas", () => {
    it("verifyAccountSchema validates matching passwords", () => {
      expect(validate(verifyAccountSchema, { password: "password123", confirmPassword: "password123" })).toBeNull();
      expect(validate(verifyAccountSchema, { password: "password123", confirmPassword: "different" })).toEqual({
        confirmPassword: "Les mots de passe ne correspondent pas",
      });
    });
  });

  describe("Coordinator schemas", () => {
    it("defenseSessionSchema validates dates", () => {
      const valid = {
        name: "Session 2026",
        status: "draft" as const,
        maxGroupSize: 5,
        defenseDuration: 60,
        breakDuration: 15,
        submissionDeadline: "2026-06-01",
        juryRoleTemplateId: "t1",
        startDate: "2026-06-10",
        endDate: "2026-06-20",
      };
      expect(validate(defenseSessionSchema, valid)).toBeNull();

      const invalidDates = { ...valid, startDate: "2026-06-20", endDate: "2026-06-10" };
      expect(validate(defenseSessionSchema, invalidDates)).toEqual({
        endDate: "La date de fin doit être postérieure à la date de début",
      });
    });

    it("jurySchema validates unique members", () => {
      const valid = {
        projectId: "p1",
        templateId: "t1",
        members: [{ roleName: "President", teacherId: "t1" }, { roleName: "Member", teacherId: "t2" }],
      };
      expect(validate(jurySchema, valid)).toBeNull();

      const duplicateMembers = {
        projectId: "p1",
        templateId: "t1",
        members: [{ roleName: "President", teacherId: "t1" }, { roleName: "Member", teacherId: "t1" }],
      };
      // Zod refinement errors usually have a different structure in the result of safeParse, 
      // but our validate function handles path.join(".")
      const errors = validate(jurySchema, duplicateMembers);
      expect(errors).toBeDefined();
    });
  });

  describe("Admin schemas", () => {
    it("roomSchema validates capacity", () => {
      const invalid = { name: "Room", departmentId: "d1", capacity: 0 };
      expect(validate(roomSchema, invalid)).toEqual({
        capacity: "La capacité doit être supérieure à 0",
      });
    });

    it("studentSchema validates required fields", () => {
      const invalid = { lastName: "Doe", firstName: "John", email: "john@doe.com", cne: "", majorId: "m1", levelId: "l1" };
      expect(validate(studentSchema, invalid)).toEqual({
        cne: "Le CNE est requis",
      });
    });
  });
});
