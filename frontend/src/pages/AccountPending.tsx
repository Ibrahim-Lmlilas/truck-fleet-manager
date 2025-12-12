import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutThunk } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function AccountPending() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <span className="text-6xl">⏳</span>
          </div>
          <CardTitle className="text-center text-2xl">
            Compte en attente d'approbation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Bonjour <strong>{user?.prenom} {user?.nom}</strong>,
            </p>
            <p>
              Votre compte a été créé avec succès mais il est en attente d'approbation par un administrateur.
            </p>
            <p className="mt-4 text-sm">
              Vous pourrez accéder à votre dashboard une fois que votre compte aura été activé.
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <Button onClick={handleLogout} variant="outline">
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

