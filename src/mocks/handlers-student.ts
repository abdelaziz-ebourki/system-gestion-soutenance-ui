import { http, HttpResponse, delay } from "msw";
import type { StudentStats } from "@/types";
import {
  MOCK_DELAY,
  studentDocuments, currentStudentId,
  getStudentGroupWorkspace, getStudentDefenseDetails,
  getCurrentStudentGroup, isGroupCreationOpen, mapGroupDetails,
  studentGroups,
} from "./data";

export const studentHandlers = [
  http.get("/api/student/stats", async () => {
    await delay(MOCK_DELAY);
    const groupWorkspace = getStudentGroupWorkspace();
    const currentDefense = getStudentDefenseDetails();
    const stats: StudentStats = {
      documentCount: studentDocuments.length,
      missingDocuments: studentDocuments.filter(
        (document) => document.status === "missing",
      ).length,
      groupMembers: groupWorkspace.currentGroup?.members.length || 0,
      defenseStatus: currentDefense.status,
    };
    return HttpResponse.json(stats);
  }),

  http.get("/api/student/defense", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(getStudentDefenseDetails());
  }),

  http.get("/api/student/group", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(getStudentGroupWorkspace());
  }),

  http.post("/api/student/group", async () => {
    await delay(MOCK_DELAY);

    if (!isGroupCreationOpen()) {
      return HttpResponse.json(
        {
          message:
            "La creation de groupe n'est pas autorisee en dehors de la periode configuree.",
        },
        { status: 400 },
      );
    }

    if (getCurrentStudentGroup()) {
      return HttpResponse.json(
        { message: "Vous appartenez déjà à un groupe pour cette session." },
        { status: 400 },
      );
    }

    const nextGroupNumber =
      studentGroups.length > 0
        ? Math.max(
            ...studentGroups.map((group) =>
              Number.parseInt(group.groupName.replace("Groupe-", ""), 10),
            ),
          ) + 1
        : 1;
    const newGroup = {
      id: `sg${studentGroups.length + 1}`,
      groupName: `Groupe-${nextGroupNumber}`,
      memberIds: [currentStudentId],
    };
    studentGroups.push(newGroup);
    return HttpResponse.json(mapGroupDetails(newGroup), { status: 201 });
  }),

  http.post("/api/student/group/:id/join", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;

    if (!isGroupCreationOpen()) {
      return HttpResponse.json(
        {
          message:
            "Vous ne pouvez pas rejoindre un groupe en dehors de la periode configuree.",
        },
        { status: 400 },
      );
    }

    if (getCurrentStudentGroup()) {
      return HttpResponse.json(
        { message: "Vous appartenez déjà à un groupe pour cette session." },
        { status: 400 },
      );
    }

    const group = studentGroups.find((item) => item.id === id);
    if (!group) {
      return new HttpResponse(null, { status: 404 });
    }

    group.memberIds.push(currentStudentId);
    return HttpResponse.json(mapGroupDetails(group));
  }),

  http.get("/api/student/documents", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(studentDocuments);
  }),

  http.get("/api/student/convocation", async () => {
    await delay(MOCK_DELAY);
    const defense = getStudentDefenseDetails();

    if (!defense.convocationUrl) {
      return HttpResponse.json(
        { message: "Aucune convocation n'est disponible pour le moment." },
        { status: 404 },
      );
    }

    const content = [
      "CONVOCATION DE SOUTENANCE",
      `Projet: ${defense.projectTitle}`,
      `Date: ${defense.date}`,
      `Horaire: ${defense.startTime} - ${defense.endTime}`,
      `Salle: ${defense.roomName}`,
      `Encadrant: ${defense.supervisorName}`,
    ].join("\n");

    return new HttpResponse(content, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="convocation-soutenance.pdf"',
      },
    });
  }),
];
