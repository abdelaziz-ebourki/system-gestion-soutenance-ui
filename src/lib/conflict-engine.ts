/**
 * ConflictEngine utility for validating scheduling operations.
 */

interface ConflictResult {
	isValid: boolean;
	reason?: string;
}

// Mock of existing schedules/constraints for validation
// In production, this would interact with the API layer.
export const validateSlotAssignment = (
	projectId: string,
	slot: string,
	currentSchedule: Record<string, { id: string; title: string }>
): ConflictResult => {
	const isProjectAlreadyScheduled = Object.values(currentSchedule).some(
		(project) => project.id === projectId,
	);

	if (isProjectAlreadyScheduled) {
		return {
			isValid: false,
			reason: "Ce projet est deja planifie sur un autre creneau.",
		};
	}

	// Rule 1: Check if slot is already occupied
	if (currentSchedule[slot]) {
		return {
			isValid: false,
			reason: "Ce créneau est déjà occupé par un autre projet.",
		};
	}

	// Rule 2: Mock "Jury/Teacher Conflict" check
	// For now, let's assume we can't schedule projects on a specific 'dummy' slot
	if (slot === "12:00") {
		return {
			isValid: false,
			reason: "Indisponibilité détectée : Jury non disponible à 12:00.",
		};
	}

	return { isValid: true };
};
