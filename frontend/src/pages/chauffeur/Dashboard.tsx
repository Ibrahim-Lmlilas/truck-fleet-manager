import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getTrajets } from "@/services/trajet.service";

// Types locaux pour les données réelles du backend
type ChauffeurInfo = {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
};

type CamionInfo = {
  _id: string;
  matricule: string;
  marque?: string;
  modele?: string;
  kilometrage?: number;
};

type RemorqueInfo = {
  _id: string;
  matricule: string;
  type?: string;
  capacite?: number;
};

type TrajetBackend = {
  _id: string;
  chauffeur: string | ChauffeurInfo;
  camion: string | CamionInfo;
  remorque?: string | RemorqueInfo;
  dateDepart: string;
  dateArrivee: string;
  lieuDepart: string;
  lieuArrivee: string;
  kmDepart?: number;
  kmArrivee?: number;
  gasoilConsomme?: number;
  statut: 'à faire' | 'en cours' | 'terminé' | 'annulé';
  remarques?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type DashboardStats = {
  trajetsActifs: number;
  trajetsTermines: number;
  totalKmParcourus: number;
  loading: boolean;
};

type DashboardData = {
  trajets: TrajetBackend[];
  loading: boolean;
};

const ITEMS_PER_PAGE = 5;

export default function ChauffeurDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    trajetsActifs: 0,
    trajetsTermines: 0,
    totalKmParcourus: 0,
    loading: true,
  });
  
  const [data, setData] = useState<DashboardData>({
    trajets: [],
    loading: true,
  });

  const [pageTrajets, setPageTrajets] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));
        setData((prev) => ({ ...prev, loading: true }));

        // Fetch trajets (le backend filtre automatiquement pour le chauffeur)
        const trajets = await getTrajets() as unknown as TrajetBackend[];

        // Calculer les statistiques
        const trajetsActifs = trajets.filter(
          (t) => t.statut === "en cours" || t.statut === "à faire"
        ).length;

        const trajetsTermines = trajets.filter(
          (t) => t.statut === "terminé"
        ).length;

        // Calculer le total de km parcourus
        const totalKmParcourus = trajets.reduce((total, trajet) => {
          if (trajet.kmArrivee && trajet.kmDepart) {
            return total + (trajet.kmArrivee - trajet.kmDepart);
          }
          return total;
        }, 0);

        setStats({
          trajetsActifs,
          trajetsTermines,
          totalKmParcourus,
          loading: false,
        });

        setData({
          trajets: trajets,
          loading: false,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setStats((prev) => ({ ...prev, loading: false }));
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  // Calcul des données paginées
  const totalPagesTrajets = Math.ceil(data.trajets.length / ITEMS_PER_PAGE);
  const trajetsPagines = data.trajets.slice(
    (pageTrajets - 1) * ITEMS_PER_PAGE,
    pageTrajets * ITEMS_PER_PAGE
  );

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case "en cours":
        return "bg-green-100 text-green-700";
      case "à faire":
        return "bg-blue-100 text-blue-700";
      case "terminé":
        return "bg-gray-100 text-gray-700";
      case "annulé":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "en cours":
        return "En cours";
      case "à faire":
        return "À faire";
      case "terminé":
        return "Terminé";
      case "annulé":
        return "Annulé";
      default:
        return statut;
    }
  };

  const getCamionInfo = (camion: string | CamionInfo) => {
    if (typeof camion === 'object' && camion !== null) {
      return camion as CamionInfo;
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tableau de Bord Chauffeur
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Bienvenue, {user?.prenom} {user?.nom}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4 sm:gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Trajets Actifs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {stats.loading ? (
                <div className="animate-pulse">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.trajetsActifs}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Trajets Terminés
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {stats.loading ? (
                <div className="animate-pulse">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats.trajetsTermines}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Km Parcourus
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {stats.loading ? (
                <div className="animate-pulse">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 sm:w-24"></div>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {stats.totalKmParcourus.toLocaleString()} km
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table Trajets */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Mes Trajets</CardTitle>
            <Link to="/chauffeur/trajets" className="text-xs sm:text-sm text-blue-600 hover:underline whitespace-nowrap">
              Voir tout →
            </Link>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {data.loading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-2 sm:space-x-4">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24"></div>
                  </div>
                ))}
              </div>
            ) : trajetsPagines.length > 0 ? (
              <>
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="border-b">
                      <tr className="text-left text-gray-600">
                        <th className="pb-2 pl-3 sm:pl-0 font-medium">Date départ</th>
                        <th className="pb-2 font-medium hidden sm:table-cell">Départ</th>
                        <th className="pb-2 font-medium hidden md:table-cell">Destination</th>
                        <th className="pb-2 font-medium hidden lg:table-cell">Camion</th>
                        <th className="pb-2 pr-3 sm:pr-0 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trajetsPagines.map((trajet) => {
                        const camionInfo = getCamionInfo(trajet.camion);
                        return (
                          <tr key={trajet._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 sm:py-3 pl-3 sm:pl-0 font-medium text-xs sm:text-sm">
                              {trajet.dateDepart
                                ? new Date(trajet.dateDepart).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: window.innerWidth < 640 ? "2-digit" : "numeric"
                                  })
                                : "-"}
                            </td>
                            <td className="py-2 sm:py-3 text-gray-600 text-xs sm:text-sm hidden sm:table-cell truncate max-w-[120px]">
                              {trajet.lieuDepart || "-"}
                            </td>
                            <td className="py-2 sm:py-3 text-gray-600 text-xs sm:text-sm hidden md:table-cell truncate max-w-[120px]">
                              {trajet.lieuArrivee || "-"}
                            </td>
                            <td className="py-2 sm:py-3 text-gray-600 text-xs sm:text-sm hidden lg:table-cell">
                              {camionInfo?.matricule || "-"}
                            </td>
                            <td className="py-2 sm:py-3 pr-3 sm:pr-0">
                              <span
                                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatutBadgeClass(trajet.statut)}`}
                              >
                                {getStatutLabel(trajet.statut)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPagesTrajets > 1 && (
                  <div className="mt-3 sm:mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent className="gap-1 sm:gap-2">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => {
                              if (pageTrajets > 1) setPageTrajets(pageTrajets - 1);
                            }}
                            disabled={pageTrajets === 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPagesTrajets }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setPageTrajets(page)}
                              isActive={page === pageTrajets}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              if (pageTrajets < totalPagesTrajets) setPageTrajets(pageTrajets + 1);
                            }}
                            disabled={pageTrajets === totalPagesTrajets}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center py-8 text-gray-500">Aucun trajet assigné pour le moment</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
