import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
				<Route path="/admin" element={<AdminDashboard />} />
			</Route>

			<Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
				<Route path="/coordinator" element={<CoordinatorDashboard />} />
			</Route>

			<Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
				<Route path="/teacher" element={<TeacherDashboard />} />
			</Route>

			<Route element={<ProtectedRoute allowedRoles={["student"]} />}>
				<Route path="/student" element={<StudentDashboard />} />
			</Route>

			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}

