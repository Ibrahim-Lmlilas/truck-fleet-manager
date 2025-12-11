import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";
import { setAuthToken } from "@/services/apiClient";

type ProtectedRouteProps = {
  allowedRoles?: string[];
  redirectTo?: string;
};

export default function ProtectedRoute({ allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, token, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
  }, [token]);

  // Si pas de token, rediriger vers login
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si pas d'utilisateur mais token existe, attendre le chargement
  if (!user || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si le fetch a échoué (token invalide), rediriger vers login
  if (status === "failed" && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si des rôles sont spécifiés et l'utilisateur n'a pas le bon rôle
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

