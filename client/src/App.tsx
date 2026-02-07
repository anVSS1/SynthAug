import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Studio from "./pages/Studio";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import LegalPage from "./pages/Legal";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

// This component will be used to wrap the authenticated routes
const AppLayout = () => (
  <MainLayout>
    <Outlet /> {/* Child routes will render here */}
  </MainLayout>
);

const ProtectedRoute = () => {
  const { isAuthenticated, token } = useAuthStore();

  // Debug logging
  useEffect(() => {
    console.log(
      "ProtectedRoute - isAuthenticated:",
      isAuthenticated,
      "token:",
      token ? "exists" : "none",
    );
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  return <AppLayout />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/terms" element={<LegalPage />} />
        <Route path="/privacy" element={<LegalPage />} />

        {/* Authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<Studio />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
