import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	CalendarDays,
	DoorOpen,
	Edit,
	MoreVertical,
	Plus,
	Search,
	Trash2,
	Users,
	CheckCircle2,
	XCircle,
	Clock,
	Upload,
	Building2,
	FileDown,
	School,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type {
	AdminStatMetric,
	GlobalSession,
	Room,
	SessionStatus,
	User,
	UserRole,
	UniversitySettings,
} from "./types";
import { StatCard } from "@/components/teacher/StatCard";

type SectionKey = "users" | "rooms" | "sessions" | "establishment" | "settings";

type Notice = {
	variant: "default" | "destructive";
	title: string;
	description: string;
} | null;

type EstablishmentItem = {
	id: number;
	type: "UNIVERSITE" | "FACULTE" | "DEPARTEMENT" | "FILIERE";
	nom: string;
	parent?: string;
};

const stats: AdminStatMetric[] = [
	{
		title: "Utilisateurs",
		value: "124",
		icon: Users,
		bg: "bg-primary/5",
	},
	{
		title: "Salles Disponibles",
		value: "12",
		icon: DoorOpen,
		bg: "bg-primary/5",
	},
	{
		title: "Sessions Globales",
		value: "03",
		icon: CalendarDays,
		bg: "bg-primary/5",
	},
];

const initialUsers: User[] = [
	{
		id: 4,
		nom: "Benani",
		prenom: "Amine",
		email: "amine.benani@student.ma",
		role: "ADMIN",
		actif: true,
	},
	{
		id: 5,
		nom: "El Mansouri",
		prenom: "Sami",
		email: "sami.elmansouri@univ.ma",
		role: "TEACHER",
		actif: true,
	},
	{
		id: 6,
		nom: "Alami",
		prenom: "Yasmine",
		email: "yasmine.alami@student.ma",
		role: "STUDENT",
		actif: true,
	},
	{
		id: 7,
		nom: "Idrissi",
		prenom: "Karim",
		email: "k.idrissi@univ.ma",
		role: "COORDINATOR",
		actif: false,
	},
];

const initialRooms: Room[] = [
	{
		id: 1,
		nom: "Amphi 1",
		batiment: "Bloc A",
		capacite: 200,
		disponible: true,
	},
	{
		id: 2,
		nom: "TD 1",
		batiment: "Bloc B",
		capacite: 40,
		disponible: true,
	},
];

const initialSessions: GlobalSession[] = [
	{
		id: 1,
		libelle: "Session Printemps 2026",
		dateDebut: "2026-06-01",
		dateFin: "2026-06-30",
		statut: "OUVERTE",
	},
];

const initialEstablishment: EstablishmentItem[] = [
	{ id: 1, type: "UNIVERSITE", nom: "Université Abdelmalek Essaâdi" },
	{ id: 2, type: "FACULTE", nom: "Faculté des Sciences", parent: "UAE" },
	{ id: 3, type: "DEPARTEMENT", nom: "Informatique", parent: "FS" },
	{ id: 4, type: "FILIERE", nom: "SMI", parent: "Informatique" },
];

const initialSettings: UniversitySettings & {
	slotDuration: number;
	restDuration: number;
	startHour: string;
	endHour: string;
} = {
	name: "Université Abdelmalek Essaâdi",
	logoUrl: "/logo.svg",
	defenseSlots: ["08:30 - 10:00", "10:15 - 11:45", "14:00 - 15:30", "15:45 - 17:15"],
	slotDuration: 90,
	restDuration: 15,
	startHour: "08:30",
	endHour: "18:00",
};

const sectionMeta: Record<
	SectionKey,
	{
		title: string;
		description: string;
		placeholder: string;
		actionLabel: string;
		actionIcon: any;
	}
> = {
	users: {
		title: "Gestion des Comptes",
		description: "Consultez et modifiez les accès des différents acteurs du système.",
		placeholder: "Rechercher un utilisateur...",
		actionLabel: "Nouvel Utilisateur",
		actionIcon: Plus,
	},
	rooms: {
		title: "Catalogue des Salles",
		description: "Gérez les espaces de soutenance et leur disponibilité.",
		placeholder: "Rechercher une salle...",
		actionLabel: "Ajouter une salle",
		actionIcon: Plus,
	},
	sessions: {
		title: "Sessions Globales",
		description: "Configurez les périodes de soutenance et leur état.",
		placeholder: "Rechercher une session...",
		actionLabel: "Créer une session",
		actionIcon: Plus,
	},
	establishment: {
		title: "Structure Académique",
		description: "Gérez les universités, facultés, départements et filières.",
		placeholder: "Rechercher une entité...",
		actionLabel: "Ajouter une entité",
		actionIcon: Building2,
	},
	settings: {
		title: "Paramétrages Système",
		description: "Configurez les informations de l'établissement et les créneaux horaires.",
		placeholder: "",
		actionLabel: "Enregistrer les modifications",
		actionIcon: CheckCircle2,
	},
};

function getSection(pathname: string): SectionKey {
	if (pathname.endsWith("/rooms")) return "rooms";
	if (pathname.endsWith("/sessions")) return "sessions";
	if (pathname.endsWith("/establishment")) return "establishment";
	if (pathname.endsWith("/settings")) return "settings";
	return "users";
}

export default function AdminDashboard() {
	const location = useLocation();
	const navigate = useNavigate();
	const activeSection = getSection(location.pathname);

	const [query, setQuery] = useState("");
	const [users, setUsers] = useState(initialUsers);
	const [rooms, setRooms] = useState(initialRooms);
	const [sessions, setSessions] = useState(initialSessions);
	const [establishment, setEstablishment] = useState(initialEstablishment);
	const [notice, setNotice] = useState<Notice>(null);
	
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	
	const meta = sectionMeta[activeSection];

	const handleSectionChange = (nextSection: string) => {
		navigate(`/admin/${nextSection}`);
		setQuery("");
	};

	const handleImportCSV = () => {
		setNotice({
			variant: "default",
			title: "Importation réussie",
			description: "50 nouveaux utilisateurs ont été importés avec succès.",
		});
		setImportDialogOpen(false);
	};

	const renderUsers = () => (
		<div className="space-y-6">
			<div className="flex justify-end gap-3">
				<Button 
					variant="outline" 
					className="rounded-xl font-bold gap-2"
					onClick={() => setImportDialogOpen(true)}
				>
					<Upload className="h-4 w-4" /> Import CSV/Excel
				</Button>
			</div>
			<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
				<CardContent className="p-0">
					<Table>
						<TableHeader className="bg-muted/10">
							<TableRow className="border-border">
								<TableHead className="p-6">Utilisateur</TableHead>
								<TableHead className="p-6">Rôle</TableHead>
								<TableHead className="p-6">État</TableHead>
								<TableHead className="p-6 text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map(user => (
								<TableRow key={user.id} className="border-border hover:bg-muted/5">
									<TableCell className="p-6">
										<div className="font-bold">{user.nom} {user.prenom}</div>
										<div className="text-sm text-muted-foreground">{user.email}</div>
									</TableCell>
									<TableCell className="p-6"><Badge variant="secondary">{user.role}</Badge></TableCell>
									<TableCell className="p-6">
										{user.actif ? 
											<Badge className="bg-emerald-500/10 text-emerald-700">Actif</Badge> : 
											<Badge variant="destructive">Inactif</Badge>
										}
									</TableCell>
									<TableCell className="p-6 text-right">
										<Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);

	const renderRooms = () => (
		<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
			<CardContent className="p-0">
				<Table>
					<TableHeader className="bg-muted/10">
						<TableRow className="border-border">
							<TableHead className="p-6">Nom de la Salle</TableHead>
							<TableHead className="p-6">Bâtiment</TableHead>
							<TableHead className="p-6">Capacité</TableHead>
							<TableHead className="p-6 text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rooms.map(room => (
							<TableRow key={room.id} className="border-border hover:bg-muted/5">
								<TableCell className="p-6 font-bold">{room.nom}</TableCell>
								<TableCell className="p-6">{room.batiment}</TableCell>
								<TableCell className="p-6">{room.capacite} places</TableCell>
								<TableCell className="p-6 text-right">
									<Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);

	const renderSessions = () => (
		<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
			<CardContent className="p-0">
				<Table>
					<TableHeader className="bg-muted/10">
						<TableRow className="border-border">
							<TableHead className="p-6">Session</TableHead>
							<TableHead className="p-6">Période</TableHead>
							<TableHead className="p-6">Statut</TableHead>
							<TableHead className="p-6 text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sessions.map(session => (
							<TableRow key={session.id} className="border-border hover:bg-muted/5">
								<TableCell className="p-6 font-bold">{session.libelle}</TableCell>
								<TableCell className="p-6">{session.dateDebut} au {session.dateFin}</TableCell>
								<TableCell className="p-6"><Badge>{session.statut}</Badge></TableCell>
								<TableCell className="p-6 text-right">
									<Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);

	const renderUsers = () => (
		<div className="space-y-6">
			<div className="flex justify-end gap-3">
				<Button 
					variant="outline" 
					className="rounded-xl font-bold gap-2"
					onClick={() => setImportDialogOpen(true)}
				>
					<Upload className="h-4 w-4" /> Import CSV/Excel
				</Button>
			</div>
			<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
				<CardHeader className="bg-muted/20 border-b border-border p-8">

				<CardTitle className="text-2xl font-bold">Structure Académique</CardTitle>
				<CardDescription>Gérez la hiérarchie de votre établissement.</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader className="bg-muted/10">
						<TableRow className="border-border">
							<TableHead className="p-6">Type</TableHead>
							<TableHead className="p-6">Nom de l'Entité</TableHead>
							<TableHead className="p-6">Parent</TableHead>
							<TableHead className="p-6 text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{establishment.map(item => (
							<TableRow key={item.id} className="border-border hover:bg-muted/5">
								<TableCell className="p-6">
									<Badge variant="outline" className="font-bold">{item.type}</Badge>
								</TableCell>
								<TableCell className="p-6 font-bold">{item.nom}</TableCell>
								<TableCell className="p-6 text-muted-foreground">{item.parent || "-"}</TableCell>
								<TableCell className="p-6 text-right">
									<Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
									<Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);

	const renderSettings = () => (
		<div className="grid gap-6 md:grid-cols-2">
			<Card className="border border-border shadow-xl rounded-4xl overflow-hidden">
				<CardHeader className="bg-muted/20 border-b border-border p-8">
					<CardTitle className="flex items-center gap-2"><School className="h-5 w-5 text-primary" /> Informations Établissement</CardTitle>
				</CardHeader>
				<CardContent className="p-8 space-y-4">
					<div className="grid gap-2">
						<Label>Nom de l'Université</Label>
						<Input defaultValue={initialSettings.name} className="rounded-xl" />
					</div>
					<div className="grid gap-2">
						<Label>Logo (URL)</Label>
						<div className="flex gap-2">
							<Input defaultValue={initialSettings.logoUrl} className="rounded-xl" />
							<Button variant="outline" className="rounded-xl"><Upload className="h-4 w-4" /></Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border border-border shadow-xl rounded-4xl overflow-hidden">
				<CardHeader className="bg-muted/20 border-b border-border p-8">
					<CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Paramètres Soutenances</CardTitle>
				</CardHeader>
				<CardContent className="p-8 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>Durée Soutenance (min)</Label>
							<Input type="number" defaultValue={90} className="rounded-xl" />
						</div>
						<div className="grid gap-2">
							<Label>Pause Entre (min)</Label>
							<Input type="number" defaultValue={15} className="rounded-xl" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>Heure Début</Label>
							<Input type="time" defaultValue="08:30" className="rounded-xl" />
						</div>
						<div className="grid gap-2">
							<Label>Heure Fin</Label>
							<Input type="time" defaultValue="18:30" className="rounded-xl" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);

	return (
		<div className="space-y-12 animate-in fade-in duration-500 pb-20">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-heading font-bold text-foreground">{meta.title}</h1>
					<p className="text-muted-foreground font-sans text-lg">{meta.description}</p>
				</div>
				{activeSection !== "settings" && (
					<Button
						onClick={() => {}}
						className="gap-2 shadow-lg hover:shadow-primary/20 transition-all bg-primary text-primary-foreground rounded-xl h-11 font-bold"
					>
						<meta.actionIcon className="h-4 w-4" /> {meta.actionLabel}
					</Button>
				)}
			</div>

			{notice && (
				<Alert variant={notice.variant}>
					<AlertTitle>{notice.title}</AlertTitle>
					<AlertDescription>{notice.description}</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{stats.map((stat, index) => <StatCard key={index} metric={stat} />)}
			</div>

			<Tabs value={activeSection} className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-2 bg-muted/30 rounded-3xl border border-border">
					<TabsList className="bg-transparent h-auto p-0 flex-wrap justify-start">
						<TabsTrigger value="users" onClick={() => handleSectionChange("users")} className="rounded-2xl py-2 px-4 data-[state=active]:bg-card font-bold">Comptes</TabsTrigger>
						<TabsTrigger value="rooms" onClick={() => handleSectionChange("rooms")} className="rounded-2xl py-2 px-4 data-[state=active]:bg-card font-bold">Salles</TabsTrigger>
						<TabsTrigger value="sessions" onClick={() => handleSectionChange("sessions")} className="rounded-2xl py-2 px-4 data-[state=active]:bg-card font-bold">Sessions</TabsTrigger>
						<TabsTrigger value="establishment" onClick={() => handleSectionChange("establishment")} className="rounded-2xl py-2 px-4 data-[state=active]:bg-card font-bold">Établissement</TabsTrigger>
						<TabsTrigger value="settings" onClick={() => handleSectionChange("settings")} className="rounded-2xl py-2 px-4 data-[state=active]:bg-card font-bold">Paramètres</TabsTrigger>
					</TabsList>

					{activeSection !== "settings" && (
						<div className="relative w-full sm:w-64 px-2">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input placeholder={meta.placeholder} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-12 bg-card border-border rounded-2xl h-10" />
						</div>
					)}
				</div>

				<TabsContent value="users">{renderUsers()}</TabsContent>
				<TabsContent value="rooms">{renderRooms()}</TabsContent>
				<TabsContent value="sessions">{renderSessions()}</TabsContent>
				<TabsContent value="establishment">{renderEstablishment()}</TabsContent>
				<TabsContent value="settings">{renderSettings()}</TabsContent>
			</Tabs>

			{/* Import Dialog */}
			<Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
				<DialogContent className="rounded-3xl">
					<DialogHeader>
						<DialogTitle>Importer des comptes</DialogTitle>
						<DialogDescription>Sélectionnez un fichier CSV ou Excel contenant la liste des utilisateurs.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						<div className="border-2 border-dashed border-border rounded-3xl p-12 text-center space-y-4">
							<FileDown className="h-12 w-12 text-muted-foreground mx-auto" />
							<p className="text-sm font-medium">Glissez votre fichier ici ou cliquez pour parcourir</p>
							<Button variant="secondary" className="rounded-xl">Sélectionner un fichier</Button>
						</div>
						<div className="space-y-2">
							<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Format attendu</p>
							<p className="text-[10px] text-muted-foreground font-mono bg-muted/50 p-3 rounded-lg">nom,prenom,email,role,actif</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setImportDialogOpen(false)}>Annuler</Button>
						<Button onClick={handleImportCSV} className="bg-primary rounded-xl">Lancer l'importation</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
