import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../../context/auth";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({
	children,
	allowedRoles,
}: ProtectedRouteProps) => {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};
