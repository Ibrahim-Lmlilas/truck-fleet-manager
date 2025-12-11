import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de Bord Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue, {user?.nom} {user?.prenom}
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
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Trajets Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Maintenances Prévues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Chauffeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion de la Flotte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                📦 Gérer les Camions
              </a>
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                🚛 Gérer les Remorques
              </a>
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                ⚙️ Gérer les Pneus
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opérations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                🗺️ Gérer les Trajets
              </a>
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                🔧 Gérer les Maintenances
              </a>
              <a href="#" className="block p-3 hover:bg-gray-50 rounded">
                👥 Gérer les Utilisateurs
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
