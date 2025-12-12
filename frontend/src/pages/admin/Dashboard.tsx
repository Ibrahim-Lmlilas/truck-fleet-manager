import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getCamions, type Camion } from "@/services/camion.service";
import { getTrajets, type Trajet } from "@/services/trajet.service";
import { getMaintenancesAlertes } from "@/services/maintenance.service";
import { getRemorques, type Remorque } from "@/services/remorque.service";

type DashboardStats = {
  totalCamions: number;
  trajetsActifs: number;
  maintenancesAPrevenir: number;
  loading: boolean;
};

type DashboardData = {
  camions: Camion[];
  remorques: Remorque[];
  trajets: Trajet[];
  loadingTables: boolean;
};

const ITEMS_PER_PAGE = 3;

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalCamions: 0,
    trajetsActifs: 0,
    maintenancesAPrevenir: 0,
    loading: true,
  });
  
  const [data, setData] = useState<DashboardData>({
    camions: [],
    remorques: [],
    trajets: [],
    loadingTables: true,
  });

  // États de pagination pour chaque tableau
  const [pageTrajets, setPageTrajets] = useState(1);
  const [pageCamions, setPageCamions] = useState(1);
  const [pageRemorques, setPageRemorques] = useState(1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        // Fetch camions
        const camions = await getCamions();
        const totalCamions = camions.filter((c) => !c.isDelete).length;

        // Fetch trajets en cours
        const trajets = await getTrajets();
        const trajetsActifs = trajets.filter(
          (t) => t.statut === "en_cours" || t.statut === "planifie"
        ).length;

        // Fetch maintenances alertes
        const maintenances = await getMaintenancesAlertes();
        const maintenancesAPrevenir = maintenances.filter((m) => !m.effectuee).length;

        setStats({
          totalCamions,
          trajetsActifs,
          maintenancesAPrevenir,
          loading: false,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loadingTables: true }));

        const [camions, remorques, trajets] = await Promise.all([
          getCamions(),
          getRemorques(),
          getTrajets(),
        ]);

        setData({
          camions: camions.filter((c) => !c.isDelete),
          remorques: remorques.filter((r) => !r.isDelete),
          trajets: trajets,
          loadingTables: false,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setData((prev) => ({ ...prev, loadingTables: false }));
      }
    };

    fetchStats();
    fetchData();
  }, []);

  // Calcul des données paginées pour chaque tableau
  const totalPagesTrajets = Math.ceil(data.trajets.length / ITEMS_PER_PAGE);
  const totalPagesCamions = Math.ceil(data.camions.length / ITEMS_PER_PAGE);
  const totalPagesRemorques = Math.ceil(data.remorques.length / ITEMS_PER_PAGE);

  const trajetsPagines = data.trajets.slice(
    (pageTrajets - 1) * ITEMS_PER_PAGE,
    pageTrajets * ITEMS_PER_PAGE
  );

  const camionsPaginees = data.camions.slice(
    (pageCamions - 1) * ITEMS_PER_PAGE,
    pageCamions * ITEMS_PER_PAGE
  );

  const remorquesPaginees = data.remorques.slice(
    (pageRemorques - 1) * ITEMS_PER_PAGE,
    pageRemorques * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de Bord Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue, {user?.prenom} {user?.nom}
        </p>
      </div>

      <div className="grid grid-rows-[auto_1fr] gap-6">
        <div className="grid grid-cols-[30%_70%] gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Camions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalCamions}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Trajets Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {stats.trajetsActifs}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Maintenances Prévues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.maintenancesAPrevenir}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Alertes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-red-600">
                    {stats.maintenancesAPrevenir > 0 ? stats.maintenancesAPrevenir : 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table Trajets - 70% largeur */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trajets</CardTitle>
              <Link to="/admin/trajets" className="text-sm text-blue-600 hover:underline">
                Voir tout →
              </Link>
            </CardHeader>
            <CardContent>
              {data.loadingTables ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : trajetsPagines.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr className="text-left text-gray-600">
                          <th className="pb-2 font-medium">Date départ</th>
                          <th className="pb-2 font-medium">Chauffeur</th>
                          <th className="pb-2 font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trajetsPagines.map((trajet) => {
                          const chauffeurInfo = typeof trajet.chauffeur === 'object' && trajet.chauffeur !== null 
                            ? trajet.chauffeur as { nom?: string; prenom?: string }
                            : null;
                          
                          return (
                            <tr key={trajet._id} className="border-b hover:bg-gray-50">
                              <td className="py-3 font-medium">
                                {trajet.dateDepart
                                  ? new Date(trajet.dateDepart).toLocaleDateString("fr-FR")
                                  : "-"}
                              </td>
                              <td className="py-3 text-gray-600">
                                {chauffeurInfo 
                                  ? `${chauffeurInfo.prenom || ""} ${chauffeurInfo.nom || ""}`.trim() || "-"
                                  : "-"}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    trajet.statut === "en_cours"
                                      ? "bg-green-100 text-green-700"
                                      : trajet.statut === "planifie"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {trajet.statut === "en_cours"
                                    ? "En cours"
                                    : trajet.statut === "planifie"
                                    ? "Planifié"
                                    : trajet.statut}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalPagesTrajets > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
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
                <p className="text-center py-8 text-gray-500">Aucun trajet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deuxième ligne: 50% hauteur - Derniers Camions (50% largeur) + Dernières Remorques (50% largeur) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Table Camions */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Derniers Camions</CardTitle>
              <Link to="/admin/camions" className="text-sm text-blue-600 hover:underline">
                Voir tout →
              </Link>
            </CardHeader>
            <CardContent>
              {data.loadingTables ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : camionsPaginees.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr className="text-left text-gray-600">
                          <th className="pb-2 font-medium">Matricule</th>
                          <th className="pb-2 font-medium">Marque</th>
                          <th className="pb-2 font-medium">KM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {camionsPaginees.map((camion) => (
                          <tr key={camion._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 font-medium">{camion.matricule}</td>
                            <td className="py-3 text-gray-600">{camion.marque || "-"}</td>
                            <td className="py-3 text-gray-600">
                              {camion.kilometrage?.toLocaleString() || 0} km
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPagesCamions > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => {
                                if (pageCamions > 1) setPageCamions(pageCamions - 1);
                              }}
                              disabled={pageCamions === 1}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPagesCamions }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setPageCamions(page)}
                                isActive={page === pageCamions}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => {
                                if (pageCamions < totalPagesCamions) setPageCamions(pageCamions + 1);
                              }}
                              disabled={pageCamions === totalPagesCamions}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-8 text-gray-500">Aucun camion</p>
              )}
            </CardContent>
          </Card>

          {/* Table Remorques */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dernières Remorques</CardTitle>
              <Link to="/admin/remorques" className="text-sm text-blue-600 hover:underline">
                Voir tout →
              </Link>
            </CardHeader>
            <CardContent>
              {data.loadingTables ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : remorquesPaginees.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr className="text-left text-gray-600">
                          <th className="pb-2 font-medium">Matricule</th>
                          <th className="pb-2 font-medium">Type</th>
                          <th className="pb-2 font-medium">Capacité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {remorquesPaginees.map((remorque) => (
                          <tr key={remorque._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 font-medium">{remorque.matricule}</td>
                            <td className="py-3 text-gray-600">{remorque.type || "-"}</td>
                            <td className="py-3 text-gray-600">
                              {remorque.capacite ? `${remorque.capacite} T` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPagesRemorques > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => {
                                if (pageRemorques > 1) setPageRemorques(pageRemorques - 1);
                              }}
                              disabled={pageRemorques === 1}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPagesRemorques }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setPageRemorques(page)}
                                isActive={page === pageRemorques}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => {
                                if (pageRemorques < totalPagesRemorques) setPageRemorques(pageRemorques + 1);
                              }}
                              disabled={pageRemorques === totalPagesRemorques}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-8 text-gray-500">Aucune remorque</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
