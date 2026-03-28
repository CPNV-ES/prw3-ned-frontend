import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { register } from "../api/auth";
import AuthCard from "../components/AuthCard";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await register(name.trim(), username.trim(), password);
      navigate("/login", { replace: true });
    } catch (err) {
      const status = err instanceof ApiError ? err.status : undefined;

      if (status === 409) {
        setError("User already exists");
      } else if (status === 400) {
        setError("Bad request");
      } else {
        setError("Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Register">
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </div>

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
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-600">
        <Link to="/login" className="underline hover:text-slate-900">
          Back to login
        </Link>
      </div>
    </AuthCard>
  );
}
