import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context";

export default function Unauthorized() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-8xl">🔒</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">401</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Accès Non Autorisé
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Veuillez vous connecter avec un compte approprié.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleLogout}>
            Se déconnecter
          </Button>
          <Link to="/">
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

