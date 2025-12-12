import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Download } from "lucide-react";
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
  updateStatut,
  getTrajetById,
  getTrajetPDF,
  updateKmEtGasoil,
} from "@/services/trajet.service";

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
  remorque?: string | RemorqueInfo;
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

const STATUTS = ['à faire', 'en cours', 'terminé', 'annulé'] as const;

export default function ChauffeurTrajets() {
  const [trajets, setTrajets] = useState<TrajetBackend[]>([]);
  const [filteredTrajets, setFilteredTrajets] = useState<TrajetBackend[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isKmGasoilModalOpen, setIsKmGasoilModalOpen] = useState(false);
  const [selectedTrajet, setSelectedTrajet] = useState<TrajetBackend | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [kmGasoilForm, setKmGasoilForm] = useState({
    kmDepart: "",
    kmArrivee: "",
    gasoilConsomme: "",
  });

  // Fonction pour extraire le message d'erreur
  const getErrorMessage = (error: any): string => {
    if (!error) return "Une erreur est survenue";
    
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.join(", ");
      }
      if (typeof errors === "object") {
        return Object.values(errors).flat().join(", ");
      }
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
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
  }, [searchTerm, selectedStatut, dateDebut, dateFin, trajets]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const trajetsData = await getTrajets();
      const trajetsList = (trajetsData as any) || [];
      setTrajets(trajetsList);
      setFilteredTrajets(trajetsList);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setTrajets([]);
      setFilteredTrajets([]);
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

  const openDetailModal = async (trajet: TrajetBackend) => {
    try {
      const fullTrajet = await getTrajetById(trajet._id);
      setSelectedTrajet(fullTrajet as any);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      setSelectedTrajet(trajet);
      setIsDetailModalOpen(true);
    }
  };

  const openKmGasoilModal = (trajet: TrajetBackend) => {
    setSelectedTrajet(trajet);
    setKmGasoilForm({
      kmDepart: trajet.kmDepart?.toString() || "",
      kmArrivee: trajet.kmArrivee?.toString() || "",
      gasoilConsomme: trajet.gasoilConsomme?.toString() || "",
    });
    setIsKmGasoilModalOpen(true);
  };

  const handleUpdateKmGasoil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrajet) return;

    // Validation: kmArrivee doit être >= kmDepart si les deux sont fournis
    const kmDepartValue = kmGasoilForm.kmDepart ? parseInt(kmGasoilForm.kmDepart) : selectedTrajet.kmDepart;
    const kmArriveeValue = kmGasoilForm.kmArrivee ? parseInt(kmGasoilForm.kmArrivee) : undefined;

    if (kmDepartValue !== undefined && kmArriveeValue !== undefined) {
      if (kmArriveeValue < kmDepartValue) {
        toast.error("Le kilométrage d'arrivée doit être supérieur ou égal au kilométrage de départ", {
          duration: 5000,
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload: any = {};
      
      if (kmGasoilForm.kmDepart) {
        payload.kmDepart = parseInt(kmGasoilForm.kmDepart);
      }
      if (kmGasoilForm.kmArrivee) {
        payload.kmArrivee = parseInt(kmGasoilForm.kmArrivee);
      }
      if (kmGasoilForm.gasoilConsomme) {
        payload.gasoilConsomme = parseFloat(kmGasoilForm.gasoilConsomme);
      }

      await updateKmEtGasoil(selectedTrajet._id, payload);
      toast.success("Kilomètres et gasoil mis à jour avec succès");
      setIsKmGasoilModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatut = async (id: string, newStatut: TrajetBackend['statut']) => {
    try {
      await updateStatut(id, { statut: newStatut as any });
      toast.success("Statut mis à jour avec succès");
      fetchData();
      setIsDetailModalOpen(false);
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
        return "bg-green-100 text-green-800";
      case "terminé":
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Trajets</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          {filteredTrajets.length} trajet(s) au total
        </p>
      </div>

        <CardHeader>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
            {(selectedStatut !== "all" || dateDebut || dateFin || searchTerm) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatut("all");
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
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date départ
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Camion / Remorque
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trajet
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTrajets.map((trajet) => {
                      const camionInfo = typeof trajet.camion === 'object' ? trajet.camion : null;
                      const remorqueInfo = typeof trajet.remorque === 'object' ? trajet.remorque : null;

                      return (
                        <tr key={trajet._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {formatDate(trajet.dateDepart)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                            <div>
                              <div className="font-medium">{camionInfo?.matricule || 'N/A'}</div>
                              {remorqueInfo && (
                                <div className="text-xs text-gray-500">{remorqueInfo.matricule}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                            <div>
                              <div className="font-medium">{trajet.lieuDepart}</div>
                              <div className="text-xs">→ {trajet.lieuArrivee}</div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(trajet.statut)}`}>
                              {trajet.statut}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                            <div className="flex justify-center gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetailModal(trajet)}
                                title="Détails"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF(trajet._id)}
                                title="Télécharger PDF"
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
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
              {searchTerm || selectedStatut !== "all" || dateDebut || dateFin
                ? "Aucun trajet trouvé pour ces filtres"
                : "Aucun trajet assigné pour le moment"}
            </div>
          )}
        </CardContent>
      </Card>

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
                  <Label>Statut</Label>
                  <p className="text-sm font-medium">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(selectedTrajet.statut)}`}>
                      {selectedTrajet.statut}
                    </span>
                  </p>
                </div>
                <div>
                  <Label>Camion</Label>
                  <p className="text-sm font-medium">
                    {typeof selectedTrajet.camion === 'object'
                      ? `${selectedTrajet.camion.matricule} ${selectedTrajet.camion.marque ? `- ${selectedTrajet.camion.marque}` : ''}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {typeof selectedTrajet.remorque === 'object' && selectedTrajet.remorque && (
                <div>
                  <Label>Remorque</Label>
                  <p className="text-sm font-medium">
                    {selectedTrajet.remorque.matricule} {selectedTrajet.remorque.type ? `- ${selectedTrajet.remorque.type}` : ''}
                  </p>
                </div>
              )}

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

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                {selectedTrajet.statut !== 'terminé' && selectedTrajet.statut !== 'annulé' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextStatut = selectedTrajet.statut === 'à faire' ? 'en cours' : 'terminé';
                      handleUpdateStatut(selectedTrajet._id, nextStatut);
                    }}
                  >
                    {selectedTrajet.statut === 'à faire' ? 'Démarrer le trajet' : 'Terminer le trajet'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openKmGasoilModal(selectedTrajet);
                  }}
                >
                  Mettre à jour KM/Gasoil
                </Button>
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedTrajet._id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailModalOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal KM/Gasoil */}
      <Dialog open={isKmGasoilModalOpen} onOpenChange={setIsKmGasoilModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mettre à jour KM et Gasoil</DialogTitle>
            <DialogDescription>
              Mettez à jour les kilomètres et le gasoil consommé pour ce trajet
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateKmGasoil}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="kmDepart">KM départ</Label>
                <Input
                  id="kmDepart"
                  type="number"
                  min="0"
                  step="1"
                  value={kmGasoilForm.kmDepart}
                  onChange={(e) => setKmGasoilForm({ ...kmGasoilForm, kmDepart: e.target.value })}
                  placeholder={selectedTrajet?.kmDepart?.toString() || "Non renseigné"}
                />
                <p className="text-xs text-gray-500">
                  Laissez vide pour conserver la valeur actuelle
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmArrivee">KM arrivée</Label>
                <Input
                  id="kmArrivee"
                  type="number"
                  min="0"
                  step="1"
                  value={kmGasoilForm.kmArrivee}
                  onChange={(e) => setKmGasoilForm({ ...kmGasoilForm, kmArrivee: e.target.value })}
                  placeholder={selectedTrajet?.kmArrivee?.toString() || "Non renseigné"}
                />
                <p className="text-xs text-gray-500">
                  Doit être ≥ KM départ
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasoilConsomme">Gasoil consommé (L)</Label>
                <Input
                  id="gasoilConsomme"
                  type="number"
                  min="0"
                  step="0.01"
                  value={kmGasoilForm.gasoilConsomme}
                  onChange={(e) => setKmGasoilForm({ ...kmGasoilForm, gasoilConsomme: e.target.value })}
                  placeholder={selectedTrajet?.gasoilConsomme?.toString() || "Non renseigné"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsKmGasoilModalOpen(false)}
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

