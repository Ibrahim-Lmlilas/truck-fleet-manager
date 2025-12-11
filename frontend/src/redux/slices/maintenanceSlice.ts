import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    getMaintenances, getMaintenanceById, getMaintenancesByVehicule, getEcheancesByVehicule,
    getMaintenancesAlertes, planifierMaintenance, updateMaintenance, marquerCommeEffectuee, deleteMaintenance,
} from "../../services/maintenance.service";
import type { Maintenance, MaintenancePayload } from "../../services/maintenance.service";

type MaintenanceState = {
    items: Maintenance[];
    selected?: Maintenance | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error?: string | null;
};

const initialState: MaintenanceState = {
    items: [],
    selected: null,
    status: "idle",
    error: null,
};

export const fetchMaintenances = createAsyncThunk(
    "maintenances/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await getMaintenances();
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Fetch maintenances failed");
        }
    }
);

export const fetchMaintenance = createAsyncThunk(
    "maintenances/fetchOne",
    async (id: string, { rejectWithValue }) => {
        try {
            return await getMaintenanceById(id);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Fetch maintenance failed");
        }
    }
);

export const fetchByVehicule = createAsyncThunk(
    "maintenances/byVehicule",
    async (vehiculeId: string, { rejectWithValue }) => {
        try {
            return await getMaintenancesByVehicule(vehiculeId);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Fetch by vehicule failed");
        }
    }
);

export const fetchEcheances = createAsyncThunk(
    "maintenances/echeances",
    async (vehiculeId: string, { rejectWithValue }) => {
        try {
            return await getEcheancesByVehicule(vehiculeId);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Fetch echeances failed");
        }
    }
);

export const fetchAlertes = createAsyncThunk("maintenances/alertes", async (_, { rejectWithValue }) => {
    try {
        return await getMaintenancesAlertes();
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.message || "Fetch alertes failed");
    }
});

export const createMaintenanceThunk = createAsyncThunk(
    "maintenances/create",
    async (payload: MaintenancePayload, { rejectWithValue }) => {
        try {
            return await planifierMaintenance(payload);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Create maintenance failed");
        }
    }
);

export const updateMaintenanceThunk = createAsyncThunk(
    "maintenances/update",
    async ({ id, payload }: { id: string; payload: MaintenancePayload }, { rejectWithValue }) => {
        try {
            return await updateMaintenance(id, payload);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Update maintenance failed");
        }
    }
);

export const markEffectueeThunk = createAsyncThunk(
    "maintenances/markEffectuee",
    async ({ id, effectuee }: { id: string; effectuee: boolean }, { rejectWithValue }) => {
        try {
            return await marquerCommeEffectuee(id, { effectuee });
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Mark as done failed");
        }
    }
);

export const deleteMaintenanceThunk = createAsyncThunk(
    "maintenances/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteMaintenance(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Delete maintenance failed");
        }
    }
);

const maintenanceSlice = createSlice({
    name: "maintenances",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMaintenances.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMaintenances.fulfilled, (state, action: PayloadAction<Maintenance[]>) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchMaintenances.rejected, (state, action) => {
                state.status = "failed";
                state.error = (action.payload as string) || action.error.message || null;
            })
            .addCase(fetchMaintenance.fulfilled, (state, action: PayloadAction<Maintenance>) => {
                state.selected = action.payload;
            })
            .addCase(fetchByVehicule.fulfilled, (state, action: PayloadAction<Maintenance[]>) => {
                state.items = action.payload;
            })
            // Echeances can be any structure; no state binding here, just let caller use the promise
            .addCase(fetchAlertes.fulfilled, (state, action: PayloadAction<Maintenance[]>) => {
                state.items = action.payload;
            })
            .addCase(createMaintenanceThunk.fulfilled, (state, action: PayloadAction<Maintenance>) => {
                state.items.push(action.payload);
            })
            .addCase(updateMaintenanceThunk.fulfilled, (state, action: PayloadAction<Maintenance>) => {
                state.items = state.items.map((m) => (m._id === action.payload._id ? action.payload : m));
            })
            .addCase(markEffectueeThunk.fulfilled, (state, action: PayloadAction<Maintenance>) => {
                state.items = state.items.map((m) => (m._id === action.payload._id ? action.payload : m));
            })
            .addCase(deleteMaintenanceThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.items = state.items.filter((m) => m._id !== action.payload);
            });
    },
});

export default maintenanceSlice.reducer;