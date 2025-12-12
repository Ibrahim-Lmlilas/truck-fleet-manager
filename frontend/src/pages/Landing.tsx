import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#cbcbcd' }}>
      {/* Hero Section - Centered */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-8 sm:space-y-12">
          {/* Logo - 3x bigger */}
          <div className="flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Fleet Solutions" 
              className="h-30 sm:h-36 md:h-48 w-auto"
            />
          </div>

          {/* Text Content */}
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
              Gérez votre flotte de{" "}
              <span className="text-red-600">camions</span>{" "}
              en toute simplicité
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Solution complète de gestion de flotte pour optimiser vos trajets, 
              suivre vos véhicules et gérer vos maintenances.
            </p>
          </div>
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-6">
            <Link to="/login">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 flex items-center gap-2"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7"
              >
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

