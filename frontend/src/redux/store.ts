import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import camionReducer from "./slices/camionSlice";
import trajetReducer from "./slices/trajetSlice";
import maintenanceReducer from "./slices/maintenanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    camions: camionReducer,
    trajets: trajetReducer,
    maintenances: maintenanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;