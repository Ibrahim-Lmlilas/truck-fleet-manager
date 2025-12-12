import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, CheckCircle2 } from "lucide-react";
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
  getMaintenances,
  planifierMaintenance,
  updateMaintenance,
  deleteMaintenance,
  marquerCommeEffectuee,
  getMaintenancesAlertes,
} from "@/services/maintenance.service";
import { getCamions, type Camion } from "@/services/camion.service";

// Types locaux pour les données réelles du backend
type VehiculeInfo = {
  _id: string;
  matricule: string;
  marque?: string;
  modele?: string;
  kilometrage?: number;
  derniereMaintenanceKm?: number;
};

type MaintenanceBackend = {
  _id: string;
  type: 'vidange' | 'révision' | 'pneus' | 'freins' | 'autre';
  vehicule: string | VehiculeInfo;
  datePrevu: string;
  dateFait?: string;
  kmMaintenance?: number;
  cout?: number;
  statut: 'planifiée' | 'en cours' | 'effectuée' | 'reportée';
  remarques?: string;
  prochainKm?: number;
  createdAt?: string;
  updatedAt?: string;
};

type MaintenanceAlerte = {
  id: string;
  type: string;
  vehicule: string;
  datePrevu: string;
  prochainKm?: number;
  kmActuel?: number;
  statut: string;
  alerte: string;
  priorite: 'critique' | 'haute' | 'moyenne' | 'normale';
};

type MaintenancePayloadBackend = {
  vehicule: string;
  type: MaintenanceBackend['type'];
  datePrevu: string;
  kmMaintenance?: number;
  prochainKm?: number;
  cout?: number;
  remarques?: string;
  statut?: MaintenanceBackend['statut'];
};

type MarquerEffectueePayload = {
  dateFait?: string;
  kmMaintenance?: number;
  cout?: number;
  remarques?: string;
  prochainKm?: number;
};

const TYPES = ['vidange', 'révision', 'pneus', 'freins', 'autre'] as const;
const STATUTS = ['planifiée', 'en cours', 'effectuée', 'reportée'] as const;

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState<MaintenanceBackend[]>([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState<MaintenanceBackend[]>([]);
  const [alertes, setAlertes] = useState<MaintenanceAlerte[]>([]);
  const [camions, setCamions] = useState<Camion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedVehicule, setSelectedVehicule] = useState<string>("all");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [showAlertesOnly, setShowAlertesOnly] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEffectueeModalOpen, setIsEffectueeModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceBackend | null>(null);
  const [maintenanceToMark, setMaintenanceToMark] = useState<MaintenanceBackend | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null);

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

  const [formData, setFormData] = useState<MaintenancePayloadBackend>({
    vehicule: "",
    type: "vidange",
    datePrevu: "",
    kmMaintenance: undefined,
    prochainKm: undefined,
    cout: undefined,
    remarques: "",
    statut: "planifiée",
  });

  const [effectueeData, setEffectueeData] = useState<MarquerEffectueePayload>({
    dateFait: "",
    kmMaintenance: undefined,
    cout: undefined,
    remarques: "",
    prochainKm: undefined,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMaintenances();
  }, [searchTerm, selectedStatut, selectedType, selectedVehicule, dateDebut, dateFin, showAlertesOnly, maintenances, alertes]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintenancesData, camionsData, alertesData] = await Promise.all([
        getMaintenances(),
        getCamions(),
        getMaintenancesAlertes(),
      ]);
      
      const maintenancesList = (maintenancesData as any) || [];
      setMaintenances(maintenancesList);
      setFilteredMaintenances(maintenancesList);
      setCamions(camionsData || []);
      setAlertes((alertesData as any) || []);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setMaintenances([]);
      setFilteredMaintenances([]);
      setCamions([]);
      setAlertes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMaintenances = () => {
    let filtered = [...maintenances];

    // Si on affiche seulement les alertes
    if (showAlertesOnly) {
      const alerteIds = new Set(alertes.map(a => a.id));
      filtered = filtered.filter(m => alerteIds.has(m._id));
    }

    // Filtre par statut
    if (selectedStatut !== "all") {
      filtered = filtered.filter((m) => m.statut === selectedStatut);
    }

    // Filtre par type
    if (selectedType !== "all") {
      filtered = filtered.filter((m) => m.type === selectedType);
    }

    // Filtre par véhicule
    if (selectedVehicule !== "all") {
      filtered = filtered.filter((m) => {
        const vehiculeId = typeof m.vehicule === 'string' ? m.vehicule : m.vehicule._id;
        return vehiculeId === selectedVehicule;
      });
    }

    // Filtre par date
    if (dateDebut) {
      filtered = filtered.filter((m) => new Date(m.datePrevu) >= new Date(dateDebut));
    }
    if (dateFin) {
      filtered = filtered.filter((m) => new Date(m.datePrevu) <= new Date(dateFin + "T23:59:59"));
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof m.vehicule === 'object' && m.vehicule?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredMaintenances(filtered);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setEditingMaintenance(null);
    setFormData({
      vehicule: "",
      type: "vidange",
      datePrevu: "",
      kmMaintenance: undefined,
      prochainKm: undefined,
      cout: undefined,
      remarques: "",
      statut: "planifiée",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (maintenance: MaintenanceBackend) => {
    setEditingMaintenance(maintenance);
    const vehiculeId = typeof maintenance.vehicule === 'string' ? maintenance.vehicule : maintenance.vehicule._id;

    // Convertir la date en format datetime-local
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
      vehicule: vehiculeId,
      type: maintenance.type,
      datePrevu: formatDateTimeLocal(maintenance.datePrevu),
      kmMaintenance: maintenance.kmMaintenance,
      prochainKm: maintenance.prochainKm,
      cout: maintenance.cout,
      remarques: maintenance.remarques || "",
      statut: maintenance.statut,
    });
    setIsModalOpen(true);
  };

  const openEffectueeModal = (maintenance: MaintenanceBackend) => {
    setMaintenanceToMark(maintenance);
    const vehiculeInfo = typeof maintenance.vehicule === 'object' ? maintenance.vehicule : null;
    
    setEffectueeData({
      dateFait: new Date().toISOString().slice(0, 16),
      kmMaintenance: vehiculeInfo?.kilometrage || maintenance.kmMaintenance,
      cout: maintenance.cout,
      remarques: maintenance.remarques || "",
      prochainKm: maintenance.prochainKm,
    });
    setIsEffectueeModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: prochainKm doit être > kmMaintenance si les deux sont fournis
    if (formData.kmMaintenance !== undefined && formData.prochainKm !== undefined) {
      if (formData.prochainKm <= formData.kmMaintenance) {
        toast.error("Le prochain KM doit être supérieur au KM de maintenance", {
          duration: 5000,
        });
        return;
      }
    }
    
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        datePrevu: new Date(formData.datePrevu).toISOString(),
      };

      if (editingMaintenance) {
        await updateMaintenance(editingMaintenance._id, payload as any);
        toast.success("Maintenance modifiée avec succès");
      } else {
        await planifierMaintenance(payload as any);
        toast.success("Maintenance planifiée avec succès");
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

  const handleMarquerEffectuee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceToMark) return;

    setSubmitting(true);

    try {
      const payload = {
        ...effectueeData,
        dateFait: effectueeData.dateFait ? new Date(effectueeData.dateFait).toISOString() : undefined,
      };
      await marquerCommeEffectuee(maintenanceToMark._id, payload as any);
      toast.success("Maintenance marquée comme effectuée avec succès");
      setIsEffectueeModalOpen(false);
      setMaintenanceToMark(null);
      fetchData();
    } catch (error: any) {
      console.error("Erreur lors du marquage:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setMaintenanceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!maintenanceToDelete) return;

    try {
      await deleteMaintenance(maintenanceToDelete);
      toast.success("Maintenance supprimée avec succès");
      setDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
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
      case "planifiée":
        return "bg-blue-100 text-blue-800";
      case "en cours":
        return "bg-yellow-100 text-yellow-800";
      case "effectuée":
        return "bg-green-100 text-green-800";
      case "reportée":
        return "bg-orange-100 text-orange-800";
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
    });
  };

  const getJoursRestants = (datePrevu: string): number => {
    const date = new Date(datePrevu);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - aujourdhui.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Pagination
  const totalPages = Math.ceil(filteredMaintenances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaintenances = filteredMaintenances.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Maintenances</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {filteredMaintenances.length} maintenance(s) au total
          {alertes.length > 0 && (
            <span className="ml-2 text-red-600 font-semibold">
              • {alertes.length} alerte(s)
            </span>
          )}
        </p>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Alertes de maintenance ({alertes.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {alertes.slice(0, 5).map((alerte) => (
                <div key={alerte.id} className="text-xs sm:text-sm">
                  <span className="font-semibold">{alerte.vehicule}</span> - {alerte.type}: {alerte.alerte}
                  {alerte.prochainKm && alerte.kmActuel && (
                    <span className="ml-2">
                      ({alerte.kmActuel} / {alerte.prochainKm} km)
                    </span>
                  )}
                </div>
              ))}
              {alertes.length > 5 && (
                <div className="text-xs text-gray-600 mt-2">
                  + {alertes.length - 5} autre(s) alerte(s)
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

        <CardHeader>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Button onClick={openCreateModal} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Planifier une maintenance
            </Button>
            <div className="flex-1">
              <Input
                placeholder="Rechercher par type, véhicule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-md"
              />
            </div>
            <div className="w-full sm:w-48">
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
            <div className="w-full sm:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedVehicule} onValueChange={setSelectedVehicule}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les véhicules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les véhicules</SelectItem>
                  {camions.map((camion) => (
                    <SelectItem key={camion._id} value={camion._id}>
                      {camion.matricule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                placeholder="Date début"
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                placeholder="Date fin"
              />
            </div>
            {(selectedStatut !== "all" || selectedType !== "all" || selectedVehicule !== "all" || dateDebut || dateFin || searchTerm || showAlertesOnly) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatut("all");
                  setSelectedType("all");
                  setSelectedVehicule("all");
                  setDateDebut("");
                  setDateFin("");
                  setSearchTerm("");
                  setShowAlertesOnly(false);
                }}
                className="w-full sm:w-auto"
              >
                Réinitialiser
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-alertes"
              checked={showAlertesOnly}
              onChange={(e) => setShowAlertesOnly(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="show-alertes" className="cursor-pointer text-xs sm:text-sm">
              Afficher seulement les alertes
            </Label>
          </div>
        </CardContent>
            
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : currentMaintenances.length > 0 ? (
            <>
              {/* Desktop Table - visible on lg+ */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date prévue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Véhicule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KM / Prochain KM
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
                    {currentMaintenances.map((maintenance) => {
                      const vehiculeInfo = typeof maintenance.vehicule === 'object' ? maintenance.vehicule : null;
                      const joursRestants = getJoursRestants(maintenance.datePrevu);

                      return (
                        <tr key={maintenance._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{formatDate(maintenance.datePrevu)}</div>
                            {joursRestants < 0 && (
                              <div className="text-xs text-red-600">En retard ({Math.abs(joursRestants)}j)</div>
                            )}
                            {joursRestants >= 0 && joursRestants <= 7 && (
                              <div className="text-xs text-orange-600">{joursRestants}j restants</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {maintenance.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {vehiculeInfo?.matricule || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>
                              {maintenance.kmMaintenance && (
                                <div>KM: {maintenance.kmMaintenance.toLocaleString()}</div>
                              )}
                              {maintenance.prochainKm && (
                                <div className="text-xs">
                                  Prochain: {maintenance.prochainKm.toLocaleString()} km
                                  {vehiculeInfo?.kilometrage && (
                                    <span className={maintenance.prochainKm - vehiculeInfo.kilometrage < 1000 ? "text-red-600" : ""}>
                                      {" "}({maintenance.prochainKm - vehiculeInfo.kilometrage} km restants)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(maintenance.statut)}`}>
                              {maintenance.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center gap-2">
                              {maintenance.statut !== 'effectuée' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEffectueeModal(maintenance)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Marquer comme effectuée"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(maintenance)}
                                title="Modifier"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(maintenance._id)}
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

              {/* Mobile/Tablet Cards - visible on < lg */}
              <div className="lg:hidden divide-y divide-gray-200">
                {currentMaintenances.map((maintenance) => {
                  const vehiculeInfo = typeof maintenance.vehicule === 'object' ? maintenance.vehicule : null;
                  const joursRestants = getJoursRestants(maintenance.datePrevu);

                  return (
                    <div key={maintenance._id} className="p-4 sm:p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {maintenance.type} - {vehiculeInfo?.matricule || 'N/A'}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatDate(maintenance.datePrevu)}
                            {joursRestants < 0 && (
                              <span className="ml-2 text-red-600">• En retard ({Math.abs(joursRestants)}j)</span>
                            )}
                            {joursRestants >= 0 && joursRestants <= 7 && (
                              <span className="ml-2 text-orange-600">• {joursRestants}j restants</span>
                            )}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(maintenance.statut)}`}>
                          {maintenance.statut}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-3">
                        {maintenance.kmMaintenance && (
                          <div>
                            <span className="text-gray-500">KM:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {maintenance.kmMaintenance.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {maintenance.prochainKm && (
                          <div>
                            <span className="text-gray-500">Prochain KM:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {maintenance.prochainKm.toLocaleString()} km
                              {vehiculeInfo?.kilometrage && (
                                <span className={maintenance.prochainKm - vehiculeInfo.kilometrage < 1000 ? "text-red-600" : ""}>
                                  {" "}({maintenance.prochainKm - vehiculeInfo.kilometrage} restants)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 flex-wrap">
                        {maintenance.statut !== 'effectuée' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEffectueeModal(maintenance)}
                            className="text-green-600 hover:text-green-700"
                            title="Marquer comme effectuée"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Effectuée
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(maintenance)}
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(maintenance._id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
              {searchTerm || selectedStatut !== "all" || selectedType !== "all" || selectedVehicule !== "all" || dateDebut || dateFin || showAlertesOnly
                ? "Aucune maintenance trouvée pour ces filtres"
                : "Aucune maintenance. Cliquez sur 'Planifier une maintenance' pour commencer."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMaintenance ? "Modifier la maintenance" : "Planifier une maintenance"}
            </DialogTitle>
            <DialogDescription>
              {editingMaintenance
                ? "Modifiez les informations de la maintenance ci-dessous."
                : "Remplissez les informations pour planifier une nouvelle maintenance."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehicule">Véhicule *</Label>
                <Select
                  value={formData.vehicule}
                  onValueChange={(value) => {
                    setFormData({ ...formData, vehicule: value });
                    // Remplir automatiquement le kmMaintenance avec le km actuel du véhicule
                    const camion = camions.find(c => c._id === value);
                    if (camion && camion.kilometrage) {
                      setFormData(prev => ({ ...prev, vehicule: value, kmMaintenance: camion.kilometrage }));
                    }
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule" />
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
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="datePrevu">Date prévue *</Label>
                <Input
                  id="datePrevu"
                  type="datetime-local"
                  required
                  value={formData.datePrevu}
                  onChange={(e) => setFormData({ ...formData, datePrevu: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kmMaintenance">KM de maintenance</Label>
                  <Input
                    id="kmMaintenance"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.kmMaintenance || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kmMaintenance: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="KM actuel du véhicule"
                  />
                  <p className="text-xs text-gray-500">
                    Nombre entier positif (optionnel)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prochainKm">Prochain KM</Label>
                  <Input
                    id="prochainKm"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.prochainKm || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prochainKm: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="KM pour prochaine maintenance"
                  />
                  <p className="text-xs text-gray-500">
                    Doit être supérieur au KM maintenance (optionnel)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cout">Coût (DH)</Label>
                <Input
                  id="cout"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cout || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cout: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex: 1500"
                />
                <p className="text-xs text-gray-500">
                  Prix positif (optionnel)
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

      {/* Modal Marquer comme effectuée */}
      <Dialog open={isEffectueeModalOpen} onOpenChange={setIsEffectueeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Marquer comme effectuée</DialogTitle>
            <DialogDescription>
              Confirmez les informations de la maintenance effectuée
            </DialogDescription>
          </DialogHeader>
          {maintenanceToMark && (
            <form onSubmit={handleMarquerEffectuee}>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm">
                    <div><strong>Type:</strong> {maintenanceToMark.type}</div>
                    <div><strong>Véhicule:</strong> {typeof maintenanceToMark.vehicule === 'object' ? maintenanceToMark.vehicule.matricule : 'N/A'}</div>
                    <div><strong>Date prévue:</strong> {formatDate(maintenanceToMark.datePrevu)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFait">Date effectuée *</Label>
                  <Input
                    id="dateFait"
                    type="datetime-local"
                    required
                    value={effectueeData.dateFait}
                    onChange={(e) => setEffectueeData({ ...effectueeData, dateFait: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kmMaintenance">KM de maintenance</Label>
                  <Input
                    id="kmMaintenance"
                    type="number"
                    min="0"
                    step="1"
                    value={effectueeData.kmMaintenance || ""}
                    onChange={(e) =>
                      setEffectueeData({
                        ...effectueeData,
                        kmMaintenance: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Nombre entier positif (optionnel)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cout">Coût (DH)</Label>
                    <Input
                      id="cout"
                      type="number"
                      min="0"
                      step="0.01"
                      value={effectueeData.cout || ""}
                      onChange={(e) =>
                        setEffectueeData({
                          ...effectueeData,
                          cout: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prochainKm">Prochain KM</Label>
                    <Input
                      id="prochainKm"
                      type="number"
                      min="0"
                      step="1"
                      value={effectueeData.prochainKm || ""}
                      onChange={(e) =>
                        setEffectueeData({
                          ...effectueeData,
                          prochainKm: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Nombre entier positif (optionnel)
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarques-effectuee">Remarques</Label>
                  <Input
                    id="remarques-effectuee"
                    maxLength={500}
                    value={effectueeData.remarques || ""}
                    onChange={(e) => setEffectueeData({ ...effectueeData, remarques: e.target.value })}
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
                  onClick={() => setIsEffectueeModalOpen(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enregistrement..." : "Marquer comme effectuée"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cette maintenance sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMaintenanceToDelete(null)}>
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

