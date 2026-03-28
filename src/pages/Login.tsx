import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../models/user";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await User.login(username, password);
      navigate("/", { replace: true });
    } catch {
      setError("Invalid username or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="tech-surface-strong overflow-hidden">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5 text-white">
            <div className="text-xs uppercase tracking-widest text-cyan-200/90">
              Demo Deck
            </div>
            <h1 className="mt-2 text-2xl font-bold">Login</h1>
            <p className="mt-1 text-xs text-slate-200">
              Use your username and password.
            </p>
          </div>

          <div className="px-6 py-6">
            {error ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
