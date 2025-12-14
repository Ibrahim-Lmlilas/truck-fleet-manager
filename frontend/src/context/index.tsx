import React from "react";
import type { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { CamionProvider } from "./CamionContext";
import { TrajetProvider } from "./TrajetContext";
import { MaintenanceProvider } from "./MaintenanceContext";

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <CamionProvider>
        <TrajetProvider>
          <MaintenanceProvider>{children}</MaintenanceProvider>
        </TrajetProvider>
      </CamionProvider>
    </AuthProvider>
  );
};

// Export all hooks for convenience
export { useAuth } from "./AuthContext";
export { useCamion } from "./CamionContext";
export { useTrajet } from "./TrajetContext";
export { useMaintenance } from "./MaintenanceContext";

