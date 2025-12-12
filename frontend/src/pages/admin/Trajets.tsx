import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
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
import {
  getTrajets,
  createTrajet,
  updateTrajet,
  deleteTrajet,
  updateStatut,
  getTrajetById,
  getTrajetPDF,
} from "@/services/trajet.service";
import { getCamions, type Camion } from "@/services/camion.service";
import { getRemorques, type Remorque } from "@/services/remorque.service";
import { getChauffeurs } from "@/services/user.service";

// Types locaux pour les données réelles du backend
type ChauffeurInfo = {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
};

type CamionInfo = {
  _id: string;
  matricule: string;
  marque?: string;
  modele?: string;
  kilometrage?: number;
};

type RemorqueInfo = {
  _id: string;
  matricule: string;
  type?: string;
  capacite?: number;
};

type TrajetBackend = {
  _id: string;
  chauffeur: string | ChauffeurInfo;
  camion: string | CamionInfo;
  remorque: string | RemorqueInfo;
  dateDepart: string;
  dateArrivee: string;
  lieuDepart: string;
  lieuArrivee: string;
  kmDepart?: number;
  kmArrivee?: number;
  gasoilConsomme?: number;
  statut: 'à faire' | 'en cours' | 'terminé' | 'annulé';
  remarques?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TrajetPayloadBackend = {
  chauffeur: string;
  camion: string;
  remorque?: string;
  dateDepart: string;
  dateArrivee: string;
  lieuDepart: string;
  lieuArrivee: string;
  kmDepart?: number;
  kmArrivee?: number;
  gasoilConsomme?: number;
  statut?: TrajetBackend['statut'];
  remarques?: string;
  description?: string;
};

const STATUTS = ['à faire', 'en cours', 'terminé', 'annulé'] as const;

export default function TrajetsPage() {
  const [trajets, setTrajets] = useState<TrajetBackend[]>([]);
  const [filteredTrajets, setFilteredTrajets] = useState<TrajetBackend[]>([]);
  const [camions, setCamions] = useState<Camion[]>([]);
  const [remorques, setRemorques] = useState<Remorque[]>([]);
  const [chauffeurs, setChauffeurs] = useState<ChauffeurInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [selectedChauffeur, setSelectedChauffeur] = useState<string>("all");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTrajet, setEditingTrajet] = useState<TrajetBackend | null>(null);
  const [selectedTrajet, setSelectedTrajet] = useState<TrajetBackend | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trajetToDelete, setTrajetToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<TrajetPayloadBackend>({
    chauffeur: "",
    camion: "",
    remorque: "",
    dateDepart: "",
    dateArrivee: "",
    lieuDepart: "",
    lieuArrivee: "",
    statut: "à faire",
    remarques: "",
    description: "",
  });

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
    filterTrajets();
  }, [searchTerm, selectedStatut, selectedChauffeur, dateDebut, dateFin, trajets]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trajetsData, camionsData, remorquesData, chauffeursData] = await Promise.all([
        getTrajets(),
        getCamions(),
        getRemorques(),
        getChauffeurs(),
      ]);
      
      const trajetsList = (trajetsData as any) || [];
      setTrajets(trajetsList);
      setFilteredTrajets(trajetsList);
      setCamions(camionsData || []);
      setRemorques(remorquesData || []);

      // Utiliser les chauffeurs récupérés depuis l'API
      const chauffeursList = (chauffeursData as any) || [];
      const chauffeursFormatted: ChauffeurInfo[] = chauffeursList.map((chauffeur: any) => ({
        _id: chauffeur.id || chauffeur._id,
        nom: chauffeur.nom,
        prenom: chauffeur.prenom,
        email: chauffeur.email,
      }));
      setChauffeurs(chauffeursFormatted);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setTrajets([]);
      setFilteredTrajets([]);
      setCamions([]);
      setRemorques([]);
      setChauffeurs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTrajets = () => {
    let filtered = [...trajets];

    // Filtre par statut
    if (selectedStatut !== "all") {
      filtered = filtered.filter((t) => t.statut === selectedStatut);
    }

    // Filtre par chauffeur
    if (selectedChauffeur !== "all") {
      filtered = filtered.filter((t) => {
        const chauffeurId = typeof t.chauffeur === 'string' ? t.chauffeur : t.chauffeur._id;
        return chauffeurId === selectedChauffeur;
      });
    }

    // Filtre par date
    if (dateDebut) {
      filtered = filtered.filter((t) => new Date(t.dateDepart) >= new Date(dateDebut));
    }
    if (dateFin) {
      filtered = filtered.filter((t) => new Date(t.dateDepart) <= new Date(dateFin + "T23:59:59"));
    }

    // Filtre par recherche (lieu départ/arrivée)
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.lieuDepart.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.lieuArrivee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof t.camion === 'object' && t.camion?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTrajets(filtered);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setEditingTrajet(null);
    setFormData({
      chauffeur: "",
      camion: "",
      remorque: "",
      dateDepart: "",
      dateArrivee: "",
      lieuDepart: "",
      lieuArrivee: "",
      statut: "à faire",
      remarques: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trajet: TrajetBackend) => {
    setEditingTrajet(trajet);
    const chauffeurId = typeof trajet.chauffeur === 'string' ? trajet.chauffeur : trajet.chauffeur._id;
    const camionId = typeof trajet.camion === 'string' ? trajet.camion : trajet.camion._id;
    const remorqueId = trajet.remorque 
      ? (typeof trajet.remorque === 'string' ? trajet.remorque : trajet.remorque._id)
      : "";

    const formatDateTimeLocal = (isoDate: string) => {
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData({
      chauffeur: chauffeurId,
      camion: camionId,
      remorque: remorqueId,
      dateDepart: formatDateTimeLocal(trajet.dateDepart),
      dateArrivee: formatDateTimeLocal(trajet.dateArrivee),
      lieuDepart: trajet.lieuDepart,
      lieuArrivee: trajet.lieuArrivee,
      kmDepart: trajet.kmDepart,
      kmArrivee: trajet.kmArrivee,
      gasoilConsomme: trajet.gasoilConsomme,
      statut: trajet.statut,
      remarques: trajet.remarques || "",
      description: trajet.description || "",
    });
    setIsModalOpen(true);
  };

  const openDetailModal = async (trajet: TrajetBackend) => {
    try {
      // Récupérer les détails complets
      const fullTrajet = await getTrajetById(trajet._id);
      setSelectedTrajet(fullTrajet as any);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      setSelectedTrajet(trajet);
      setIsDetailModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: dateArrivee doit être postérieure à dateDepart
    if (new Date(formData.dateArrivee) <= new Date(formData.dateDepart)) {
      toast.error("La date d'arrivée doit être postérieure à la date de départ", {
        duration: 5000,
      });
      return;
    }
    
    // Validation: kmArrivee doit être >= kmDepart si les deux sont fournis
    if (formData.kmDepart !== undefined && formData.kmArrivee !== undefined) {
      if (formData.kmArrivee < formData.kmDepart) {
        toast.error("Le kilométrage d'arrivée doit être supérieur ou égal au kilométrage de départ", {
          duration: 5000,
        });
        return;
      }
    }
    
    setSubmitting(true);

    try {
      const payload: any = {
        ...formData,
        dateDepart: new Date(formData.dateDepart).toISOString(),
        dateArrivee: new Date(formData.dateArrivee).toISOString(),
      };
      
      // Ne pas envoyer remorque si elle est vide
      if (!payload.remorque || payload.remorque === "") {
        delete payload.remorque;
      }

      if (editingTrajet) {
        await updateTrajet(editingTrajet._id, payload as any);
        toast.success("Trajet modifié avec succès");
      } else {
        await createTrajet(payload as any);
        toast.success("Trajet ajouté avec succès");
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

  const handleDeleteClick = (id: string) => {
    setTrajetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!trajetToDelete) return;

    try {
      await deleteTrajet(trajetToDelete);
      toast.success("Trajet supprimé avec succès");
      setDeleteDialogOpen(false);
      setTrajetToDelete(null);
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const handleUpdateStatut = async (id: string, newStatut: TrajetBackend['statut']) => {
    try {
      await updateStatut(id, { statut: newStatut as any });
      toast.success("Statut mis à jour avec succès");
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const blob = await getTrajetPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordre_mission_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF téléchargé avec succès");
    } catch (error: any) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const getStatutColor = (statut: string): string => {
    switch (statut) {
      case "à faire":
        return "bg-blue-100 text-blue-800";
      case "en cours":
        return "bg-yellow-100 text-yellow-800";
      case "terminé":
        return "bg-green-100 text-green-800";
      case "annulé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredTrajets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrajets = filteredTrajets.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Trajets</h1>
        <p className="text-gray-600 mt-1">
          {filteredTrajets.length} trajet(s) au total
        </p>
      </div>

 
        <CardHeader>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un trajet
            </Button>
            <div className="flex-1">
              <Input
                placeholder="Rechercher par lieu, camion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="sm:w-48">
              <Select value={selectedStatut} onValueChange={setSelectedStatut}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {STATUTS.map((statut) => (
                    <SelectItem key={statut} value={statut}>
                      {statut}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Select value={selectedChauffeur} onValueChange={setSelectedChauffeur}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les chauffeurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les chauffeurs</SelectItem>
                  {chauffeurs.length > 0 ? (
                    chauffeurs.map((chauffeur) => (
                      <SelectItem key={chauffeur._id} value={chauffeur._id}>
                        {chauffeur.prenom} {chauffeur.nom}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-chauffeurs" disabled>Aucun chauffeur disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                placeholder="Date début"
              />
            </div>
            <div className="sm:w-48">
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                placeholder="Date fin"
              />
            </div>
            {(selectedStatut !== "all" || selectedChauffeur !== "all" || dateDebut || dateFin || searchTerm) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatut("all");
                  setSelectedChauffeur("all");
                  setDateDebut("");
                  setDateFin("");
                  setSearchTerm("");
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : currentTrajets.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date départ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chauffeur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Camion / Remorque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trajet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTrajets.map((trajet) => {
                      const chauffeurInfo = typeof trajet.chauffeur === 'object' ? trajet.chauffeur : null;
                      const camionInfo = typeof trajet.camion === 'object' ? trajet.camion : null;
                      const remorqueInfo = typeof trajet.remorque === 'object' ? trajet.remorque : null;

                      return (
                        <tr key={trajet._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(trajet.dateDepart)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {chauffeurInfo ? `${chauffeurInfo.prenom} ${chauffeurInfo.nom}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>
                              <div className="font-medium">{camionInfo?.matricule || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{remorqueInfo?.matricule || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>
                              <div className="font-medium">{trajet.lieuDepart}</div>
                              <div className="text-xs">→ {trajet.lieuArrivee}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(trajet.statut)}`}>
                              {trajet.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetailModal(trajet)}
                                title="Détails"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(trajet)}
                                title="Modifier"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF(trajet._id)}
                                title="Télécharger PDF"
                              >
                                PDF
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(trajet._id)}
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
              {searchTerm || selectedStatut !== "all" || selectedChauffeur !== "all" || dateDebut || dateFin
                ? "Aucun trajet trouvé pour ces filtres"
                : "Aucun trajet. Cliquez sur 'Nouveau trajet' pour commencer."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTrajet ? "Modifier le trajet" : "Nouveau trajet"}
            </DialogTitle>
            <DialogDescription>
              {editingTrajet
                ? "Modifiez les informations du trajet ci-dessous."
                : "Remplissez les informations pour créer un nouveau trajet."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chauffeur">Chauffeur *</Label>
                  <Select
                    value={formData.chauffeur}
                    onValueChange={(value) => setFormData({ ...formData, chauffeur: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un chauffeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {chauffeurs.length > 0 ? (
                        chauffeurs.map((chauffeur) => (
                          <SelectItem key={chauffeur._id} value={chauffeur._id}>
                            {chauffeur.prenom} {chauffeur.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-chauffeurs" disabled>Aucun chauffeur disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="camion">Camion *</Label>
                  <Select
                    value={formData.camion}
                    onValueChange={(value) => setFormData({ ...formData, camion: value })}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="remorque">Remorque (optionnel)</Label>
                <Select
                  value={formData.remorque || "none"}
                  onValueChange={(value) => setFormData({ ...formData, remorque: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une remorque (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune remorque</SelectItem>
                    {remorques.map((remorque) => (
                      <SelectItem key={remorque._id} value={remorque._id}>
                        {remorque.matricule} {remorque.type && `- ${remorque.type}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDepart">Date de départ *</Label>
                  <Input
                    id="dateDepart"
                    type="datetime-local"
                    required
                    value={formData.dateDepart}
                    onChange={(e) => setFormData({ ...formData, dateDepart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateArrivee">Date d'arrivée *</Label>
                  <Input
                    id="dateArrivee"
                    type="datetime-local"
                    required
                    value={formData.dateArrivee}
                    onChange={(e) => setFormData({ ...formData, dateArrivee: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lieuDepart">Lieu de départ *</Label>
                  <Input
                    id="lieuDepart"
                    required
                    minLength={2}
                    maxLength={200}
                    value={formData.lieuDepart}
                    onChange={(e) => setFormData({ ...formData, lieuDepart: e.target.value })}
                    placeholder="Ex: Casablanca"
                  />
                  <p className="text-xs text-gray-500">
                    Entre 2 et 200 caractères
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lieuArrivee">Lieu d'arrivée *</Label>
                  <Input
                    id="lieuArrivee"
                    required
                    minLength={2}
                    maxLength={200}
                    value={formData.lieuArrivee}
                    onChange={(e) => setFormData({ ...formData, lieuArrivee: e.target.value })}
                    placeholder="Ex: Rabat"
                  />
                  <p className="text-xs text-gray-500">
                    Entre 2 et 200 caractères
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kmDepart">KM départ</Label>
                  <Input
                    id="kmDepart"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.kmDepart || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kmDepart: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Nombre entier positif (optionnel)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kmArrivee">KM arrivée</Label>
                  <Input
                    id="kmArrivee"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.kmArrivee || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kmArrivee: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Doit être ≥ KM départ (optionnel)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gasoilConsomme">Gasoil consommé (L)</Label>
                  <Input
                    id="gasoilConsomme"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.gasoilConsomme || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gasoilConsomme: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Nombre positif (optionnel)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={formData.statut}
                  onValueChange={(value: any) => setFormData({ ...formData, statut: value })}
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
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  maxLength={1000}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du trajet..."
                />
                <p className="text-xs text-gray-500">
                  Maximum 1000 caractères
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarques">Remarques</Label>
                <Input
                  id="remarques"
                  maxLength={500}
                  value={formData.remarques || ""}
                  onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
                  placeholder="Remarques..."
                />
                <p className="text-xs text-gray-500">
                  Maximum 500 caractères
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

      {/* Modal Détails */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du trajet</DialogTitle>
            <DialogDescription>
              Informations complètes sur le trajet
            </DialogDescription>
          </DialogHeader>
          {selectedTrajet && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Chauffeur</Label>
                  <p className="text-sm font-medium">
                    {typeof selectedTrajet.chauffeur === 'object'
                      ? `${selectedTrajet.chauffeur.prenom} ${selectedTrajet.chauffeur.nom}`
                      : 'N/A'}
                  </p>
                  {typeof selectedTrajet.chauffeur === 'object' && (
                    <p className="text-xs text-gray-500">{selectedTrajet.chauffeur.email}</p>
                  )}
                </div>
                <div>
                  <Label>Statut</Label>
                  <p className="text-sm font-medium">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(selectedTrajet.statut)}`}>
                      {selectedTrajet.statut}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Camion</Label>
                  <p className="text-sm font-medium">
                    {typeof selectedTrajet.camion === 'object'
                      ? `${selectedTrajet.camion.matricule} ${selectedTrajet.camion.marque ? `- ${selectedTrajet.camion.marque}` : ''}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>Remorque</Label>
                  <p className="text-sm font-medium">
                    {typeof selectedTrajet.remorque === 'object'
                      ? `${selectedTrajet.remorque.matricule} ${selectedTrajet.remorque.type ? `- ${selectedTrajet.remorque.type}` : ''}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de départ</Label>
                  <p className="text-sm font-medium">{formatDate(selectedTrajet.dateDepart)}</p>
                </div>
                <div>
                  <Label>Date d'arrivée</Label>
                  <p className="text-sm font-medium">{formatDate(selectedTrajet.dateArrivee)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lieu de départ</Label>
                  <p className="text-sm font-medium">{selectedTrajet.lieuDepart}</p>
                </div>
                <div>
                  <Label>Lieu d'arrivée</Label>
                  <p className="text-sm font-medium">{selectedTrajet.lieuArrivee}</p>
                </div>
              </div>

              {(selectedTrajet.kmDepart || selectedTrajet.kmArrivee || selectedTrajet.gasoilConsomme) && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedTrajet.kmDepart && (
                    <div>
                      <Label>KM départ</Label>
                      <p className="text-sm font-medium">{selectedTrajet.kmDepart.toLocaleString()} km</p>
                    </div>
                  )}
                  {selectedTrajet.kmArrivee && (
                    <div>
                      <Label>KM arrivée</Label>
                      <p className="text-sm font-medium">{selectedTrajet.kmArrivee.toLocaleString()} km</p>
                    </div>
                  )}
                  {selectedTrajet.gasoilConsomme && (
                    <div>
                      <Label>Gasoil consommé</Label>
                      <p className="text-sm font-medium">{selectedTrajet.gasoilConsomme.toLocaleString()} L</p>
                    </div>
                  )}
                </div>
              )}

              {selectedTrajet.kmDepart && selectedTrajet.kmArrivee && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Distance parcourue</Label>
                    <p className="text-sm font-medium">
                      {(selectedTrajet.kmArrivee - selectedTrajet.kmDepart).toLocaleString()} km
                    </p>
                  </div>
                  {selectedTrajet.gasoilConsomme && (
                    <div>
                      <Label>Consommation moyenne</Label>
                      <p className="text-sm font-medium">
                        {((selectedTrajet.gasoilConsomme / (selectedTrajet.kmArrivee - selectedTrajet.kmDepart)) * 100).toFixed(2)} L/100km
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedTrajet.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedTrajet.description}</p>
                </div>
              )}

              {selectedTrajet.remarques && (
                <div>
                  <Label>Remarques</Label>
                  <p className="text-sm text-gray-600">{selectedTrajet.remarques}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedTrajet.statut !== 'terminé' && selectedTrajet.statut !== 'annulé') {
                      const nextStatut = selectedTrajet.statut === 'à faire' ? 'en cours' : 'terminé';
                      handleUpdateStatut(selectedTrajet._id, nextStatut);
                      setIsDetailModalOpen(false);
                    }
                  }}
                  disabled={selectedTrajet.statut === 'terminé' || selectedTrajet.statut === 'annulé'}
                >
                  {selectedTrajet.statut === 'à faire' ? 'Démarrer' : selectedTrajet.statut === 'en cours' ? 'Terminer' : ''}
                </Button>
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedTrajet._id)}>
                  Télécharger PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsDetailModalOpen(false);
                  openEditModal(selectedTrajet);
                }}>
                  Modifier
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailModalOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Ce trajet sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTrajetToDelete(null)}>
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

