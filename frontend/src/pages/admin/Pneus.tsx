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
  const itemsPerPage = 10;

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
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
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
    } catch (error) {
      console.error("Erreur lors du calcul de l'usure:", error);
      alert("Erreur lors du calcul de l'usure");
    } finally {
      setCalculatingUsure(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPneu) {
        await updatePneu(editingPneu._id, formData as any);
      } else {
        await createPneu(formData as any);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      const message = error.response?.data?.message || "Erreur lors de la sauvegarde du pneu";
      alert(message);
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
      setIsRemplacementModalOpen(false);
      setPneuToReplace(null);
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors du remplacement:", error);
      const message = error.response?.data?.message || "Erreur lors du remplacement du pneu";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pneu ?")) {
      return;
    }

    try {
      await deletePneu(id);
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du pneu");
    }
  };

  const getUsurePercentage = (pneu: PneuBackend): number => {
    if (typeof pneu.camion === 'object' && pneu.camion.kilometrage) {
      const kmActuel = pneu.camion.kilometrage;
      const kmParcouru = kmActuel - pneu.kmPose;
      const kmTotal = pneu.kmMax - pneu.kmPose;
      if (kmTotal > 0) {
        return Math.min(100, Math.round((kmParcouru / kmTotal) * 100));
      }
    }
    return 0;
  };

  const getUsureColor = (percentage: number): string => {
    if (percentage >= 100) return "bg-red-600";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Pneus</h1>
          <p className="text-gray-600 mt-1">
            {filteredPneus.length} pneu(s) au total
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <span className="mr-2">+</span> Ajouter un pneu
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rechercher et Filtrer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Rechercher par référence ou matricule camion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:w-64">
              <Label htmlFor="camion-filter">Filtrer par camion</Label>
              <Select
                value={selectedCamion}
                onValueChange={(value) => {
                  setSelectedCamion(value);
                }}
              >
                <SelectTrigger className="mt-1">
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
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCamion("all");
                    setSearchTerm("");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                        Usure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KM Pose / Max
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPneus.map((pneu) => {
                      const usurePercentage = getUsurePercentage(pneu);
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
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getUsureColor(usurePercentage)}`}
                                  style={{ width: `${Math.min(100, usurePercentage)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12">
                                {usurePercentage}%
                              </span>
                            </div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUsureModal(pneu)}
                                disabled={calculatingUsure}
                              >
                                Usure
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(pneu)}
                              >
                                Modifier
                              </Button>
                              {pneu.statut !== 'remplacé' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRemplacementModal(pneu)}
                                  className="text-orange-600 hover:text-orange-700"
                                >
                                  Remplacer
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(pneu._id)}
                              >
                                Supprimer
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
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Ex: MICHELIN-12345"
                />
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
                <Label htmlFor="kmPose">KM de pose *</Label>
                <Input
                  id="kmPose"
                  type="number"
                  required
                  min="0"
                  value={formData.kmPose}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kmPose: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Ex: 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmMax">KM maximum *</Label>
                <Input
                  id="kmMax"
                  type="number"
                  required
                  min="1000"
                  value={formData.kmMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kmMax: parseInt(e.target.value) || 80000,
                    })
                  }
                  placeholder="Ex: 80000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prix">Prix (DH)</Label>
                <Input
                  id="prix"
                  type="number"
                  min="0"
                  value={formData.prix || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prix: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 2500"
                />
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
                  value={remplacementData.reference}
                  onChange={(e) =>
                    setRemplacementData({ ...remplacementData, reference: e.target.value })
                  }
                  placeholder="Ex: MICHELIN-67890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remp-kmPose">KM de pose</Label>
                <Input
                  id="remp-kmPose"
                  type="number"
                  min="0"
                  value={remplacementData.kmPose || ""}
                  onChange={(e) =>
                    setRemplacementData({
                      ...remplacementData,
                      kmPose: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="KM actuel du camion par défaut"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remp-kmMax">KM maximum</Label>
                <Input
                  id="remp-kmMax"
                  type="number"
                  min="1000"
                  value={remplacementData.kmMax || ""}
                  onChange={(e) =>
                    setRemplacementData({
                      ...remplacementData,
                      kmMax: e.target.value ? parseInt(e.target.value) : 80000,
                    })
                  }
                  placeholder="Ex: 80000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remp-prix">Prix (DH)</Label>
                <Input
                  id="remp-prix"
                  type="number"
                  min="0"
                  value={remplacementData.prix || ""}
                  onChange={(e) =>
                    setRemplacementData({
                      ...remplacementData,
                      prix: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 2500"
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Référence</Label>
                  <p className="text-sm font-medium">{pneuUsure.pneu.reference}</p>
                </div>
                <div>
                  <Label>Position</Label>
                  <p className="text-sm font-medium">{pneuUsure.pneu.position}</p>
                </div>
                <div>
                  <Label>Camion</Label>
                  <p className="text-sm font-medium">{pneuUsure.camion.matricule}</p>
                </div>
                <div>
                  <Label>KM actuel</Label>
                  <p className="text-sm font-medium">{pneuUsure.camion.kilometrageActuel.toLocaleString()} km</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pourcentage d'usure</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${getUsureColor(pneuUsure.usure.pourcentageUsure)}`}
                      style={{ width: `${Math.min(100, pneuUsure.usure.pourcentageUsure)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {pneuUsure.usure.pourcentageUsure}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>KM parcouru</Label>
                  <p className="text-sm font-medium">{pneuUsure.usure.kmParcouru.toLocaleString()} km</p>
                </div>
                <div>
                  <Label>KM restant</Label>
                  <p className="text-sm font-medium">{pneuUsure.usure.kmRestant.toLocaleString()} km</p>
                </div>
                <div>
                  <Label>KM de pose</Label>
                  <p className="text-sm font-medium">{pneuUsure.usure.kmPose.toLocaleString()} km</p>
                </div>
                <div>
                  <Label>KM maximum</Label>
                  <p className="text-sm font-medium">{pneuUsure.usure.kmMax.toLocaleString()} km</p>
                </div>
              </div>

              {pneuUsure.alerte && (
                <Alert variant={pneuUsure.usure.pourcentageUsure >= 100 ? "destructive" : "default"}>
                  <AlertTitle>Alerte</AlertTitle>
                  <AlertDescription>{pneuUsure.alerte}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label>Statut</Label>
                <p className="text-sm font-medium">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(pneuUsure.pneu.statut)}`}>
                    {pneuUsure.pneu.statut}
                  </span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsUsureModalOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

