import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { useAuth } from "./context/AuthContext";

export default function App() {
	const { user } = useAuth();

	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route
				path="/"
				element={
					<ProtectedRoute>
						<DashboardLayout />
					</ProtectedRoute>
				}
			>
				<Route
					index
					element={
						user?.role === "STUDENT" ? (
							<Navigate to="/student" replace />
						) : user?.role === "TEACHER" ? (
							<Navigate to="/teacher" replace />
						) : user?.role === "COORDINATOR" ? (
							<Navigate to="/coordinator" replace />
						) : user?.role === "ADMIN" ? (
							<Navigate to="/admin" replace />
						) : (
							<Navigate to="/login" replace />
						)
					}
				/>

				<Route
					path="student"
					element={
						<ProtectedRoute allowedRoles={["STUDENT"]}>
							<StudentDashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="teacher"
					element={
						<ProtectedRoute allowedRoles={["TEACHER"]}>
							<TeacherDashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="coordinator"
					element={
						<ProtectedRoute allowedRoles={["COORDINATOR"]}>
							<CoordinatorDashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="admin"
					element={
						<ProtectedRoute allowedRoles={["ADMIN"]}>
							<AdminDashboard />
						</ProtectedRoute>
					}
				/>
			</Route>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
