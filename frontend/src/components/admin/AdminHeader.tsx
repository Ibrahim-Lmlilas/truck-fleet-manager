import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutThunk } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Props = {
  onMenuClick: () => void;
};

export default function AdminHeader({ onMenuClick }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <>
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.prenom} {user?.nom}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsUserModalOpen(true)}
            >
              Me
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Modal User Info */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mes Informations</DialogTitle>
            <DialogDescription>
              Informations de votre profil utilisateur
            </DialogDescription>
          </DialogHeader>
          {user && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <p className="text-sm font-medium mt-1">{user.nom}</p>
                </div>
                <div>
                  <Label>Prénom</Label>
                  <p className="text-sm font-medium mt-1">{user.prenom}</p>
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <Label>Rôle</Label>
                <p className="text-sm font-medium mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrateur' : 'Chauffeur'}
                  </span>
                </p>
              </div>
              {user.isActive !== undefined && (
                <div>
                  <Label>Statut</Label>
                  <p className="text-sm font-medium mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setIsUserModalOpen(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
