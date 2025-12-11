import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getCamions, getCamionById, createCamion, updateCamion, deleteCamion, updateKilometrage } from "../../services/camion.service";
import type { Camion, CamionPayload } from "../../services/camion.service";

type CamionState = {
  items: Camion[];
  selected?: Camion | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

const initialState: CamionState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
};

export const fetchCamions = createAsyncThunk("camions/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await getCamions();
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Fetch camions failed");
  }
});

export const fetchCamion = createAsyncThunk("camions/fetchOne", async (id: string, { rejectWithValue }) => {
  try {
    return await getCamionById(id);
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Fetch camion failed");
  }
});

export const createCamionThunk = createAsyncThunk(
  "camions/create",
  async (payload: CamionPayload, { rejectWithValue }) => {
    try {
      return await createCamion(payload);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Create camion failed");
    }
  }
);

export const updateCamionThunk = createAsyncThunk(
  "camions/update",
  async ({ id, payload }: { id: string; payload: CamionPayload }, { rejectWithValue }) => {
    try {
      return await updateCamion(id, payload);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update camion failed");
    }
  }
);

export const deleteCamionThunk = createAsyncThunk("camions/delete", async (id: string, { rejectWithValue }) => {
  try {
    await deleteCamion(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Delete camion failed");
  }
});

export const updateKilometrageThunk = createAsyncThunk(
  "camions/updateKilometrage",
  async ({ id, kilometrage }: { id: string; kilometrage: number }, { rejectWithValue }) => {
    try {
      return await updateKilometrage(id, { kilometrage });
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update kilometrage failed");
    }
  }
);

const camionSlice = createSlice({
  name: "camions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCamions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCamions.fulfilled, (state, action: PayloadAction<Camion[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCamions.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(fetchCamion.fulfilled, (state, action: PayloadAction<Camion>) => {
        state.selected = action.payload;
      })
      .addCase(createCamionThunk.fulfilled, (state, action: PayloadAction<Camion>) => {
        state.items.push(action.payload);
      })
      .addCase(updateCamionThunk.fulfilled, (state, action: PayloadAction<Camion>) => {
        state.items = state.items.map((c) => (c._id === action.payload._id ? action.payload : c));
      })
      .addCase(deleteCamionThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      })
      .addCase(updateKilometrageThunk.fulfilled, (state, action: PayloadAction<Camion>) => {
        state.items = state.items.map((c) => (c._id === action.payload._id ? action.payload : c));
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      });
  },
});

export default camionSlice.reducer;