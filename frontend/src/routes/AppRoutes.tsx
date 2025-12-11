import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import AdminDashboard from "../pages/admin/Dashboard";
import ChauffeurDashboard from "../pages/chauffeur/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import ChauffeurLayout from "../layouts/ChauffeurLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Component pour rediriger selon le rôle
function RoleBasedRedirect() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/chauffeur/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Routes Admin avec Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* Futures routes admin */}
          {/* <Route path="camions" element={<AdminCamions />} /> */}
          {/* <Route path="remorques" element={<AdminRemorques />} /> */}
          {/* <Route path="pneus" element={<AdminPneus />} /> */}
          {/* <Route path="trajets" element={<AdminTrajets />} /> */}
          {/* <Route path="maintenances" element={<AdminMaintenances />} /> */}
          {/* <Route path="users" element={<AdminUsers />} /> */}
        </Route>

        {/* Routes Chauffeur avec Layout */}
        <Route
          path="/chauffeur"
          element={
            <ProtectedRoute allowedRoles={["chauffeur"]}>
              <ChauffeurLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ChauffeurDashboard />} />
          {/* Futures routes chauffeur */}
          {/* <Route path="trajets" element={<ChauffeurTrajets />} /> */}
        </Route>

        {/* Route racine - redirige selon le rôle */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
