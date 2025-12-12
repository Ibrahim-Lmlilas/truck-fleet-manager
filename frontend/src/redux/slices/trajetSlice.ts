import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getTrajets, getTrajetById, createTrajet, updateTrajet, deleteTrajet, updateStatut, updateKmEtGasoil } from "../../services/trajet.service";
import type { Trajet, TrajetPayload } from "../../services/trajet.service";

type TrajetState = {
  items: Trajet[];
  selected?: Trajet | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

const initialState: TrajetState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
};

export const fetchTrajets = createAsyncThunk("trajets/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await getTrajets();
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Fetch trajets failed");
  }
});

export const fetchTrajet = createAsyncThunk("trajets/fetchOne", async (id: string, { rejectWithValue }) => {
  try {
    return await getTrajetById(id);
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Fetch trajet failed");
  }
});

export const createTrajetThunk = createAsyncThunk(
  "trajets/create",
  async (payload: TrajetPayload, { rejectWithValue }) => {
    try {
      return await createTrajet(payload);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Create trajet failed");
    }
  }
);

export const updateTrajetThunk = createAsyncThunk(
  "trajets/update",
  async ({ id, payload }: { id: string; payload: TrajetPayload }, { rejectWithValue }) => {
    try {
      return await updateTrajet(id, payload);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update trajet failed");
    }
  }
);

export const deleteTrajetThunk = createAsyncThunk("trajets/delete", async (id: string, { rejectWithValue }) => {
  try {
    await deleteTrajet(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Delete trajet failed");
  }
});

export const updateStatutThunk = createAsyncThunk(
  "trajets/updateStatut",
  async ({ id, statut }: { id: string; statut: Trajet["statut"] }, { rejectWithValue }) => {
    try {
      return await updateStatut(id, { statut });
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update statut failed");
    }
  }
);

export const updateKmEtGasoilThunk = createAsyncThunk(
  "trajets/updateKmEtGasoil",
  async (
    { id, kmArrivee, gasoilConsomme }: { id: string; kmArrivee?: number; gasoilConsomme?: number },
    { rejectWithValue }
  ) => {
    try {
      return await updateKmEtGasoil(id, { kmArrivee, gasoilConsomme });
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update km/gasoil failed");
    }
  }
);

const trajetSlice = createSlice({
  name: "trajets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrajets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrajets.fulfilled, (state, action: PayloadAction<Trajet[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTrajets.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(fetchTrajet.fulfilled, (state, action: PayloadAction<Trajet>) => {
        state.selected = action.payload;
      })
      .addCase(createTrajetThunk.fulfilled, (state, action: PayloadAction<Trajet>) => {
        state.items.push(action.payload);
      })
      .addCase(updateTrajetThunk.fulfilled, (state, action: PayloadAction<Trajet>) => {
        state.items = state.items.map((t) => (t._id === action.payload._id ? action.payload : t));
      })
      .addCase(deleteTrajetThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      })
      .addCase(updateStatutThunk.fulfilled, (state, action: PayloadAction<Trajet>) => {
        state.items = state.items.map((t) => (t._id === action.payload._id ? action.payload : t));
      })
      .addCase(updateKmEtGasoilThunk.fulfilled, (state, action: PayloadAction<Trajet>) => {
        state.items = state.items.map((t) => (t._id === action.payload._id ? action.payload : t));
      });
  },
});

export default trajetSlice.reducer;