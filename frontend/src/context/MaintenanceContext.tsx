import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  getMaintenances,
  getMaintenanceById,
  getMaintenancesByVehicule,
  getEcheancesByVehicule,
  getMaintenancesAlertes,
  planifierMaintenance,
  updateMaintenance,
  marquerCommeEffectuee,
  deleteMaintenance,
} from "../services/maintenance.service";
import type { Maintenance, MaintenancePayload } from "../services/maintenance.service";

type MaintenanceState = {
  items: Maintenance[];
  selected?: Maintenance | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

type MaintenanceContextType = MaintenanceState & {
  fetchMaintenances: () => Promise<void>;
  fetchMaintenance: (id: string) => Promise<void>;
  fetchByVehicule: (vehiculeId: string) => Promise<void>;
  fetchEcheances: (vehiculeId: string) => Promise<any>;
  fetchAlertes: () => Promise<void>;
  createMaintenance: (payload: MaintenancePayload) => Promise<void>;
  updateMaintenance: (id: string, payload: MaintenancePayload) => Promise<void>;
  markEffectuee: (id: string, dateFait?: string, kmMaintenance?: number, cout?: number, remarques?: string, prochainKm?: number) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
  setSelected: (maintenance: Maintenance | null) => void;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MaintenanceState>({
    items: [],
    selected: null,
    status: "idle",
    error: null,
  });

  const fetchMaintenances = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "loading" }));
    try {
      const data = await getMaintenances();
      setState((prev) => ({
        ...prev,
        items: data,
        status: "succeeded",
        error: null,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: "failed",
        error: err?.response?.data?.message || "Échec de la récupération des maintenances",
      }));
    }
  }, []);

  const fetchMaintenance = useCallback(async (id: string) => {
    try {
      const data = await getMaintenanceById(id);
      setState((prev) => ({ ...prev, selected: data }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la récupération de la maintenance",
      }));
    }
  }, []);

  const fetchByVehicule = useCallback(async (vehiculeId: string) => {
    try {
      const data = await getMaintenancesByVehicule(vehiculeId);
      setState((prev) => ({
        ...prev,
        items: data,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la récupération par véhicule",
      }));
    }
  }, []);

  const fetchEcheances = useCallback(async (vehiculeId: string) => {
    try {
      return await getEcheancesByVehicule(vehiculeId);
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la récupération des échéances",
      }));
      throw err;
    }
  }, []);

  const fetchAlertes = useCallback(async () => {
    try {
      const data = await getMaintenancesAlertes();
      setState((prev) => ({
        ...prev,
        items: data,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la récupération des alertes",
      }));
    }
  }, []);

  const createMaintenanceHandler = useCallback(async (payload: MaintenancePayload) => {
    try {
      const data = await planifierMaintenance(payload);
      setState((prev) => ({
        ...prev,
        items: [...prev.items, data],
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la création de la maintenance",
      }));
      throw err;
    }
  }, []);

  const updateMaintenanceHandler = useCallback(async (id: string, payload: MaintenancePayload) => {
    try {
      const data = await updateMaintenance(id, payload);
      setState((prev) => ({
        ...prev,
        items: prev.items.map((m) => (m._id === id ? data : m)),
        selected: prev.selected?._id === id ? data : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la modification de la maintenance",
      }));
      throw err;
    }
  }, []);

  const markEffectueeHandler = useCallback(async (id: string, dateFait?: string, kmMaintenance?: number, cout?: number, remarques?: string, prochainKm?: number) => {
    try {
      const data = await marquerCommeEffectuee(id, { dateFait, kmMaintenance, cout, remarques, prochainKm });
      setState((prev) => ({
        ...prev,
        items: prev.items.map((m) => (m._id === id ? data : m)),
        selected: prev.selected?._id === id ? data : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec du marquage comme effectuée",
      }));
      throw err;
    }
  }, []);

  const deleteMaintenanceHandler = useCallback(async (id: string) => {
    try {
      await deleteMaintenance(id);
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((m) => m._id !== id),
        selected: prev.selected?._id === id ? null : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la suppression de la maintenance",
      }));
      throw err;
    }
  }, []);

  const setSelected = useCallback((maintenance: Maintenance | null) => {
    setState((prev) => ({ ...prev, selected: maintenance }));
  }, []);

  return (
    <MaintenanceContext.Provider
      value={{
        ...state,
        fetchMaintenances,
        fetchMaintenance,
        fetchByVehicule,
        fetchEcheances,
        fetchAlertes,
        createMaintenance: createMaintenanceHandler,
        updateMaintenance: updateMaintenanceHandler,
        markEffectuee: markEffectueeHandler,
        deleteMaintenance: deleteMaintenanceHandler,
        setSelected,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error("useMaintenance doit être utilisé dans un MaintenanceProvider");
  }
  return context;
};

