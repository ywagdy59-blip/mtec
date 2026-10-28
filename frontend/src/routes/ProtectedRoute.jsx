import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PageLoader } from "../components/ui/Spinner";

// Dashboard routes: not logged in -> login page
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
