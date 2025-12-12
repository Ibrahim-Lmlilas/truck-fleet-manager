import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  getRemorques,
  createRemorque,
  updateRemorque,
  deleteRemorque,
  type Remorque,
  type RemorquePayload,
} from "../../services/remorque.service";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const AdminRemorques = () => {
  const [remorques, setRemorques] = useState<Remorque[]>([]);
  const [filteredRemorques, setFilteredRemorques] = useState<Remorque[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [remorqueToDelete, setRemorqueToDelete] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRemorque, setEditingRemorque] = useState<Remorque | null>(null);
  const [formData, setFormData] = useState<RemorquePayload>({
    matricule: "",
    type: "",
    capacite: undefined,
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
    fetchRemorques();
  }, []);

  useEffect(() => {
    const filtered = remorques.filter((remorque) => {
      const search = searchTerm.toLowerCase();
      return (
        remorque.matricule.toLowerCase().includes(search) ||
        (remorque.type && remorque.type.toLowerCase().includes(search))
      );
    });
    setFilteredRemorques(filtered);
    setCurrentPage(1);
  }, [searchTerm, remorques]);

  const fetchRemorques = async () => {
    try {
      setLoading(true);
      const data = await getRemorques();
      const activeRemorques = data.filter((r) => !r.isDelete);
      setRemorques(activeRemorques);
      setFilteredRemorques(activeRemorques);
    } catch (error: any) {
      console.error("Erreur lors du chargement des remorques:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(`Erreur lors du chargement: ${errorMessage}`, {
        duration: 5000,
      });
      setRemorques([]);
      setFilteredRemorques([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRemorque(null);
    setFormData({
      matricule: "",
      type: "",
      capacite: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (remorque: Remorque) => {
    setEditingRemorque(remorque);
    setFormData({
      matricule: remorque.matricule,
      type: remorque.type || "",
      capacite: remorque.capacite,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      if (editingRemorque) {
        await updateRemorque(editingRemorque._id, formData);
        toast.success("Remorque modifiée avec succès");
      } else {
        await createRemorque(formData);
        toast.success("Remorque ajoutée avec succès");
      }
      setIsModalOpen(false);
      fetchRemorques();
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
    setRemorqueToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!remorqueToDelete) return;

    try {
      await deleteRemorque(remorqueToDelete);
      toast.success("Remorque supprimée avec succès");
      setDeleteDialogOpen(false);
      setRemorqueToDelete(null);
      fetchRemorques();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredRemorques.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRemorques = filteredRemorques.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Remorques</h1>
        <p className="text-gray-600 mt-1">
          {filteredRemorques.length} remorque(s) au total
        </p>
      </div>


        <CardHeader>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une remorque
          </Button>
          <Input
            placeholder="Rechercher par matricule ou type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : currentRemorques.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacité
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRemorques.map((remorque) => (
                      <tr key={remorque._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {remorque.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {remorque.type ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {remorque.type}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {remorque.capacite ? (
                            <span className="font-semibold text-gray-700">
                              {remorque.capacite} T
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(remorque)}
                            className="mr-2"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(remorque._id)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex justify-center">
                  <Pagination>
                    <PaginationContent>
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
            <div className="p-8 text-center text-gray-500">
              {searchTerm
                ? "Aucune remorque trouvée pour cette recherche"
                : "Aucune remorque. Cliquez sur 'Ajouter une remorque' pour commencer."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRemorque ? "Modifier la Remorque" : "Nouvelle Remorque"}
            </DialogTitle>
            <DialogDescription>
              {editingRemorque
                ? "Modifiez les informations de la remorque"
                : "Ajoutez une nouvelle remorque à votre flotte"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricule">Matricule *</Label>
                  <Input
                    id="matricule"
                    required
                    maxLength={20}
                    value={formData.matricule}
                    onChange={(e) =>
                      setFormData({ ...formData, matricule: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: REM-123-ABC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bâchée">Bâchée</SelectItem>
                      <SelectItem value="frigorifique">Frigorifique</SelectItem>
                      <SelectItem value="plateau">Plateau</SelectItem>
                      <SelectItem value="citerne">Citerne</SelectItem>
                      <SelectItem value="porte-conteneur">Porte-conteneur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacite">Capacité (tonnes) *</Label>
                <Input
                  id="capacite"
                  type="number"
                  required
                  min="1"
                  step="0.1"
                  value={formData.capacite || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacite: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 25"
                />
                <p className="text-xs text-gray-500">
                  Minimum 1 tonne
                </p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cette remorque sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemorqueToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRemorques;
