import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, RefreshCw, Eye } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getPneus,
  createPneu,
  updatePneu,
  deletePneu,
  remplacerPneu,
  calculerUsure,
} from "@/services/pneu.service";
import { getCamions, type Camion } from "@/services/camion.service";

// Types locaux pour les données réelles du backend
type CamionInfo = {
  _id: string;
  matricule: string;
  marque?: string;
  modele?: string;
  kilometrage?: number;
};

type PneuBackend = {
  _id: string;
  reference: string;
  camion: string | CamionInfo;
  position: 'avant gauche' | 'avant droit' | 'arrière gauche 1' | 'arrière gauche 2' | 'arrière droit 1' | 'arrière droit 2' | 'secours';
  kmPose: number;
  kmMax: number;
  statut: 'bon' | 'usé' | 'à remplacer' | 'remplacé';
  prix?: number;
  dateRemplacement?: string;
  createdAt?: string;
  updatedAt?: string;
};

type PneuPayloadBackend = {
  reference: string;
  camion: string;
  position: PneuBackend['position'];
  kmPose: number;
  kmMax: number;
  prix?: number;
  statut?: PneuBackend['statut'];
};

type RemplacerPneuPayload = {
  nouveauPneu: {
    reference: string;
    kmPose?: number;
    kmMax?: number;
    prix?: number;
  };
};

type UsureData = {
  pneu: {
    id: string;
    reference: string;
    position: string;
    statut: string;
  };
  camion: {
    matricule: string;
    kilometrageActuel: number;
  };
  usure: {
    kmPose: number;
    kmMax: number;
    kmParcouru: number;
    kmRestant: number;
    pourcentageUsure: number;
  };
  alerte?: string;
};

const POSITIONS = [
  'avant gauche',
  'avant droit',
  'arrière gauche 1',
  'arrière gauche 2',
  'arrière droit 1',
  'arrière droit 2',
  'secours',
] as const;

const STATUTS = ['bon', 'usé', 'à remplacer', 'remplacé'] as const;

export default function PneusPage() {
  const [pneus, setPneus] = useState<PneuBackend[]>([]);
  const [filteredPneus, setFilteredPneus] = useState<PneuBackend[]>([]);
  const [camions, setCamions] = useState<Camion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCamion, setSelectedCamion] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pneuToDelete, setPneuToDelete] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemplacementModalOpen, setIsRemplacementModalOpen] = useState(false);
  const [isUsureModalOpen, setIsUsureModalOpen] = useState(false);
  const [editingPneu, setEditingPneu] = useState<PneuBackend | null>(null);
  const [pneuToReplace, setPneuToReplace] = useState<PneuBackend | null>(null);
  const [pneuUsure, setPneuUsure] = useState<UsureData | null>(null);
  const [calculatingUsure, setCalculatingUsure] = useState(false);

  const [formData, setFormData] = useState<PneuPayloadBackend>({
    reference: "",
    camion: "",
    position: "avant gauche",
    kmPose: 0,
    kmMax: 80000,
    prix: undefined,
    statut: "bon",
  });

  const [remplacementData, setRemplacementData] = useState<{
    reference: string;
    kmPose?: number;
    kmMax?: number;
    prix?: number;
  }>({
    reference: "",
    kmPose: undefined,
    kmMax: 80000,
    prix: undefined,
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
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = pneus;

    // Filtre par camion
    if (selectedCamion && selectedCamion !== "all") {
      filtered = filtered.filter((p) => {
        const camionId = typeof p.camion === 'string' ? p.camion : p.camion._id;
        return camionId === selectedCamion;
      });
    }

    // Filtre par recherche (référence ou matricule)
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof p.camion === 'object' && p.camion?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPneus(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCamion, pneus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pneusData, camionsData] = await Promise.all([
        getPneus(),
        getCamions(),
      ]);
      // Le backend retourne les vraies données, on les cast en type local
      setPneus((pneusData as any) || []);
      setFilteredPneus((pneusData as any) || []);
      setCamions(camionsData || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(`Erreur lors du chargement: ${errorMessage}`, {
        duration: 5000,
      });
      setPneus([]);
      setFilteredPneus([]);
      setCamions([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPneu(null);
    setFormData({
      reference: "",
      camion: "",
      position: "avant gauche",
      kmPose: 0,
      kmMax: 80000,
      prix: undefined,
      statut: "bon",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pneu: PneuBackend) => {
    setEditingPneu(pneu);
    const camionId = typeof pneu.camion === 'string' ? pneu.camion : pneu.camion._id;
    setFormData({
      reference: pneu.reference,
      camion: camionId,
      position: pneu.position,
      kmPose: pneu.kmPose,
      kmMax: pneu.kmMax,
      prix: pneu.prix,
      statut: pneu.statut,
    });
    setIsModalOpen(true);
  };

  const openRemplacementModal = (pneu: PneuBackend) => {
    setPneuToReplace(pneu);
    const camionInfo = typeof pneu.camion === 'object' ? pneu.camion : null;
    setRemplacementData({
      reference: "",
      kmPose: camionInfo?.kilometrage || undefined,
      kmMax: 80000,
      prix: undefined,
    });
    setIsRemplacementModalOpen(true);
  };

  const openUsureModal = async (pneu: PneuBackend) => {
    try {
      setCalculatingUsure(true);
      const usureData = await calculerUsure(pneu._id);
      setPneuUsure(usureData as any);
      setIsUsureModalOpen(true);
    } catch (error: any) {
      console.error("Erreur lors du calcul de l'usure:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setCalculatingUsure(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: kmMax doit être supérieur à kmPose
    if (formData.kmMax <= formData.kmPose) {
      toast.error("Le kilométrage maximum doit être supérieur au kilométrage de pose", {
        duration: 5000,
      });
      return;
    }
    
    setSubmitting(true);

    try {
      if (editingPneu) {
        await updatePneu(editingPneu._id, formData as any);
        toast.success("Pneu modifié avec succès");
      } else {
        await createPneu(formData as any);
        toast.success("Pneu ajouté avec succès");
      }
      setIsModalOpen(false);
      fetchData();
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

  const handleRemplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pneuToReplace) return;

    setSubmitting(true);

    try {
      const payload: RemplacerPneuPayload = {
        nouveauPneu: remplacementData,
      };
      await remplacerPneu(pneuToReplace._id, payload as any);
      toast.success("Pneu remplacé avec succès");
      setIsRemplacementModalOpen(false);
      setPneuToReplace(null);
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors du remplacement:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPneuToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pneuToDelete) return;

    try {
      await deletePneu(pneuToDelete);
      toast.success("Pneu supprimé avec succès");
      setDeleteDialogOpen(false);
      setPneuToDelete(null);
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const getStatutColor = (statut: string): string => {
    switch (statut) {
      case "bon":
        return "bg-green-100 text-green-800";
      case "usé":
        return "bg-yellow-100 text-yellow-800";
      case "à remplacer":
        return "bg-red-100 text-red-800";
      case "remplacé":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredPneus.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPneus = filteredPneus.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Pneus</h1>
        <p className="text-gray-600 mt-1">
          {filteredPneus.length} pneu(s) au total
        </p>
      </div>

   
        <CardHeader>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un pneu
          </Button>
          
          <div className="flex-1">
            <Input
              placeholder="Rechercher par référence ou matricule camion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="flex-1">
            <Select
              value={selectedCamion}
              onValueChange={(value) => {
                setSelectedCamion(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les camions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les camions</SelectItem>
                {camions.map((camion) => (
                  <SelectItem key={camion._id} value={camion._id}>
                    {camion.matricule} {camion.marque && `- ${camion.marque}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(selectedCamion !== "all" || searchTerm) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCamion("all");
                setSearchTerm("");
              }}
            >
              Réinitialiser
            </Button>
          )}
        </CardContent>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : currentPneus.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Référence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Camion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KM Pose / Max
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPneus.map((pneu) => {
                      const camionInfo = typeof pneu.camion === 'object' ? pneu.camion : null;
                      const camionMatricule = camionInfo?.matricule || 'N/A';

                      return (
                        <tr key={pneu._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pneu.reference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {camionMatricule}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {pneu.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(pneu.statut)}`}
                            >
                              {pneu.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {pneu.kmPose.toLocaleString()} / {pneu.kmMax.toLocaleString()} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUsureModal(pneu)}
                                disabled={calculatingUsure}
                                title="Détails de l'usure"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(pneu)}
                                title="Modifier"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {pneu.statut !== 'remplacé' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRemplacementModal(pneu)}
                                  className="text-orange-600 hover:text-orange-700"
                                  title="Remplacer"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(pneu._id)}
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                ? "Aucun pneu trouvé pour cette recherche"
                : "Aucun pneu. Cliquez sur 'Ajouter un pneu' pour commencer."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPneu ? "Modifier le pneu" : "Ajouter un pneu"}
            </DialogTitle>
            <DialogDescription>
              {editingPneu
                ? "Modifiez les informations du pneu ci-dessous."
                : "Remplissez les informations pour ajouter un nouveau pneu."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  required
                  minLength={3}
                  maxLength={50}
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Ex: MICHELIN-12345"
                />
                <p className="text-xs text-gray-500">
                  Entre 3 et 50 caractères
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="camion">Camion *</Label>
                <Select
                  value={formData.camion}
                  onValueChange={(value) =>
                    setFormData({ ...formData, camion: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un camion" />
                  </SelectTrigger>
                  <SelectContent>
                    {camions.map((camion) => (
                      <SelectItem key={camion._id} value={camion._id}>
                        {camion.matricule} {camion.marque && `- ${camion.marque}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, position: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, statut: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUTS.map((statut) => (
                        <SelectItem key={statut} value={statut}>
                          {statut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmPose">KM de pose *</Label>
                <Input
                  id="kmPose"
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.kmPose}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kmPose: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Ex: 50000"
                />
                <p className="text-xs text-gray-500">
                  Nombre entier positif
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmMax">KM maximum *</Label>
                <Input
                  id="kmMax"
                  type="number"
                  required
                  min="1000"
                  step="1"
                  value={formData.kmMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kmMax: parseInt(e.target.value) || 80000,
                    })
                  }
                  placeholder="Ex: 80000"
                />
                <p className="text-xs text-gray-500">
                  Minimum 1000 km, doit être supérieur au KM de pose
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prix">Prix (DH)</Label>
                <Input
                  id="prix"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prix || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prix: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 2500"
                />
                <p className="text-xs text-gray-500">
                  Prix positif (optionnel)
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

      {/* Modal Remplacement */}
      <Dialog open={isRemplacementModalOpen} onOpenChange={setIsRemplacementModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Remplacer le pneu</DialogTitle>
            <DialogDescription>
              Remplacer le pneu {pneuToReplace?.reference} à la position {pneuToReplace?.position}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRemplacement}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="remp-reference">Référence du nouveau pneu *</Label>
                <Input
                  id="remp-reference"
                  required
                  minLength={3}
                  maxLength={50}
                  value={remplacementData.reference}
                  onChange={(e) =>
                    setRemplacementData({ ...remplacementData, reference: e.target.value })
                  }
                  placeholder="Ex: MICHELIN-67890"
                />
                <p className="text-xs text-gray-500">
                  Entre 3 et 50 caractères
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remp-kmPose">KM de pose</Label>
                <Input
                  id="remp-kmPose"
                  type="number"
                  min="0"
                  step="1"
                  value={remplacementData.kmPose || ""}
                  onChange={(e) =>
                    setRemplacementData({
                      ...remplacementData,
                      kmPose: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="KM actuel du camion par défaut"
                />
                <p className="text-xs text-gray-500">
                  Nombre entier positif (optionnel)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remp-kmMax">KM maximum</Label>
                <Input
                  id="remp-kmMax"
                  type="number"
                  min="1000"
                  step="1"
                  value={remplacementData.kmMax || ""}
                  onChange={(e) =>
                    setRemplacementData({
                      ...remplacementData,
                      kmMax: e.target.value ? parseInt(e.target.value) : 80000,
                    })
                  }
                  placeholder="Ex: 80000"
                />
                <p className="text-xs text-gray-500">
                  Minimum 1000 km (défaut: 80000)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remp-prix">Prix (DH)</Label>
                <Input
                  id="remp-prix"
                  type="number"
                  min="0"
                  step="0.01"
                  value={remplacementData.prix || ""}
                  onChange={(e) =>
                    setRemplacementData({
                      ...remplacementData,
                      prix: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 2500"
                />
                <p className="text-xs text-gray-500">
                  Prix positif (optionnel)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRemplacementModalOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Remplacement..." : "Remplacer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Usure */}
      <Dialog open={isUsureModalOpen} onOpenChange={setIsUsureModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'usure</DialogTitle>
            <DialogDescription>
              Informations détaillées sur l'usure du pneu
            </DialogDescription>
          </DialogHeader>
          {pneuUsure && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>Référence</Label>
                <p className="text-sm font-medium">{pneuUsure.pneu.reference}</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>Position</Label>
                <p className="text-sm font-medium">{pneuUsure.pneu.position}</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>Camion</Label>
                <p className="text-sm font-medium">{pneuUsure.camion.matricule}</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>KM actuel</Label>
                <p className="text-sm font-medium">{pneuUsure.camion.kilometrageActuel.toLocaleString()} km</p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                  <Label>Pourcentage d'usure</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full transition-all ${
                            pneuUsure.usure.pourcentageUsure >= 100 ? "bg-red-600" :
                            pneuUsure.usure.pourcentageUsure >= 80 ? "bg-orange-500" :
                            pneuUsure.usure.pourcentageUsure >= 60 ? "bg-yellow-500" :
                            "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, pneuUsure.usure.pourcentageUsure)}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-sm font-medium w-16 text-right ${
                      pneuUsure.usure.pourcentageUsure >= 100 ? "text-red-600" :
                      pneuUsure.usure.pourcentageUsure >= 80 ? "text-orange-600" :
                      pneuUsure.usure.pourcentageUsure >= 60 ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {pneuUsure.usure.pourcentageUsure}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>KM parcouru</Label>
                <p className="text-sm font-medium">{pneuUsure.usure.kmParcouru.toLocaleString()} km</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>KM restant</Label>
                <p className="text-sm font-medium">{pneuUsure.usure.kmRestant.toLocaleString()} km</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>KM de pose</Label>
                <p className="text-sm font-medium">{pneuUsure.usure.kmPose.toLocaleString()} km</p>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>KM maximum</Label>
                <p className="text-sm font-medium">{pneuUsure.usure.kmMax.toLocaleString()} km</p>
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                <Label>Statut</Label>
                <p className="text-sm font-medium">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(pneuUsure.pneu.statut)}`}>
                    {pneuUsure.pneu.statut}
                  </span>
                </p>
              </div>

              {pneuUsure.alerte && (
                <Alert variant={pneuUsure.usure.pourcentageUsure >= 100 ? "destructive" : "default"}>
                  <AlertTitle>Alerte</AlertTitle>
                  <AlertDescription>{pneuUsure.alerte}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Ce pneu sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPneuToDelete(null)}>
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
}

