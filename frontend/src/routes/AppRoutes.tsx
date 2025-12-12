import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";
import AccountPending from "../pages/AccountPending";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminCamions from "../pages/admin/Camions";
import AdminRemorques from "../pages/admin/Remorques";
import AdminPneus from "../pages/admin/Pneus";
import AdminTrajets from "../pages/admin/Trajets";
import AdminMaintenances from "../pages/admin/Maintenances";
import AdminUtilisateurs from "../pages/admin/Utilisateurs";
import ChauffeurDashboard from "../pages/chauffeur/Dashboard";
import AdminLayout from "../layouts/AdminLayout";
import ChauffeurLayout from "../layouts/ChauffeurLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Component pour rediriger selon le rôle
function RoleBasedRedirect() {
  const { user, token } = useAppSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Si chauffeur inactif, rediriger vers la page d'attente
  if (user.role === "chauffeur" && user.isActive === false) {
    return <Navigate to="/account-pending" replace />;
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
        <Route path="/account-pending" element={<AccountPending />} />

        {/* Routes Admin avec Protection */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="camions" element={<AdminCamions />} />
            <Route path="remorques" element={<AdminRemorques />} />
            <Route path="pneus" element={<AdminPneus />} />
            <Route path="trajets" element={<AdminTrajets />} />
            <Route path="maintenances" element={<AdminMaintenances />} />
            <Route path="utilisateurs" element={<AdminUtilisateurs />} />
            {/* Futures routes admin */}
            {/* <Route path="trajets" element={<AdminTrajets />} /> */}
            {/* <Route path="maintenances" element={<AdminMaintenances />} /> */}
            {/* <Route path="users" element={<AdminUsers />} /> */}
          </Route>
        </Route>

        {/* Routes Chauffeur avec Protection */}
        <Route
          path="/chauffeur"
          element={<ProtectedRoute allowedRoles={["chauffeur"]} />}
        >
          <Route element={<ChauffeurLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ChauffeurDashboard />} />
            {/* Futures routes chauffeur */}
            {/* <Route path="trajets" element={<ChauffeurTrajets />} /> */}
          </Route>
        </Route>

        {/* Route racine - redirige selon le rôle */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
