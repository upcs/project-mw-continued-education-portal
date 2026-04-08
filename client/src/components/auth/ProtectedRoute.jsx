import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles = null,
  requiredPermission = null,
}) {
  const location = useLocation();
  const { user, authLoading, isAuthenticated, hasPermission } = useAuth();

  if (authLoading) {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const isAdmin = user?.role === "admin";

  if (allowedRoles && !isAdmin && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  if (requiredPermission && !isAdmin && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return children;
}