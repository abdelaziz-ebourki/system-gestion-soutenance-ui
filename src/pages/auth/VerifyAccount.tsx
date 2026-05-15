import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";

export default function VerifyAccount() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get("token");

	const [password, setPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	React.useEffect(() => {
		if (!token) {
			navigate("/login", { replace: true });
		}
	}, [token, navigate]);

	const handleVerify = async (e: React.SubmitEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Les mots de passe ne correspondent pas");
			return;
		}

		setIsSubmitting(true);
		try {
			await api("/auth/verify-account", {
				method: "POST",
				body: JSON.stringify({ token, password }),
			});
			toast.success(
				"Compte activé avec succès, vous pouvez maintenant vous connecter.",
			);
			navigate("/login");
		} catch {
			toast.error(
				"Erreur lors de l'activation du compte. Lien peut-être expiré.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!token) return null;

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Activation de votre compte</CardTitle>
					<CardDescription>
						Définissez votre mot de passe pour activer votre compte.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleVerify} className="space-y-4">
						<Field>
							<FieldLabel>Nouveau mot de passe</FieldLabel>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<FieldLabel>Confirmer le mot de passe</FieldLabel>
							<Input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</Field>
						<Button className="w-full" type="submit" disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Activer mon compte
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
