import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
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
  const itemsPerPage = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRemorque, setEditingRemorque] = useState<Remorque | null>(null);
  const [formData, setFormData] = useState<RemorquePayload>({
    matricule: "",
    type: "",
    capacite: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

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
    } catch (error) {
      console.error("Erreur lors du chargement des remorques:", error);
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
    if (!formData.matricule.trim()) {
      alert("Le matricule est obligatoire");
      return;
    }

    try {
      setSubmitting(true);
      if (editingRemorque) {
        await updateRemorque(editingRemorque._id, formData);
      } else {
        await createRemorque(formData);
      }
      setIsModalOpen(false);
      fetchRemorques();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(error.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette remorque ?")) {
      return;
    }

    try {
      await deleteRemorque(id);
      fetchRemorques();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredRemorques.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRemorques = filteredRemorques.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Remorques</h1>
          <p className="text-gray-600 mt-1">
            Gérez les remorques de votre flotte
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <span className="mr-2">➕</span>
          Ajouter une Remorque
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Rechercher par matricule ou type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : currentRemorques.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {searchTerm ? "Aucune remorque trouvée" : "Aucune remorque enregistrée"}
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRemorques.map((remorque) => (
                  <TableRow key={remorque._id}>
                    <TableCell className="font-medium">
                      {remorque.matricule}
                    </TableCell>
                    <TableCell>
                      {remorque.type ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {remorque.type}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {remorque.capacite ? (
                        <span className="font-semibold text-gray-700">
                          {remorque.capacite} T
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(remorque)}
                        >
                          ✏️ Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(remorque._id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          🗑️ Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({filteredRemorques.length}{" "}
                remorque{filteredRemorques.length > 1 ? "s" : ""})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}

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
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="matricule">
                  Matricule <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="matricule"
                  value={formData.matricule}
                  onChange={(e) =>
                    setFormData({ ...formData, matricule: e.target.value })
                  }
                  placeholder="Ex: REM-123-ABC"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
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
              <div className="grid gap-2">
                <Label htmlFor="capacite">Capacité (en tonnes)</Label>
                <Input
                  id="capacite"
                  type="number"
                  min="0"
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
};

export default AdminRemorques;
