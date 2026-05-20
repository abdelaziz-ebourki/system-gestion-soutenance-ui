import type {
  User, Student, Major, Level, Grade,
  Department, Session, Room,
  Project, Jury,
  TeacherDefense, TeacherEvaluation, TeacherUnavailability,
  StudentGroupDetails, StudentGroupWorkspace, StudentDefenseDetails, StudentDocument,
} from "@/types";

export const MOCK_DELAY = Number(import.meta.env.VITE_MOCK_DELAY) || 1000;

export const mockMajors: Major[] = [
  { id: "f1", name: "Génie Informatique" },
  { id: "f2", name: "Génie Industriel" },
  { id: "f3", name: "Génie Civil" },
  { id: "f4", name: "Génie Électrique" },
  { id: "f5", name: "Management" },
];

export const mockLevels: Level[] = [
  { id: "n1", name: "Licence" },
  { id: "n2", name: "Master" },
  { id: "n3", name: "Doctorat" },
];

export const mockGrades: Grade[] = [
  { id: "g1", name: "PES" },
  { id: "g2", name: "PH" },
  { id: "g3", name: "PA" },
];

const firstNames = [
  "Amine", "Salma", "Yassine", "Fatima", "Mehdi",
  "Sofia", "Omar", "Hajar", "Khalid", "Layla",
  "Zakaria", "Nadia", "Hamza", "Zineb", "Anas",
  "Meryem", "Reda", "Chaimae", "Ayoub", "Ibtissam",
];

const lastNames = [
  "Alami", "Benali", "Fassi", "Tazi", "Mansouri",
  "Radi", "Idrissi", "Bennani", "Kettani", "Amrani",
  "Lahlou", "Sekkat", "Guessous", "Filali", "Skalli",
  "Kadiri", "Belkora", "Mernissi", "Berrada", "El Hachimi",
];

const generateStudents = (count: number): Student[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `std-${i + 1}`,
    lastName: lastNames[i % lastNames.length],
    firstName: firstNames[i % firstNames.length],
    email: `student${i + 1}@univ.com`,
    role: "student",
    isActive: true,
    cne: `E13000${i + 1}`,
    majorId: mockMajors[i % mockMajors.length].id,
    levelId: mockLevels[i % mockLevels.length].id,
  }));

export const mockUsers: User[] = [
  {
    id: "1", email: "admin@univ.com", password: "1234",
    role: "admin", lastName: "Ahmadi", firstName: "Mohamed", isActive: true,
  },
  {
    id: "2", email: "coord@univ.com", password: "1234",
    role: "coordinator", lastName: "Ouchen", firstName: "Yassin", isActive: true,
  },
  {
    id: "3", email: "teacher@univ.com", password: "1234",
    role: "teacher", lastName: "Ali", firstName: "Ben Ali",
    isActive: true, gradeId: "g1", departmentId: "1",
  } as User,
  {
    id: "4", email: "moussa@univ.com", password: "1234",
    role: "teacher", lastName: "Alami", firstName: "Moussa",
    isActive: true, gradeId: "g2", departmentId: "2",
  } as User,
  {
    id: "std-demo", lastName: "Mohamed", firstName: "Khalid",
    email: "student@univ.com", password: "1234", role: "student",
    isActive: true, cne: "E13000999", majorId: "f1", levelId: "n2",
  } as User,
  ...generateStudents(50),
];

export const mockDepartments: Department[] = [
  { id: "1", name: "Informatique", code: "INFO", headId: "4" },
  { id: "2", name: "Mathématiques", code: "MATH", headId: "3" },
  { id: "3", name: "Physique", code: "PHYS", headId: "3" },
];

export const mockSessions: Session[] = [
  {
    id: "1", name: "Session Normale 2026", type: "Normale",
    status: "active", startDate: "2026-06-01", endDate: "2026-06-30",
  },
  {
    id: "2", name: "Session Rattrapage 2026", type: "Rattrapage",
    status: "draft", startDate: "2026-09-01", endDate: "2026-09-15",
  },
];

export const mockRooms: Room[] = [
  { id: "1", name: "TD-1", capacity: 30, departmentId: "1" },
  { id: "2", name: "TD-2", capacity: 30, departmentId: "1" },
  { id: "3", name: "Amphi-1", capacity: 150, departmentId: "2" },
  { id: "4", name: "TP-1", capacity: 20, departmentId: "1" },
  { id: "5", name: "TP-2", capacity: 20, departmentId: "2" },
];

export const defenseSettings = {
  startTime: "08:00",
  endTime: "18:00",
  defenseDuration: 30,
  breakDuration: 15,
  groupCreationStartDate: "2026-05-01",
  groupCreationEndDate: "2026-06-20",
};

export let mockProjects: Project[] = [
  {
    id: "p1", title: "Systeme de Gestion des Soutenances",
    description: "Plateforme de planification, notifications et suivi des jurys.",
    studentIds: ["std-1", "std-2"], studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"],
    supervisorId: "3", supervisorName: "Ali Ben Ali", status: "approved",
  },
  {
    id: "p2", title: "Application E-learning adaptative",
    description: "Personnalisation des parcours selon les performances.",
    studentIds: ["std-3"], studentNames: ["Nom3 Prenom3"],
    supervisorId: "4", supervisorName: "Alami Moussa", status: "pending",
  },
  {
    id: "p3", title: "Analyse des donnees IoT",
    description: "Pipeline d'agregation et tableau de bord temps reel.",
    studentIds: ["std-4", "std-5"], studentNames: ["Nom4 Prenom4", "Nom5 Prenom5"],
    supervisorId: "3", supervisorName: "Ali Ben Ali", status: "approved",
  },
  {
    id: "p4", title: "Securite des reseaux cloud",
    description: "Detection d'anomalies et gouvernance des acces.",
    studentIds: ["std-6"], studentNames: ["Nom6 Prenom6"],
    supervisorId: "4", supervisorName: "Alami Moussa", status: "approved",
  },
  {
    id: "p5", title: "Portail intelligent de suivi des soutenances",
    description: "Interface et services pour suivre planning, documents et evaluations.",
    studentIds: ["std-1", "std-2"], studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"],
    supervisorId: "3", supervisorName: "Ali Ben Ali", status: "approved",
  },
];

export let mockJuries: Jury[] = [
  {
    id: "j1", projectId: "p1", projectTitle: "Systeme de Gestion des Soutenances",
    presidentId: "3", presidentName: "Ali Ben Ali",
    reporterId: "4", reporterName: "Alami Moussa",
    examinerId: "2", examinerName: "Ouchen Yassin",
  },
  {
    id: "j2", projectId: "p3", projectTitle: "Analyse des donnees IoT",
    presidentId: "4", presidentName: "Alami Moussa",
    reporterId: "3", reporterName: "Ali Ben Ali",
    examinerId: "2", examinerName: "Ouchen Yassin",
  },
  {
    id: "j3", projectId: "p5", projectTitle: "Portail intelligent de suivi des soutenances",
    presidentId: "4", presidentName: "Alami Moussa",
    reporterId: "3", reporterName: "Ali Ben Ali",
    examinerId: "2", examinerName: "Ouchen Yassin",
  },
];

export const teacherSchedule: TeacherDefense[] = [
  {
    id: "td1", projectId: "p1", projectTitle: "Systeme de Gestion des Soutenances",
    studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"],
    date: "2026-06-10", startTime: "08:30", endTime: "10:00",
    roomName: "Salle 101", role: "president", status: "scheduled",
  },
  {
    id: "td2", projectId: "p3", projectTitle: "Analyse des donnees IoT",
    studentNames: ["Nom4 Prenom4", "Nom5 Prenom5"],
    date: "2026-06-11", startTime: "10:15", endTime: "11:45",
    roomName: "Amphi B", role: "reporter", status: "scheduled",
  },
  {
    id: "td3", projectId: "p4", projectTitle: "Securite des reseaux cloud",
    studentNames: ["Nom6 Prenom6"],
    date: "2026-06-07", startTime: "13:45", endTime: "15:15",
    roomName: "Labo Info", role: "supervisor", status: "completed",
  },
];

export const teacherEvaluations: TeacherEvaluation[] = [
  {
    id: "te1", defenseId: "td1", projectTitle: "Systeme de Gestion des Soutenances",
    studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"], role: "president", status: "pending",
  },
  {
    id: "te2", defenseId: "td2", projectTitle: "Analyse des donnees IoT",
    studentNames: ["Nom4 Prenom4", "Nom5 Prenom5"], role: "reporter", status: "pending",
  },
  {
    id: "te3", defenseId: "td3", projectTitle: "Securite des reseaux cloud",
    studentNames: ["Nom6 Prenom6"], role: "supervisor",
    score: 17, comment: "Presentation claire et demonstration solide.",
    status: "submitted", submittedAt: "2026-06-07T16:20:00Z",
  },
];

export let teacherUnavailability: TeacherUnavailability = {
  slotsByDate: {
    "2026-06-09": ["10:15 - 11:45"],
    "2026-06-12": ["08:30 - 10:00", "10:15 - 11:45"],
  },
};

interface StudentGroupData {
  id: string;
  groupName: string;
  memberIds: string[];
  projectId?: string;
}

export const studentGroups: StudentGroupData[] = [
  { id: "sg1", groupName: "Groupe-1", memberIds: ["std-1", "std-2"], projectId: "p5" },
  { id: "sg2", groupName: "Groupe-2", memberIds: ["std-3"], projectId: "p2" },
];

export const studentDocuments: StudentDocument[] = [
  {
    id: "sd1", name: "Rapport final.pdf", type: "Rapport",
    deadline: "2026-06-05", status: "validated", submittedAt: "2026-06-03 14:20",
  },
  {
    id: "sd2", name: "Presentation finale.pptx", type: "Presentation",
    deadline: "2026-06-10", status: "submitted", submittedAt: "2026-06-09 18:05",
  },
  {
    id: "sd3", name: "Code source.zip", type: "Archive",
    deadline: "2026-06-10", status: "missing",
  },
];

export const currentStudentId = "std-demo";

export const getUserFullName = (userId: string) => {
  const user = mockUsers.find((item) => item.id === userId);
  return user ? `${user.lastName} ${user.firstName}` : "Utilisateur inconnu";
};

export const getStudentEmail = (studentId: string) => {
  const student = mockUsers.find((item) => item.id === studentId) as Student | undefined;
  return student?.email || "";
};

export const getCurrentStudentGroup = () =>
  studentGroups.find((group) => group.memberIds.includes(currentStudentId)) || null;

export const mapGroupDetails = (group: StudentGroupData): StudentGroupDetails => {
  const project = group.projectId
    ? mockProjects.find((item) => item.id === group.projectId)
    : undefined;

  return {
    id: group.id,
    groupName: group.groupName,
    projectTitle: project?.title,
    supervisorName: project?.supervisorName,
    members: group.memberIds.map((memberId) => ({
      id: memberId,
      fullName: getUserFullName(memberId),
      email: getStudentEmail(memberId),
      role: memberId === group.memberIds[0] ? "leader" : "member",
    })),
  };
};

export const isGroupCreationOpen = () => {
  const today = new Date().toISOString().slice(0, 10);
  return (
    today >= defenseSettings.groupCreationStartDate &&
    today <= defenseSettings.groupCreationEndDate
  );
};

export const getStudentGroupWorkspace = (): StudentGroupWorkspace => {
  const currentGroup = getCurrentStudentGroup();
  return {
    currentGroup: currentGroup ? mapGroupDetails(currentGroup) : null,
    availableGroups: studentGroups
      .filter((group) => !group.memberIds.includes(currentStudentId))
      .map((group) => ({
        id: group.id,
        groupName: group.groupName,
        memberCount: group.memberIds.length,
      })),
    groupCreationStartDate: defenseSettings.groupCreationStartDate,
    groupCreationEndDate: defenseSettings.groupCreationEndDate,
    isGroupCreationOpen: isGroupCreationOpen(),
  };
};

export const prependProject = (project: Project) => {
  mockProjects = [project, ...mockProjects];
};

export const prependJury = (jury: Jury) => {
  mockJuries = [jury, ...mockJuries];
};

export const removeJuryByProject = (projectId: string) => {
  mockJuries = mockJuries.filter((j) => j.projectId !== projectId);
};

export const replaceTeacherUnavailability = (data: TeacherUnavailability) => {
  teacherUnavailability = data;
};

export const getStudentDefenseDetails = (): StudentDefenseDetails => {
  const currentGroup = getCurrentStudentGroup();
  const project = currentGroup?.projectId
    ? mockProjects.find((item) => item.id === currentGroup.projectId)
    : undefined;
  const jury = project
    ? mockJuries.find((item) => item.projectId === project.id)
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
    supervisorName: project.supervisorName,
    juryMembers: jury
      ? [
          { name: jury.presidentName, role: "President" },
          { name: jury.reporterName, role: "Rapporteur" },
          { name: jury.examinerName, role: "Examinateur" },
        ]
      : [],
    date: project.id === "p5" ? "2026-06-14" : undefined,
    startTime: project.id === "p5" ? "10:15" : undefined,
    endTime: project.id === "p5" ? "11:45" : undefined,
    roomName: project.id === "p5" ? "Salle 101" : undefined,
    status: project.id === "p5" ? "scheduled" : "pending",
    convocationUrl: project.id === "p5" ? "/api/student/convocation" : undefined,
  };
};
