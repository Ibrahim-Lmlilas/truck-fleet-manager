import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          camions: camions.filter((c) => !c.isDelete).slice(0, 5),
          remorques: remorques.filter((r) => !r.isDelete).slice(0, 5),
          trajets: trajets
            .filter((t) => t.statut === "en_cours" || t.statut === "planifie")
            .slice(0, 5),
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Camions */}
        <Card>
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
            ) : data.camions.length > 0 ? (
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
                    {data.camions.map((camion) => (
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
            ) : (
              <p className="text-center py-8 text-gray-500">Aucun camion</p>
            )}
          </CardContent>
        </Card>

        {/* Table Remorques */}
        <Card>
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
            ) : data.remorques.length > 0 ? (
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
                    {data.remorques.map((remorque) => (
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
            ) : (
              <p className="text-center py-8 text-gray-500">Aucune remorque</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table Trajets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trajets Actifs</CardTitle>
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
          ) : data.trajets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-gray-600">
                    <th className="pb-2 font-medium">Départ</th>
                    <th className="pb-2 font-medium">Destination</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trajets.map((trajet) => (
                    <tr key={trajet._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{trajet.depart || "-"}</td>
                      <td className="py-3 text-gray-600">{trajet.destination || "-"}</td>
                      <td className="py-3 text-gray-600">
                        {trajet.dateDepart
                          ? new Date(trajet.dateDepart).toLocaleDateString("fr-FR")
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">Aucun trajet actif</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
