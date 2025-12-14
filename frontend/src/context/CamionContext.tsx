import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { getCamions, getCamionById, createCamion, updateCamion, deleteCamion, updateKilometrage } from "../services/camion.service";
import type { Camion, CamionPayload } from "../services/camion.service";

type CamionState = {
  items: Camion[];
  selected?: Camion | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

type CamionContextType = CamionState & {
  fetchCamions: () => Promise<void>;
  fetchCamion: (id: string) => Promise<void>;
  createCamion: (payload: CamionPayload) => Promise<void>;
  updateCamion: (id: string, payload: CamionPayload) => Promise<void>;
  deleteCamion: (id: string) => Promise<void>;
  updateKilometrage: (id: string, kilometrage: number) => Promise<void>;
  setSelected: (camion: Camion | null) => void;
};

const CamionContext = createContext<CamionContextType | undefined>(undefined);

export const CamionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CamionState>({
    items: [],
    selected: null,
    status: "idle",
    error: null,
  });

  const fetchCamions = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "loading" }));
    try {
      const data = await getCamions();
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
        error: err?.response?.data?.message || "Échec de la récupération des camions",
      }));
    }
  }, []);

  const fetchCamion = useCallback(async (id: string) => {
    try {
      const data = await getCamionById(id);
      setState((prev) => ({ ...prev, selected: data }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la récupération du camion",
      }));
    }
  }, []);

  const createCamionHandler = useCallback(async (payload: CamionPayload) => {
    try {
      const data = await createCamion(payload);
      setState((prev) => ({
        ...prev,
        items: [...prev.items, data],
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la création du camion",
      }));
      throw err;
    }
  }, []);

  const updateCamionHandler = useCallback(async (id: string, payload: CamionPayload) => {
    try {
      const data = await updateCamion(id, payload);
      setState((prev) => ({
        ...prev,
        items: prev.items.map((c) => (c._id === id ? data : c)),
        selected: prev.selected?._id === id ? data : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la modification du camion",
      }));
      throw err;
    }
  }, []);

  const deleteCamionHandler = useCallback(async (id: string) => {
    try {
      await deleteCamion(id);
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((c) => c._id !== id),
        selected: prev.selected?._id === id ? null : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la suppression du camion",
      }));
      throw err;
    }
  }, []);

  const updateKilometrageHandler = useCallback(async (id: string, kilometrage: number) => {
    try {
      const data = await updateKilometrage(id, { kilometrage });
      setState((prev) => ({
        ...prev,
        items: prev.items.map((c) => (c._id === id ? data : c)),
        selected: prev.selected?._id === id ? data : prev.selected,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Échec de la mise à jour du kilométrage",
      }));
      throw err;
    }
  }, []);

  const setSelected = useCallback((camion: Camion | null) => {
    setState((prev) => ({ ...prev, selected: camion }));
  }, []);

  return (
    <CamionContext.Provider
      value={{
        ...state,
        fetchCamions,
        fetchCamion,
        createCamion: createCamionHandler,
        updateCamion: updateCamionHandler,
        deleteCamion: deleteCamionHandler,
        updateKilometrage: updateKilometrageHandler,
        setSelected,
      }}
    >
      {children}
    </CamionContext.Provider>
  );
};

export const useCamion = () => {
  const context = useContext(CamionContext);
  if (context === undefined) {
    throw new Error("useCamion doit être utilisé dans un CamionProvider");
  }
  return context;
};

