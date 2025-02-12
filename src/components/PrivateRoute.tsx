import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    console.log("App is still initializing, showing loader...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log("User not authenticated. Redirecting to /auth...");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log("User authenticated. Rendering protected route.");
  return <>{children}</>;
};
