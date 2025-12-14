import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { getTrajets, getTrajetById, createTrajet, updateTrajet, deleteTrajet, updateStatut, updateKmEtGasoil } from "../services/trajet.service";
import type { Trajet, TrajetPayload } from "../services/trajet.service";

type TrajetState = {
  items: Trajet[];
  selected?: Trajet | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

type TrajetContextType = TrajetState & {
  fetchTrajets: () => Promise<void>;
  fetchTrajet: (id: string) => Promise<void>;
  createTrajet: (payload: TrajetPayload) => Promise<void>;
  updateTrajet: (id: string, payload: TrajetPayload) => Promise<void>;
  deleteTrajet: (id: string) => Promise<void>;
  updateStatut: (id: string, statut: Trajet["statut"]) => Promise<void>;
  updateKmEtGasoil: (id: string, kmArrivee?: number, gasoilConsomme?: number) => Promise<void>;
  setSelected: (trajet: Trajet | null) => void;
};

const TrajetContext = createContext<TrajetContextType | undefined>(undefined);

export const TrajetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TrajetState>({
    items: [],
    selected: null,
    status: "idle",
    error: null,
  });

  const fetchTrajets = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "loading" }));
    try {
      const data = await getTrajets();
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
        error: err?.response?.data?.message || "Échec de la récupération des trajets",
      }));
    }
  }, []);

  const fetchTrajet = useCallback(async (id: string) => {
    try {
      const data = await getTrajetById(id);
      setState((prev) => ({ ...prev, selected: data }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la récupération du trajet",
      }));
    }
  }, []);

  const createTrajetHandler = useCallback(async (payload: TrajetPayload) => {
    try {
      const data = await createTrajet(payload);
      setState((prev) => ({
        ...prev,
        items: [...prev.items, data],
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la création du trajet",
      }));
      throw err;
    }
  }, []);

  const updateTrajetHandler = useCallback(async (id: string, payload: TrajetPayload) => {
    try {
      const data = await updateTrajet(id, payload);
      setState((prev) => ({
        ...prev,
        items: prev.items.map((t) => (t._id === id ? data : t)),
        selected: prev.selected?._id === id ? data : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la modification du trajet",
      }));
      throw err;
    }
  }, []);

  const deleteTrajetHandler = useCallback(async (id: string) => {
    try {
      await deleteTrajet(id);
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((t) => t._id !== id),
        selected: prev.selected?._id === id ? null : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la suppression du trajet",
      }));
      throw err;
    }
  }, []);

  const updateStatutHandler = useCallback(async (id: string, statut: Trajet["statut"]) => {
    try {
      const data = await updateStatut(id, { statut });
      setState((prev) => ({
        ...prev,
        items: prev.items.map((t) => (t._id === id ? data : t)),
        selected: prev.selected?._id === id ? data : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la mise à jour du statut",
      }));
      throw err;
    }
  }, []);

  const updateKmEtGasoilHandler = useCallback(async (id: string, kmArrivee?: number, gasoilConsomme?: number) => {
    try {
      const data = await updateKmEtGasoil(id, { kmArrivee, gasoilConsomme });
      setState((prev) => ({
        ...prev,
        items: prev.items.map((t) => (t._id === id ? data : t)),
        selected: prev.selected?._id === id ? data : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la mise à jour du kilométrage/gasoil",
      }));
      throw err;
    }
  }, []);

  const setSelected = useCallback((trajet: Trajet | null) => {
    setState((prev) => ({ ...prev, selected: trajet }));
  }, []);

  return (
    <TrajetContext.Provider
      value={{
        ...state,
        fetchTrajets,
        fetchTrajet,
        createTrajet: createTrajetHandler,
        updateTrajet: updateTrajetHandler,
        deleteTrajet: deleteTrajetHandler,
        updateStatut: updateStatutHandler,
        updateKmEtGasoil: updateKmEtGasoilHandler,
        setSelected,
      }}
    >
      {children}
    </TrajetContext.Provider>
  );
};

export const useTrajet = () => {
  const context = useContext(TrajetContext);
  if (context === undefined) {
    throw new Error("useTrajet doit être utilisé dans un TrajetProvider");
  }
  return context;
};

