import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChauffeurDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de Bord Chauffeur
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue, {user?.nom} {user?.prenom}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Mes Trajets Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Trajets Terminés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Km Parcourus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 km</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mes Trajets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Aucun trajet assigné pour le moment
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                🗺️ Voir mes trajets
              </a>
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                📝 Mettre à jour un trajet
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
