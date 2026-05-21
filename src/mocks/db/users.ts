import type { DbUser } from "./schema";

export const users: DbUser[] = [
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
    role: "teacher", lastName: "Ali", firstName: "Ben Ali", isActive: true,
  },
  {
    id: "4", email: "moussa@univ.com", password: "1234",
    role: "teacher", lastName: "Alami", firstName: "Moussa", isActive: true,
  },
  {
    id: "std-demo", lastName: "Mohamed", firstName: "Khalid",
    email: "student@univ.com", password: "1234", role: "student",
    isActive: true,
  },
];

export function generateStudents(): DbUser[] {
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

  return Array.from({ length: 50 }, (_, i) => ({
    id: `std-${i + 1}`,
    lastName: lastNames[i % lastNames.length],
    firstName: firstNames[i % firstNames.length],
    email: `student${i + 1}@univ.com`,
    password: "",
    role: "student" as const,
    isActive: true,
  }));
}
