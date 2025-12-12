import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from "../../services/auth.service";
import type { UserProfile } from "../../services/auth.service";

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  status: "idle",
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiLogin(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Login failed");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    payload: { nom: string; prenom: string; email: string; password: string; role?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiRegister(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Register failed");
    }
  }
);

export const getMeThunk = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
  try {
    const user = await getMe();
    return user;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || "Fetch profile failed");
  }
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await apiLogout();
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ token: string; user: UserProfile }>) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        registerThunk.fulfilled,
        (state, action: PayloadAction<{ token: string; user: UserProfile }>) => {
          state.status = "succeeded";
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      )
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(getMeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getMeThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(getMeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
        state.token = null;
        state.user = null;
        localStorage.removeItem("token");
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = "succeeded";
        state.token = null;
        state.user = null;
      });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;