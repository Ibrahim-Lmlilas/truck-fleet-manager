import { useEffect, useRef } from "react";
import { useAppDispatch } from "./redux/hooks";
import { getMeThunk } from "./redux/slices/authSlice";
import { setAuthToken } from "./services/apiClient";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "./components/ui/sonner";

function App() {
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initialize auth only once on mount: if token exists, set it and fetch user data
    if (!hasInitialized.current) {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setAuthToken(storedToken);
        dispatch(getMeThunk());
      }
      hasInitialized.current = true;
    }
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App
