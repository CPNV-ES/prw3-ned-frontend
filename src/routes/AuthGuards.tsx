import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import Header from "../components/Header";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const location = useLocation();

  useEffect(() => {
    let isCancelled = false;

    const checkSession = async () => {
      const currentUser = await getCurrentUser();
      if (!isCancelled) {
        setStatus(currentUser ? "authenticated" : "unauthenticated");
      }
    };

    checkSession();

    return () => {
      isCancelled = true;
    };
  }, [location.pathname]);

  return status;
}

export function ProtectedRoute() {
  const authStatus = useAuthStatus();

  if (authStatus === "loading") {
    return null;
  }

  return authStatus === "authenticated" ? (
    <>
      <Header />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}

export function GuestRoute() {
  const authStatus = useAuthStatus();

  if (authStatus === "loading") {
    return null;
  }

  return authStatus === "authenticated" ? (
    <Navigate to="/" replace />
  ) : (
    <Outlet />
  );
}
