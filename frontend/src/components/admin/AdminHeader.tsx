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
import { User, LogOut } from "lucide-react";

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
      <header className="header-container">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="text-gray-700 hover:text-gray-900 lg:hidden"
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
            <h1 className="text-xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 hidden sm:block">
              {user?.prenom} {user?.nom}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsUserModalOpen(true)}
              className="p-2"
            >
              <User className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>
      <style>{`
        .header-container {
          background-color: #cbcbcd;
          border-bottom: 1px solid #b0b0b2;
          border-radius: 0.75rem;
          margin: 0.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Modal User Info */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <DialogTitle>Mes Informations</DialogTitle>
                <DialogDescription>
                  Informations de votre profil utilisateur
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {user && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center border-b pb-3">
                <Label>Nom</Label>
                <p className="text-sm font-medium">{user.nom}</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center border-b pb-3">
                <Label>Prénom</Label>
                <p className="text-sm font-medium">{user.prenom}</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center border-b pb-3">
                <Label>Email</Label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>Rôle</Label>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                  user.role === 'admin' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'admin' ? 'Administrateur' : 'Chauffeur'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
