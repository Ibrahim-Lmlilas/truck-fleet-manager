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
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onMenuClick}
              className="text-gray-700 hover:text-gray-900 lg:hidden p-1"
              aria-label="Ouvrir le menu"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
            <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-800">
              <span className="text-red-700">A</span>dmin
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <span className="text-xs sm:text-sm text-gray-700 hidden md:block truncate max-w-[120px] lg:max-w-none">
              {user?.prenom} {user?.nom}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsUserModalOpen(true)}
              className="p-1.5 sm:p-2"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>
      <style>{`
        .header-container {
          background-color: #161616ff;
          border-bottom: 1px solid #b0b0b2;
          border-radius: 0.75rem;
          margin: 0.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        @media (max-width: 640px) {
          .header-container {
            margin: 0.25rem;
            border-radius: 0.5rem;
          }
        }
      `}</style>

      {/* Modal User Info */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] mx-auto">
          <DialogHeader className="border-b pb-3 sm:pb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg">Mes Informations</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Informations de votre profil utilisateur
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {user && (
            <div className="space-y-2 sm:space-y-3 py-3 sm:py-4">
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center border-b pb-2 sm:pb-3">
                <Label className="text-xs sm:text-sm">Nom</Label>
                <p className="text-xs sm:text-sm font-medium truncate">{user.nom}</p>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center border-b pb-2 sm:pb-3">
                <Label className="text-xs sm:text-sm">Prénom</Label>
                <p className="text-xs sm:text-sm font-medium truncate">{user.prenom}</p>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center border-b pb-2 sm:pb-3">
                <Label className="text-xs sm:text-sm">Email</Label>
                <p className="text-xs sm:text-sm font-medium truncate">{user.email}</p>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center">
                <Label className="text-xs sm:text-sm">Rôle</Label>
                <span className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full w-fit ${
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
