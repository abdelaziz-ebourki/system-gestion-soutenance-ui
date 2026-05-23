import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

const Login = lazy(() => import("./pages/Login"));
const VerifyAccount = lazy(() => import("./pages/auth/VerifyAccount"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Departments = lazy(() => import("./pages/admin/Departments"));
const Sessions = lazy(() => import("./pages/admin/Sessions"));
const Rooms = lazy(() => import("./pages/admin/Rooms"));
const Students = lazy(() => import("./pages/admin/users/Students"));
const Teachers = lazy(() => import("./pages/admin/users/Teachers"));
const Coordinators = lazy(() => import("./pages/admin/users/Coordinators"));
const Configuration = lazy(() => import("./pages/admin/Configuration"));
const CoordinatorDashboard = lazy(() => import("./pages/coordinator/CoordinatorDashboard"));
const CoordinatorProjects = lazy(() => import("./pages/coordinator/ProjectsGroups"));
const Jurys = lazy(() => import("./pages/coordinator/Jurys"));
const CoordinatorDefenseSessions = lazy(() => import("./pages/coordinator/DefenseSessions"));
const DefenseDesigner = lazy(() => import("./pages/coordinator/DefenseDesigner"));
const CoordinatorConflicts = lazy(() => import("./pages/coordinator/ConflictDashboard"));
const CoordinatorGrades = lazy(() => import("./pages/coordinator/Grades"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherSchedule = lazy(() => import("./pages/teacher/TeacherSchedule"));
const TeacherEvaluations = lazy(() => import("./pages/teacher/TeacherEvaluations"));
const TeacherUnavailability = lazy(() => import("./pages/teacher/TeacherUnavailability"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentGroup = lazy(() => import("./pages/student/StudentGroup"));
const StudentDocuments = lazy(() => import("./pages/student/StudentDocuments"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminDefenseSessions = lazy(() => import("./pages/admin/DefenseSessions"));

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="size-10 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/defense-sessions" element={<AdminDefenseSessions />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
            <Route path="/coordinator" element={<CoordinatorDashboard />} />
            <Route
              path="/coordinator/schedule"
              element={<DefenseDesigner />}
            />
            <Route
              path="/coordinator/projects"
              element={<CoordinatorProjects />}
            />
            <Route path="/coordinator/juries" element={<Jurys />} />
            <Route path="/coordinator/defense-sessions" element={<CoordinatorDefenseSessions />} />
            <Route path="/coordinator/conflicts" element={<CoordinatorConflicts />} />
            <Route path="/coordinator/grades" element={<CoordinatorGrades />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/schedule" element={<TeacherSchedule />} />
            <Route path="/teacher/evaluations" element={<TeacherEvaluations />} />
            <Route
              path="/teacher/unavailability"
              element={<TeacherUnavailability />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/group" element={<StudentGroup />} />
            <Route path="/student/documents" element={<StudentDocuments />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin", "coordinator", "teacher", "student"]} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}
