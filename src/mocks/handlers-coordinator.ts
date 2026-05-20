import { http, HttpResponse, delay } from "msw";
import type { Project, Jury } from "@/types";
import {
  MOCK_DELAY,
  mockProjects, mockJurys,
  prependProject, prependJury, removeJuryByProject,
} from "./data";

export const coordinatorHandlers = [
  http.get("/api/coordinator/stats", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({
      totalProjects: mockProjects.length,
      totalGroups: mockProjects.length,
      totalJuries: mockJurys.length,
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

  http.get("/api/coordinator/jurys", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockJurys);
  }),

  http.post("/api/coordinator/jurys", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Jury, "id">;
    const newJury: Jury = {
      ...body,
      id: `j${mockJurys.length + 1}`,
    };
    prependJury(newJury);
    return HttpResponse.json(newJury, { status: 201 });
  }),

  http.post("/api/coordinator/schedule", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json();
    console.log("Schedule saved:", body);
    return HttpResponse.json({ message: "Schedule saved successfully" });
  }),
];
