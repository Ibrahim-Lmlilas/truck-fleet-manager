import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const itemsPerPage = 8;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [camionToDelete, setCamionToDelete] = useState<string | null>(null);

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

  // Fonction pour extraire le message d'erreur
  const getErrorMessage = (error: any): string => {
    if (!error) return "Une erreur est survenue";
    
    // Erreur de validation Yup avec plusieurs messages
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.join(", ");
      }
      if (typeof errors === "object") {
        return Object.values(errors).flat().join(", ");
      }
    }
    
    // Message d'erreur unique
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Erreur réseau
    if (error.message) {
      return error.message;
    }
    
    return "Une erreur est survenue";
  };

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
    } catch (error: any) {
      console.error("Erreur lors du chargement des camions:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(`Erreur lors du chargement: ${errorMessage}`, {
        duration: 5000,
      });
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
        toast.success("Camion modifié avec succès");
      } else {
        await createCamion(formData);
        toast.success("Camion ajouté avec succès");
      }
      setIsModalOpen(false);
      fetchCamions();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCamionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!camionToDelete) return;

    try {
      await deleteCamion(camionToDelete);
      toast.success("Camion supprimé avec succès");
      setDeleteDialogOpen(false);
      setCamionToDelete(null);
      fetchCamions();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCamions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCamions = filteredCamions.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Camions</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {filteredCamions.length} camion(s) au total
        </p>
      </div>


        <CardHeader>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un camion
          </Button>
          <Input
            placeholder="Rechercher par matricule, marque ou modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-md"
          />
          
        </CardContent>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : currentCamions.length > 0 ? (
            <>
              {/* Desktop Table - visible on lg+ */}
              <div className="hidden lg:block overflow-x-auto">
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
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(camion._id)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Cards - visible on < lg */}
              <div className="lg:hidden divide-y divide-gray-200">
                {currentCamions.map((camion) => (
                  <div key={camion._id} className="p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {camion.matricule}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {camion.marque || "-"} {camion.modele || ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(camion)}
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(camion._id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500">Année:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {camion.annee || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Kilométrage:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {camion.kilometrage?.toLocaleString() || 0} km
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex justify-center">
                  <Pagination>
                    <PaginationContent className="gap-1 sm:gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 sm:p-8 text-center text-sm sm:text-base text-gray-500">
              {searchTerm
                ? "Aucun camion trouvé pour cette recherche"
                : "Aucun camion. Cliquez sur 'Ajouter un camion' pour commencer."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingCamion ? "Modifier le camion" : "Ajouter un camion"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingCamion
                ? "Modifiez les informations du camion ci-dessous."
                : "Remplissez les informations pour ajouter un nouveau camion."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="matricule" className="text-xs sm:text-sm">Matricule *</Label>
                <Input
                  id="matricule"
                  required
                  maxLength={20}
                  value={formData.matricule}
                  onChange={(e) =>
                    setFormData({ ...formData, matricule: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: 12345-A-67"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="marque" className="text-xs sm:text-sm">Marque</Label>
                <Input
                  id="marque"
                  maxLength={50}
                  value={formData.marque}
                  onChange={(e) => setFormData({ ...formData, marque: e.target.value.toLowerCase() })}
                  placeholder="Ex: Mercedes"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="modele" className="text-xs sm:text-sm">Modèle</Label>
                <Input
                  id="modele"
                  maxLength={50}
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value.toLowerCase() })}
                  placeholder="Ex: Actros"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="annee" className="text-xs sm:text-sm">Année *</Label>
                <Input
                  id="annee"
                  type="number"
                  required
                  min={1980}
                  max={new Date().getFullYear() + 1}
                  value={formData.annee || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      annee: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 2020"
                  className="text-sm sm:text-base"
                />
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Entre 1980 et {new Date().getFullYear() + 1}
                </p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="kilometrage" className="text-xs sm:text-sm">Kilométrage (km)</Label>
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
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="w-full sm:w-auto text-sm"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto text-sm">
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Cette action est irréversible. Ce camion sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setCamionToDelete(null)} className="w-full sm:w-auto text-sm">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
