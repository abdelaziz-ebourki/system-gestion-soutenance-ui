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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
	AdminStatMetric,
	GlobalSession,
	Room,
	SessionStatus,
	User,
	UserRole,
} from "./types";
import { StatCard } from "@/components/teacher/StatCard";

type SectionKey = "users" | "rooms" | "sessions" | "settings";

type Notice = {
	variant: "default" | "destructive";
	title: string;
	description: string;
} | null;

type UserForm = {
	nom: string;
	prenom: string;
	email: string;
	role: UserRole;
	actif: boolean;
};

type RoomForm = {
	nom: string;
	batiment: string;
	capacite: string;
	disponible: boolean;
};

type SessionForm = {
	libelle: string;
	dateDebut: string;
	dateFin: string;
	statut: SessionStatus;
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
	{
		id: 8,
		nom: "Chraibi",
		prenom: "Lina",
		email: "lina.chraibi@student.ma",
		role: "STUDENT",
		actif: true,
	},
	{
		id: 9,
		nom: "Berrada",
		prenom: "Omar",
		email: "o.berrada@univ.ma",
		role: "TEACHER",
		actif: true,
	},
	{
		id: 10,
		nom: "Kabbaj",
		prenom: "Sara",
		email: "sara.kabbaj@student.ma",
		role: "STUDENT",
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
	{
		id: 3,
		nom: "TD 2",
		batiment: "Bloc C",
		capacite: 40,
		disponible: false,
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
	{
		id: 2,
		libelle: "Session Rattrapage 2026",
		dateDebut: "2026-07-15",
		dateFin: "2026-07-25",
		statut: "CLOTUREE",
	},
];

const sectionMeta: Record<
	SectionKey,
	{
		title: string;
		description: string;
		placeholder: string;
		actionLabel: string;
		actionIcon: typeof Plus;
	}
> = {
	users: {
		title: "Gestion des Comptes",
		description:
			"Consultez et modifiez les accès des différents acteurs du système.",
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
	settings: {
		title: "Paramétrages Système",
		description:
			"Configurez les informations de l'établissement et les créneaux horaires.",
		placeholder: "",
		actionLabel: "Enregistrer les modifications",
		actionIcon: CheckCircle2,
	},
};

function getSection(pathname: string): SectionKey {
	if (pathname.endsWith("/rooms")) return "rooms";
	if (pathname.endsWith("/sessions")) return "sessions";
	return "users";
}

function formatDateRange(session: GlobalSession) {
	return `Du ${session.dateDebut} au ${session.dateFin}`;
}

function UserDialog({
	open,
	onOpenChange,
	user,
	onSave,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
	onSave: (form: UserForm) => void;
}) {
	const [form, setForm] = useState<UserForm>(
		user
			? {
					nom: user.nom,
					prenom: user.prenom,
					email: user.email,
					role: user.role,
					actif: user.actif,
				}
			: {
					nom: "",
					prenom: "",
					email: "",
					role: "STUDENT",
					actif: true,
				},
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{user ? "Modifier l'utilisateur" : "Créer un utilisateur"}
					</DialogTitle>
					<DialogDescription>
						Mettez à jour les informations, le rôle et l'état du compte.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="user-nom">Nom</Label>
						<Input
							id="user-nom"
							value={form.nom}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, nom: e.target.value }))
							}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="user-prenom">Prénom</Label>
						<Input
							id="user-prenom"
							value={form.prenom}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, prenom: e.target.value }))
							}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="user-email">Email</Label>
						<Input
							id="user-email"
							type="email"
							value={form.email}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, email: e.target.value }))
							}
						/>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="user-role">Rôle</Label>
							<select
								id="user-role"
								className="h-9 rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
								value={form.role}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										role: e.target.value as UserRole,
									}))
								}
							>
								<option value="ADMIN">ADMIN</option>
								<option value="COORDINATOR">COORDINATOR</option>
								<option value="TEACHER">TEACHER</option>
								<option value="STUDENT">STUDENT</option>
							</select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="user-state">État</Label>
							<select
								id="user-state"
								className="h-9 rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
								value={form.actif ? "true" : "false"}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										actif: e.target.value === "true",
									}))
								}
							>
								<option value="true">Actif</option>
								<option value="false">Inactif</option>
							</select>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button
						onClick={() => onSave(form)}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Enregistrer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function RoomDialog({
	open,
	onOpenChange,
	room,
	onSave,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	room: Room | null;
	onSave: (form: RoomForm) => void;
}) {
	const [form, setForm] = useState<RoomForm>(
		room
			? {
					nom: room.nom,
					batiment: room.batiment,
					capacite: String(room.capacite),
					disponible: room.disponible,
				}
			: {
					nom: "",
					batiment: "",
					capacite: "",
					disponible: true,
				},
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{room ? "Modifier la salle" : "Ajouter une salle"}
					</DialogTitle>
					<DialogDescription>
						Renseignez le nom, le bâtiment, la capacité et la disponibilité.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="room-nom">Nom</Label>
						<Input
							id="room-nom"
							value={form.nom}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, nom: e.target.value }))
							}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="room-batiment">Bâtiment</Label>
						<Input
							id="room-batiment"
							value={form.batiment}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, batiment: e.target.value }))
							}
						/>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="room-capacite">Capacité</Label>
							<Input
								id="room-capacite"
								type="number"
								min="1"
								value={form.capacite}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, capacite: e.target.value }))
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="room-disponible">Disponibilité</Label>
							<select
								id="room-disponible"
								className="h-9 rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
								value={form.disponible ? "true" : "false"}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										disponible: e.target.value === "true",
									}))
								}
							>
								<option value="true">Disponible</option>
								<option value="false">Occupée</option>
							</select>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button
						onClick={() => onSave(form)}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Enregistrer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function SessionDialog({
	open,
	onOpenChange,
	session,
	onSave,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	session: GlobalSession | null;
	onSave: (form: SessionForm) => void;
}) {
	const [form, setForm] = useState<SessionForm>(
		session
			? {
					libelle: session.libelle,
					dateDebut: session.dateDebut,
					dateFin: session.dateFin,
					statut: session.statut,
				}
			: {
					libelle: "",
					dateDebut: "",
					dateFin: "",
					statut: "OUVERTE",
				},
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{session ? "Modifier la session" : "Créer une session"}
					</DialogTitle>
					<DialogDescription>
						Définissez le libellé, la période et le statut de la session.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="session-libelle">Libellé</Label>
						<Input
							id="session-libelle"
							value={form.libelle}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, libelle: e.target.value }))
							}
						/>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="session-debut">Date de début</Label>
							<Input
								id="session-debut"
								type="date"
								value={form.dateDebut}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, dateDebut: e.target.value }))
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="session-fin">Date de fin</Label>
							<Input
								id="session-fin"
								type="date"
								value={form.dateFin}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, dateFin: e.target.value }))
								}
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="session-statut">Statut</Label>
						<select
							id="session-statut"
							className="h-9 rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
							value={form.statut}
							onChange={(e) =>
								setForm((prev) => ({
									...prev,
									statut: e.target.value as SessionStatus,
								}))
							}
						>
							<option value="OUVERTE">OUVERTE</option>
							<option value="VERROUILLEE">VERROUILLEE</option>
							<option value="CLOTUREE">CLOTUREE</option>
						</select>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button
						onClick={() => onSave(form)}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Enregistrer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default function AdminDashboard() {
	const location = useLocation();
	const navigate = useNavigate();
	const activeSection = getSection(location.pathname);

	const [query, setQuery] = useState("");
	const [users, setUsers] = useState(initialUsers);
	const [rooms, setRooms] = useState(initialRooms);
	const [sessions, setSessions] = useState(initialSessions);
	const [notice, setNotice] = useState<Notice>(null);
	const [userDialogOpen, setUserDialogOpen] = useState(false);
	const [roomDialogOpen, setRoomDialogOpen] = useState(false);
	const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [editingRoom, setEditingRoom] = useState<Room | null>(null);
	const [editingSession, setEditingSession] = useState<GlobalSession | null>(
		null,
	);
	const [deleteTarget, setDeleteTarget] = useState<{
		kind: SectionKey;
		id: number;
		label: string;
	} | null>(null);

	const meta = sectionMeta[activeSection];

	const filteredUsers = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return users;
		return users.filter((user) =>
			[
				user.nom,
				user.prenom,
				user.email,
				user.role,
				user.actif ? "actif" : "inactif",
			].some((value) => value.toLowerCase().includes(needle)),
		);
	}, [query, users]);

	const filteredRooms = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return rooms;
		return rooms.filter((room) =>
			[
				room.nom,
				room.batiment,
				String(room.capacite),
				room.disponible ? "disponible" : "occupée",
			].some((value) => value.toLowerCase().includes(needle)),
		);
	}, [query, rooms]);

	const filteredSessions = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return sessions;
		return sessions.filter((session) =>
			[
				session.libelle,
				session.dateDebut,
				session.dateFin,
				session.statut,
			].some((value) => value.toLowerCase().includes(needle)),
		);
	}, [query, sessions]);

	const handleSectionChange = (nextSection: string) => {
		navigate(`/admin/${nextSection}`);
		setQuery("");
		setNotice(null);
		setUserDialogOpen(false);
		setRoomDialogOpen(false);
		setSessionDialogOpen(false);
		setEditingUser(null);
		setEditingRoom(null);
		setEditingSession(null);
	};

	const nextUserId = users.length
		? Math.max(...users.map((item) => item.id)) + 1
		: 1;
	const nextRoomId = rooms.length
		? Math.max(...rooms.map((item) => item.id)) + 1
		: 1;
	const nextSessionId = sessions.length
		? Math.max(...sessions.map((item) => item.id)) + 1
		: 1;

	const openCreateDialog = () => {
		if (activeSection === "users") {
			setEditingUser(null);
			setUserDialogOpen(true);
		}
		if (activeSection === "rooms") {
			setEditingRoom(null);
			setRoomDialogOpen(true);
		}
		if (activeSection === "sessions") {
			setEditingSession(null);
			setSessionDialogOpen(true);
		}
	};

	const saveUser = (form: UserForm) => {
		if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
			setNotice({
				variant: "destructive",
				title: "Champs manquants",
				description: "Le nom, le prénom et l'email sont obligatoires.",
			});
			return;
		}

		if (editingUser) {
			setUsers((prev) =>
				prev.map((item) =>
					item.id === editingUser.id ? { ...item, ...form } : item,
				),
			);
			setNotice({
				variant: "default",
				title: "Utilisateur mis à jour",
				description: `${form.prenom} ${form.nom} a été enregistré.`,
			});
		} else {
			setUsers((prev) => [...prev, { id: nextUserId, ...form }]);
			setNotice({
				variant: "default",
				title: "Utilisateur créé",
				description: `${form.prenom} ${form.nom} a été ajouté.`,
			});
		}

		setEditingUser(null);
		setUserDialogOpen(false);
	};

	const saveRoom = (form: RoomForm) => {
		const capacite = Number(form.capacite);
		if (!form.nom.trim() || !form.batiment.trim() || Number.isNaN(capacite)) {
			setNotice({
				variant: "destructive",
				title: "Champs invalides",
				description:
					"Le nom, le bâtiment et la capacité doivent être renseignés.",
			});
			return;
		}

		if (editingRoom) {
			setRooms((prev) =>
				prev.map((item) =>
					item.id === editingRoom.id
						? {
								...item,
								nom: form.nom,
								batiment: form.batiment,
								capacite,
								disponible: form.disponible,
							}
						: item,
				),
			);
			setNotice({
				variant: "default",
				title: "Salle mise à jour",
				description: `${form.nom} a été enregistrée.`,
			});
		} else {
			setRooms((prev) => [
				...prev,
				{
					id: nextRoomId,
					nom: form.nom,
					batiment: form.batiment,
					capacite,
					disponible: form.disponible,
				},
			]);
			setNotice({
				variant: "default",
				title: "Salle ajoutée",
				description: `${form.nom} a été ajoutée au catalogue.`,
			});
		}

		setEditingRoom(null);
		setRoomDialogOpen(false);
	};

	const saveSession = (form: SessionForm) => {
		if (!form.libelle.trim() || !form.dateDebut || !form.dateFin) {
			setNotice({
				variant: "destructive",
				title: "Champs manquants",
				description: "Le libellé et les dates de session sont obligatoires.",
			});
			return;
		}

		if (editingSession) {
			setSessions((prev) =>
				prev.map((item) =>
					item.id === editingSession.id ? { ...item, ...form } : item,
				),
			);
			setNotice({
				variant: "default",
				title: "Session mise à jour",
				description: `${form.libelle} a été enregistrée.`,
			});
		} else {
			setSessions((prev) => [...prev, { id: nextSessionId, ...form }]);
			setNotice({
				variant: "default",
				title: "Session créée",
				description: `${form.libelle} a été ajoutée.`,
			});
		}

		setEditingSession(null);
		setSessionDialogOpen(false);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;

		if (deleteTarget.kind === "users") {
			setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
		}
		if (deleteTarget.kind === "rooms") {
			setRooms((prev) => prev.filter((item) => item.id !== deleteTarget.id));
		}
		if (deleteTarget.kind === "sessions") {
			setSessions((prev) => prev.filter((item) => item.id !== deleteTarget.id));
		}

		setNotice({
			variant: "destructive",
			title: "Élément supprimé",
			description: deleteTarget.label,
		});
		setDeleteTarget(null);
	};

	const renderUsers = () => (
		<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
			<CardHeader className="bg-muted/20 border-b border-border p-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<CardTitle className="text-2xl font-heading text-foreground font-bold">
							Gestion des Comptes
						</CardTitle>
						<CardDescription className="font-sans text-muted-foreground">
							Consultez et modifiez les accès des différents acteurs du système.
						</CardDescription>
					</div>
					<Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest">
						{filteredUsers.length} Total
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader className="bg-muted/10">
						<TableRow className="hover:bg-transparent border-border">
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Utilisateur
							</TableHead>
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Rôle
							</TableHead>
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								État du Compte
							</TableHead>
							<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredUsers.map((user) => (
							<TableRow
								key={user.id}
								className="group border-border transition-colors hover:bg-muted/5"
							>
								<TableCell className="p-6">
									<div className="flex flex-col">
										<span className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
											{user.nom} {user.prenom}
										</span>
										<span className="text-sm text-muted-foreground">
											{user.email}
										</span>
									</div>
								</TableCell>
								<TableCell className="p-6">
									<Badge
										variant="secondary"
										className="font-bold rounded-lg px-3 py-1 bg-muted/50 border-border/50 text-[11px]"
									>
										{user.role}
									</Badge>
								</TableCell>
								<TableCell className="p-6">
									{user.actif ? (
										<div className="flex items-center gap-2 text-emerald-700 font-bold text-sm bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
											<CheckCircle2 className="h-3.5 w-3.5" />
											Actif
										</div>
									) : (
										<div className="flex items-center gap-2 text-destructive font-bold text-sm bg-destructive/10 w-fit px-3 py-1 rounded-full border border-destructive/20">
											<XCircle className="h-3.5 w-3.5" />
											Inactif
										</div>
									)}
								</TableCell>
								<TableCell className="p-6 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
											>
												<MoreVertical className="h-5 w-5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="rounded-2xl border-border shadow-2xl p-2 w-48"
										>
											<DropdownMenuItem
												className="gap-3 rounded-xl cursor-pointer py-2.5 focus:bg-primary/10 focus:text-primary"
												onClick={() => {
													setEditingUser(user);
													setUserDialogOpen(true);
												}}
											>
												<Edit className="h-4 w-4" />
												<span className="font-bold">Modifier</span>
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												className="gap-3 rounded-xl cursor-pointer py-2.5"
												onClick={() =>
													setDeleteTarget({
														kind: "users",
														id: user.id,
														label: `${user.prenom} ${user.nom} a été supprimé.`,
													})
												}
											>
												<Trash2 className="h-4 w-4" />
												<span className="font-bold">Supprimer</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
						{filteredUsers.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className="p-10 text-center text-muted-foreground"
								>
									Aucun utilisateur ne correspond à votre recherche.
								</TableCell>
							</TableRow>
						) : null}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);

	const renderRooms = () => (
		<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
			<CardHeader className="bg-muted/20 border-b border-border p-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<CardTitle className="text-2xl font-heading text-foreground font-bold">
							Catalogue des Salles
						</CardTitle>
						<CardDescription className="font-sans text-muted-foreground">
							Gérez les espaces de soutenance et leur disponibilité.
						</CardDescription>
					</div>
					<Button
						onClick={() => {
							setEditingRoom(null);
							setRoomDialogOpen(true);
						}}
						className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold rounded-full px-5"
					>
						<Plus className="h-4 w-4 mr-2" /> Ajouter une salle
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader className="bg-muted/10">
						<TableRow className="hover:bg-transparent border-border">
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Nom de la Salle
							</TableHead>
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Bâtiment
							</TableHead>
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Capacité
							</TableHead>
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Statut
							</TableHead>
							<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredRooms.map((room) => (
							<TableRow
								key={room.id}
								className="group border-border transition-colors hover:bg-muted/5"
							>
								<TableCell className="p-6 font-bold text-foreground text-base group-hover:text-primary transition-colors">
									{room.nom}
								</TableCell>
								<TableCell className="p-6 font-medium">
									{room.batiment}
								</TableCell>
								<TableCell className="p-6">
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4 text-muted-foreground" />
										<span className="font-bold">{room.capacite} places</span>
									</div>
								</TableCell>
								<TableCell className="p-6">
									{room.disponible ? (
										<Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-bold px-3 py-1 rounded-full">
											Disponible
										</Badge>
									) : (
										<Badge
											variant="destructive"
											className="font-bold px-3 py-1 rounded-full"
										>
											Occupée
										</Badge>
									)}
								</TableCell>
								<TableCell className="p-6 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
											>
												<MoreVertical className="h-5 w-5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="rounded-2xl border-border shadow-2xl p-2 w-48"
										>
											<DropdownMenuItem
												className="gap-3 rounded-xl cursor-pointer py-2.5 focus:bg-primary/10 focus:text-primary"
												onClick={() => {
													setEditingRoom(room);
													setRoomDialogOpen(true);
												}}
											>
												<Edit className="h-4 w-4" />
												<span className="font-bold">Modifier</span>
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												className="gap-3 rounded-xl cursor-pointer py-2.5"
												onClick={() =>
													setDeleteTarget({
														kind: "rooms",
														id: room.id,
														label: `${room.nom} a été supprimée.`,
													})
												}
											>
												<Trash2 className="h-4 w-4" />
												<span className="font-bold">Supprimer</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
						{filteredRooms.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="p-10 text-center text-muted-foreground"
								>
									Aucune salle ne correspond à votre recherche.
								</TableCell>
							</TableRow>
						) : null}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);

	const renderSessions = () => (
		<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
			<CardHeader className="bg-muted/20 border-b border-border p-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<CardTitle className="text-2xl font-heading text-foreground font-bold">
							Sessions Globales
						</CardTitle>
						<CardDescription className="font-sans text-muted-foreground">
							Configurez les périodes de soutenance et leur état.
						</CardDescription>
					</div>
					<Button
						onClick={() => {
							setEditingSession(null);
							setSessionDialogOpen(true);
						}}
						variant={"outline"}
						className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold rounded-full px-5"
					>
						<Plus className="h-4 w-4 mr-2" /> Créer une session
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader className="bg-muted/10">
						<TableRow className="hover:bg-transparent border-border">
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Libellé de la Session
							</TableHead>
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Période
							</TableHead>
							<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Statut
							</TableHead>
							<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredSessions.map((session) => (
							<TableRow
								key={session.id}
								className="group border-border transition-colors hover:bg-muted/5"
							>
								<TableCell className="p-6 font-bold text-foreground text-base group-hover:text-primary transition-colors">
									{session.libelle}
								</TableCell>
								<TableCell className="p-6">
									<div className="flex items-center gap-2 text-sm font-medium">
										<CalendarDays className="h-4 w-4 text-primary/60" />
										<span>{formatDateRange(session)}</span>
									</div>
								</TableCell>
								<TableCell className="p-6">
									<Badge
										variant={
											session.statut === "OUVERTE" ? "default" : "secondary"
										}
										className={`font-bold px-4 py-1 rounded-full text-[10px] tracking-wider ${
											session.statut === "OUVERTE"
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground"
										}`}
									>
										{session.statut}
									</Badge>
								</TableCell>
								<TableCell className="p-6 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
											>
												<MoreVertical className="h-5 w-5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="rounded-2xl border-border shadow-2xl p-2 w-48"
										>
											<DropdownMenuItem
												className="gap-3 rounded-xl cursor-pointer py-2.5 focus:bg-primary/10 focus:text-primary"
												onClick={() => {
													setEditingSession(session);
													setSessionDialogOpen(true);
												}}
											>
												<Edit className="h-4 w-4" />
												<span className="font-bold">Gérer</span>
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												className="gap-3 rounded-xl cursor-pointer py-2.5"
												onClick={() =>
													setDeleteTarget({
														kind: "sessions",
														id: session.id,
														label: `${session.libelle} a été supprimée.`,
													})
												}
											>
												<Trash2 className="h-4 w-4" />
												<span className="font-bold">Supprimer</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-12 animate-in fade-in duration-500 pb-20">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-heading font-bold text-foreground">
						{meta.title}
					</h1>
					<p className="text-muted-foreground font-sans text-lg">
						{meta.description}
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button
						onClick={openCreateDialog}
						className="gap-2 shadow-lg hover:shadow-primary/20 transition-all bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 font-bold"
					>
						<meta.actionIcon className="h-4 w-4" /> {meta.actionLabel}
					</Button>
				</div>
			</div>

			{notice ? (
				<Alert variant={notice.variant}>
					<AlertTitle>{notice.title}</AlertTitle>
					<AlertDescription>{notice.description}</AlertDescription>
				</Alert>
			) : null}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{stats.map((stat, index) => (
					<StatCard key={index} metric={stat} />
				))}
			</div>

			<Tabs value={activeSection} className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5">
					<TabsList className="bg-muted/50 rounded-xl border border-border p-1">
						<TabsTrigger
							value="users"
							onClick={() => handleSectionChange("users")}
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold px-6 transition-all"
						>
							<Users className="h-4 w-4" /> Utilisateurs
						</TabsTrigger>
						<TabsTrigger
							value="rooms"
							onClick={() => handleSectionChange("rooms")}
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold px-6 transition-all"
						>
							<DoorOpen className="h-4 w-4" /> Salles
						</TabsTrigger>
						<TabsTrigger
							value="sessions"
							onClick={() => handleSectionChange("sessions")}
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold px-6 transition-all"
						>
							<CalendarDays className="h-4 w-4" /> Sessions
						</TabsTrigger>
					</TabsList>

					<div className="relative w-full sm:w-80">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={meta.placeholder}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="pl-12 bg-card border-border rounded-xl h-11 shadow-sm focus:ring-primary/20"
						/>
					</div>
				</div>

				<TabsContent value="users" className="space-y-6">
					{renderUsers()}
				</TabsContent>

				<TabsContent value="rooms" className="space-y-6">
					{renderRooms()}
				</TabsContent>

				<TabsContent value="sessions" className="space-y-6">
					{renderSessions()}
				</TabsContent>
			</Tabs>

			<UserDialog
				key={`user-${userDialogOpen}-${editingUser?.id ?? "new"}`}
				open={userDialogOpen}
				onOpenChange={(open) => {
					setUserDialogOpen(open);
					if (!open) setEditingUser(null);
				}}
				user={editingUser}
				onSave={saveUser}
			/>
			<RoomDialog
				key={`room-${roomDialogOpen}-${editingRoom?.id ?? "new"}`}
				open={roomDialogOpen}
				onOpenChange={(open) => {
					setRoomDialogOpen(open);
					if (!open) setEditingRoom(null);
				}}
				room={editingRoom}
				onSave={saveRoom}
			/>
			<SessionDialog
				key={`session-${sessionDialogOpen}-${editingSession?.id ?? "new"}`}
				open={sessionDialogOpen}
				onOpenChange={(open) => {
					setSessionDialogOpen(open);
					if (!open) setEditingSession(null);
				}}
				session={editingSession}
				onSave={saveSession}
			/>

			<AlertDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. L'élément sera retiré du catalogue.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Supprimer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
