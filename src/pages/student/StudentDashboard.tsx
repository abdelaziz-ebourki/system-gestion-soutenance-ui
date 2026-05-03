import { useState } from "react";
import {
	Calendar,
	Clock,
	MapPin,
	Download,
	User,
	Award,
	CheckCircle2,
	BookOpen,
	GraduationCap,
	FileCheck,
	Users,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConvocationDialog from "@/components/academic/ConvocationDialog";

export default function StudentDashboard() {
	const [isConvocationOpen, setIsConvocationOpen] = useState(false);

	const studentData = {
		students: [
			{ name: "Mohamed Ali", cne: "D135678942" },
			{ name: "Yassine El Amrani", cne: "D135678943" },
		],
		filiere: "SMI - Sciences Mathématiques et Informatique",
		projectTitle: "Système Intelligente de Gestion des dépenses et des budgets",
		date: "15 Juin 2026",
		time: "09:30 AM",
		room: "TD-05",
		jury: [
			{ role: "Président", name: "Pr. Ahmed Alami" },
			{ role: "Rapporteur", name: "Dr. Sarah Mansouri" },
			{ role: "Examinateur", name: "Dr. Karim Benali" },
		],
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-heading font-bold">
						Bienvenue dans votre espace
					</h1>
					<p className="text-muted-foreground font-sans">
						Suivez l'état de votre soutenance et téléchargez vos documents
						officiels.
					</p>
				</div>
				<Button
					className="gap-2 shadow-lg hover:shadow-primary/20 transition-all rounded-xl h-11"
					onClick={() => setIsConvocationOpen(true)}
				>
					<Download className="h-4 w-4" />
					Ma Convocation Officielle
				</Button>
			</div>

			<div className="grid lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3 space-y-6">
					<Card className="border-primary/20 bg-primary/2 shadow-sm overflow-hidden relative">
						<div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
							<GraduationCap className="h-32 w-32" />
						</div>
						<CardHeader className="pb-2">
							<div className="flex justify-between items-start">
								<div>
									<CardTitle className="text-2xl font-heading">
										Ma Soutenance
									</CardTitle>
									<CardDescription className="font-sans">
										Session de Printemps 2026
									</CardDescription>
								</div>
								<Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest">
									Statut: Confirmée
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-8">
							<div className="grid sm:grid-cols-3 gap-6 relative z-10">
								<div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
									<div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
										<Calendar className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
											Date de passage
										</p>
										<p className="font-bold text-lg text-slate-800">
											{studentData.date}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
									<div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
										<Clock className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
											Heure précise
										</p>
										<p className="font-bold text-lg text-slate-800">
											{studentData.time}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
									<div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
										<MapPin className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
											Salle assignée
										</p>
										<p className="font-bold text-lg text-slate-800">
											{studentData.room}
										</p>
									</div>
								</div>
							</div>

							<div className="p-8 bg-slate-900 text-slate-50 rounded-3xl shadow-xl space-y-4 relative overflow-hidden group border border-white/5">
								<div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="space-y-1 relative z-10">
									<p className="text-xs uppercase font-bold text-primary tracking-[0.2em]">
										Titre du Projet
									</p>
									<h3 className="text-2xl font-heading font-medium italic leading-snug">
										"{studentData.projectTitle}"
									</h3>
								</div>

								<div className="pt-4 flex flex-wrap gap-4 relative z-10">
									<div className="space-y-2 w-full">
										<p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
											<Users className="h-3 w-3" /> Candidat(s) du Groupe
										</p>
										<div className="flex flex-wrap gap-3">
											{studentData.students.map((s, i) => (
												<div
													key={i}
													className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3"
												>
													<div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
														{s.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</div>
													<div className="flex flex-col">
														<span className="text-sm font-bold">{s.name}</span>
														<span className="text-[10px] text-slate-400 font-mono">
															{s.cne}
														</span>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-6">
								<h3 className="font-heading text-xl font-semibold flex items-center gap-3 text-slate-800">
									<User className="h-5 w-5 text-primary" /> Composition du Jury
								</h3>
								<div className="grid sm:grid-cols-3 gap-6">
									{studentData.jury.map((member) => (
										<div
											key={member.role}
											className="group p-6 rounded-3xl border border-slate-100 bg-white hover:border-primary/30 transition-all hover:shadow-xl text-center space-y-4"
										>
											<div className="h-20 w-20 mx-auto rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
												<User className="h-10 w-10 text-primary" />
											</div>
											<div>
												<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
													{member.role}
												</p>
												<p className="font-heading text-lg font-bold text-slate-800">
													{member.name}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-none shadow-none bg-transparent">
						<CardHeader className="px-0">
							<CardTitle className="text-2xl font-heading">
								Mon Parcours Académique
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0">
							<div className="relative">
								<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
								<div className="space-y-8 relative">
									{[
										{
											title: "Dépôt du Sujet",
											date: "Janvier 2026",
											status: "done",
											icon: BookOpen,
										},
										{
											title: "Validation de l'Encadrant",
											date: "Mars 2026",
											status: "done",
											icon: CheckCircle2,
										},
										{
											title: "Affectation du Jury",
											date: "Mai 2026",
											status: "done",
											icon: User,
										},
										{
											title: "Génération de Convocation",
											date: "Juin 2026",
											status: "done",
											icon: FileCheck,
										},
										{
											title: "Jour de la Soutenance",
											date: "15 Juin 2026",
											status: "pending",
											icon: GraduationCap,
										},
									].map((step, i) => (
										<div key={i} className="flex items-start gap-8 group">
											<div
												className={`relative z-10 flex items-center justify-center h-9 w-9 rounded-xl border-2 bg-white transition-all shadow-sm ${step.status === "done" ? "border-primary bg-primary text-white scale-110" : "border-slate-300 text-slate-300"}`}
											>
												<step.icon className="h-4 w-4" />
											</div>
											<div className="pt-1 space-y-1">
												<h4
													className={`font-bold ${step.status === "done" ? "text-slate-800" : "text-slate-400"}`}
												>
													{step.title}
												</h4>
												<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
													{step.date}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card className="bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-2xl border-none rounded-3xl overflow-hidden group">
						<CardContent className="p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden">
							<div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
								<Award className="h-40 w-40" />
							</div>
							<div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 group-hover:rotate-12 transition-transform">
								<Award className="h-10 w-10 text-primary" />
							</div>
							<div className="space-y-4">
								<h3 className="font-heading text-2xl font-bold leading-tight">
									Prêt pour le grand jour ?
								</h3>
								<p className="text-slate-300 text-sm font-sans leading-relaxed italic">
									"L'éducation est l'arme la plus puissante pour changer le
									monde."
								</p>
								<p className="text-[10px] uppercase font-bold tracking-widest text-primary">
									— Nelson Mandela
								</p>
							</div>
						</CardContent>
					</Card>

					<div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
						<p className="text-[10px] uppercase font-bold text-primary tracking-widest">
							Assistance
						</p>
						<p className="text-xs text-slate-600 leading-relaxed font-medium">
							En cas de problème technique ou d'erreur dans vos informations,
							contactez le coordinateur de filière.
						</p>
					</div>
				</div>
			</div>

			<ConvocationDialog
				isOpen={isConvocationOpen}
				onClose={() => setIsConvocationOpen(false)}
				students={studentData.students}
				filiere={studentData.filiere}
				projectTitle={studentData.projectTitle}
				date={studentData.date}
				time={studentData.time}
				room={studentData.room}
				jury={studentData.jury}
			/>
		</div>
	);
}
