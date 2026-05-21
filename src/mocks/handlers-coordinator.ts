import { http, HttpResponse, delay } from "msw";
import type { Project, Jury, Group } from "@/types";
import {
  MOCK_DELAY,
  mockProjects, mockGroups, mockJuries,
  prependProject, prependJury, removeJuryByProject,
} from "./data";

export const coordinatorHandlers = [
  http.get("/api/coordinator/stats", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({
      totalProjects: mockProjects.length,
      totalGroups: mockProjects.length,
      totalJuries: mockJuries.length,
      scheduledDefenses: 6,
    });
  }),

  http.get("/api/coordinator/projects", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockProjects);
  }),

  http.post("/api/coordinator/projects", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Project, "id">;
    const newProject: Project = {
      ...body,
      id: `p${mockProjects.length + 1}`,
    };
    prependProject(newProject);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.put("/api/coordinator/projects/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Partial<Project>;
    const index = mockProjects.findIndex((project) => project.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockProjects[index] = { ...mockProjects[index], ...body };
    return HttpResponse.json(mockProjects[index]);
  }),

  http.delete("/api/coordinator/projects/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const id = params.id as string;
    const index = mockProjects.findIndex((project) => project.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    mockProjects.splice(index, 1);
    removeJuryByProject(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/coordinator/juries", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockJuries);
  }),

  http.post("/api/coordinator/juries", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Jury, "id">;
    const newJury: Jury = {
      ...body,
      id: `j${mockJuries.length + 1}`,
    };
    prependJury(newJury);
    return HttpResponse.json(newJury, { status: 201 });
  }),

  http.get("/api/coordinator/groups", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockGroups);
  }),

  http.post("/api/coordinator/groups", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Group, "id">;
    const newGroup: Group = {
      ...body,
      id: `g${mockGroups.length + 1}`,
    };
    mockGroups.push(newGroup);
    return HttpResponse.json(newGroup, { status: 201 });
  }),

  http.delete("/api/coordinator/groups/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = mockGroups.findIndex((g) => g.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    mockGroups.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.put("/api/coordinator/juries/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Partial<Jury>;
    const index = mockJuries.findIndex((j) => j.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    mockJuries[index] = { ...mockJuries[index], ...body };
    return HttpResponse.json(mockJuries[index]);
  }),

  http.delete("/api/coordinator/juries/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = mockJuries.findIndex((j) => j.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    mockJuries.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/coordinator/schedule", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json();
    console.log("Schedule saved:", body);
    return HttpResponse.json({ message: "Schedule saved successfully" });
  }),
];
