import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Departments from "./pages/admin/Departments";
import Sessions from "./pages/admin/Sessions";
import Rooms from "./pages/admin/Rooms";
import Students from "./pages/admin/users/Students";
import Teachers from "./pages/admin/users/Teachers";
import Coordinators from "./pages/admin/users/Coordinators";
import Configuration from "./pages/admin/Configuration";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route element={<DashboardLayout />}>
				<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
					<Route path="/admin" element={<AdminDashboard />} />
					<Route path="/admin/departments" element={<Departments />} />
					<Route path="/admin/sessions" element={<Sessions />} />
					<Route path="/admin/rooms" element={<Rooms />} />
					<Route path="/admin/users/students" element={<Students />} />
					<Route path="/admin/users/teachers" element={<Teachers />} />
					<Route path="/admin/users/coordinators" element={<Coordinators />} />
					<Route path="/admin/config" element={<Configuration />} />
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
			</Route>

			<Route path="/" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}
