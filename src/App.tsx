import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import VerifyAccount from "./pages/auth/VerifyAccount";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Departments from "./pages/admin/Departments";
import Sessions from "./pages/admin/Sessions";
import Rooms from "./pages/admin/Rooms";
import Students from "./pages/admin/users/Students";
import Teachers from "./pages/admin/users/Teachers";
import Coordinators from "./pages/admin/users/Coordinators";
import Configuration from "./pages/admin/Configuration";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorProjects from "./pages/coordinator/ProjectsGroups";
import Jurys from "./pages/coordinator/Jurys";
import SoutenanceDesigner from "./pages/coordinator/SoutenanceDesigner";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherSchedule from "./pages/teacher/TeacherSchedule";
import TeacherEvaluations from "./pages/teacher/TeacherEvaluations";
import TeacherUnavailability from "./pages/teacher/TeacherUnavailability";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/verify-account" element={<VerifyAccount />} />

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
					<Route path="/coordinator/schedule" element={<SoutenanceDesigner />} />
					<Route path="/coordinator/projects" element={<CoordinatorProjects />} />
					<Route path="/coordinator/jurys" element={<Jurys />} />
				</Route>

				<Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
					<Route path="/teacher" element={<TeacherDashboard />} />
					<Route path="/teacher/schedule" element={<TeacherSchedule />} />
					<Route path="/teacher/evaluations" element={<TeacherEvaluations />} />
					<Route path="/teacher/unavailability" element={<TeacherUnavailability />} />
				</Route>

				<Route element={<ProtectedRoute allowedRoles={["student"]} />}>
					<Route path="/student" element={<StudentDashboard />} />
				</Route>
			</Route>

			<Route path="/" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}
