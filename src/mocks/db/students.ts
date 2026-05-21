import type { DbStudent } from "./schema";

export const students: DbStudent[] = [
  {
    id: "std-demo", cne: "E13000999", majorId: "f1", levelId: "n2",
  },
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `std-${i + 1}`,
    cne: `E13000${i + 1}`,
    majorId: (i % 5 === 0 ? "f1" : i % 5 === 1 ? "f2" : i % 5 === 2 ? "f3" : i % 5 === 3 ? "f4" : "f5"),
    levelId: (i % 3 === 0 ? "n1" : i % 3 === 1 ? "n2" : "n3"),
  } satisfies DbStudent)),
];
