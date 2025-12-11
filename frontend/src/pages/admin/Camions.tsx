import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getCamions,
  createCamion,
  updateCamion,
  deleteCamion,
  type Camion,
  type CamionPayload,
} from "@/services/camion.service";

export default function CamionsPage() {
  const [camions, setCamions] = useState<Camion[]>([]);
  const [filteredCamions, setFilteredCamions] = useState<Camion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamion, setEditingCamion] = useState<Camion | null>(null);
  const [formData, setFormData] = useState<CamionPayload>({
    matricule: "",
    marque: "",
    modele: "",
    annee: undefined,
    kilometrage: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCamions();
  }, []);

  useEffect(() => {
    // Filter camions based on search
    const filtered = camions.filter(
      (c) =>
        !c.isDelete &&
        (c.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.modele?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCamions(filtered);
    setCurrentPage(1);
  }, [searchTerm, camions]);

  const fetchCamions = async () => {
    try {
      setLoading(true);
      const data = await getCamions();
      const camionsArray = Array.isArray(data) ? data : [];
      setCamions(camionsArray);
      setFilteredCamions(camionsArray.filter((c) => !c.isDelete));
    } catch (error) {
      console.error("Erreur lors du chargement des camions:", error);
      setCamions([]);
      setFilteredCamions([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCamion(null);
    setFormData({
      matricule: "",
      marque: "",
      modele: "",
      annee: undefined,
      kilometrage: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (camion: Camion) => {
    setEditingCamion(camion);
    setFormData({
      matricule: camion.matricule,
      marque: camion.marque || "",
      modele: camion.modele || "",
      annee: camion.annee,
      kilometrage: camion.kilometrage,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCamion) {
        await updateCamion(editingCamion._id, formData);
      } else {
        await createCamion(formData);
      }
      setIsModalOpen(false);
      fetchCamions();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du camion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce camion ?")) {
      return;
    }

    try {
      await deleteCamion(id);
      fetchCamions();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du camion");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCamions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCamions = filteredCamions.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Camions</h1>
          <p className="text-gray-600 mt-1">
            {filteredCamions.length} camion(s) au total
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <span className="mr-2">+</span> Ajouter un camion
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher par matricule, marque ou modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : currentCamions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modèle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Année
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kilométrage
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCamions.map((camion) => (
                      <tr key={camion._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {camion.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {camion.marque || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {camion.modele || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {camion.annee || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="font-medium">
                            {camion.kilometrage?.toLocaleString() || 0}
                          </span>{" "}
                          km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(camion)}
                            className="mr-2"
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(camion._id)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchTerm
                ? "Aucun camion trouvé pour cette recherche"
                : "Aucun camion. Cliquez sur 'Ajouter un camion' pour commencer."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCamion ? "Modifier le camion" : "Ajouter un camion"}
            </DialogTitle>
            <DialogDescription>
              {editingCamion
                ? "Modifiez les informations du camion ci-dessous."
                : "Remplissez les informations pour ajouter un nouveau camion."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule *</Label>
                <Input
                  id="matricule"
                  required
                  value={formData.matricule}
                  onChange={(e) =>
                    setFormData({ ...formData, matricule: e.target.value })
                  }
                  placeholder="Ex: 12345-A-67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marque">Marque</Label>
                <Input
                  id="marque"
                  value={formData.marque}
                  onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                  placeholder="Ex: Mercedes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modele">Modèle</Label>
                <Input
                  id="modele"
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  placeholder="Ex: Actros"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annee">Année</Label>
                <Input
                  id="annee"
                  type="number"
                  value={formData.annee || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      annee: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kilometrage">Kilométrage (km)</Label>
                <Input
                  id="kilometrage"
                  type="number"
                  value={formData.kilometrage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kilometrage: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 50000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
