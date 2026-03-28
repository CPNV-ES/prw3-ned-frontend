import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../models/user";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await User.logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-left"
          >
            <div className="text-base font-bold text-slate-900">Demo Deck</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              PRW3
            </div>
          </button>

          <nav className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-ghost px-3 py-1.5"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="btn-ghost px-3 py-1.5"
            >
              Projects
            </button>
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="btn-primary"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
