import * as React from "react";
import { Ban, CalendarClock, Save } from "lucide-react";

import {
	getTeacherSchedule,
	getTeacherUnavailability,
	saveTeacherUnavailability,
} from "@/lib/api";
import type { TeacherDefense, TeacherUnavailability } from "@/types";
import { toast } from "sonner";
import AvailabilityCalendar from "@/components/academic/AvailabilityCalendar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type CalendarSession = {
	dateKey: string;
	time: string;
	student: string;
	room: string;
};

export default function TeacherUnavailability() {
	const [schedule, setSchedule] = React.useState<TeacherDefense[]>([]);
	const [unavailability, setUnavailability] = React.useState<TeacherUnavailability>({
		slotsByDate: {},
	});
	const [isLoading, setIsLoading] = React.useState(true);
	const [isSaving, setIsSaving] = React.useState(false);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				const [scheduleData, unavailabilityData] = await Promise.all([
					getTeacherSchedule(),
					getTeacherUnavailability(),
				]);
				setSchedule(scheduleData);
				setUnavailability(unavailabilityData);
			} catch {
				toast.error("Erreur lors du chargement des indisponibilites");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleToggleSlot = (dateKey: string, slot: string) => {
		setUnavailability((current) => {
			const currentSlots = current.slotsByDate[dateKey] || [];
			const nextSlots = currentSlots.includes(slot)
				? currentSlots.filter((item) => item !== slot)
				: [...currentSlots, slot];
			const nextState = { ...current.slotsByDate };

			if (nextSlots.length === 0) {
				delete nextState[dateKey];
			} else {
				nextState[dateKey] = nextSlots;
			}

			return { slotsByDate: nextState };
		});
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await saveTeacherUnavailability(unavailability);
			toast.success("Indisponibilites enregistrees");
		} catch {
			toast.error("Erreur lors de l'enregistrement");
		} finally {
			setIsSaving(false);
		}
	};

	const totalBlockedSlots = Object.values(unavailability.slotsByDate).reduce(
		(total, slots) => total + slots.length,
		0,
	);

	const sessions: CalendarSession[] = schedule.map((defense) => ({
		dateKey: defense.date,
		time: `${defense.startTime} - ${defense.endTime}`,
		student: defense.studentNames.join(", "),
		room: defense.roomName,
	}));

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Mes indisponibilites</h1>
					<p className="text-muted-foreground">
						Gerez vos creneaux d'indisponibilite pour la planification des
						soutenances.
					</p>
				</div>
				<Button onClick={handleSave} disabled={isSaving}>
					<Save className="mr-2 size-4" />
					{isSaving ? "Enregistrement..." : "Enregistrer"}
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Creneaux bloques</p>
							<p className="mt-2 text-3xl font-semibold">{totalBlockedSlots}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<Ban className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Jours concernes</p>
							<p className="mt-2 text-3xl font-semibold">
								{Object.keys(unavailability.slotsByDate).length}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<CalendarClock className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Rappel</CardTitle>
						<CardDescription>
							Les creneaux deja associes a une soutenance sont verrouilles.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>

			{isLoading ? (
				<Card className="border-0 shadow-sm">
					<CardContent className="py-10 text-center text-sm text-muted-foreground">
						Chargement du calendrier...
					</CardContent>
				</Card>
			) : (
				<AvailabilityCalendar
					unavailableSlots={unavailability.slotsByDate}
					onToggleSlot={handleToggleSlot}
					sessions={sessions}
					onSave={handleSave}
				/>
			)}
		</div>
	);
}
