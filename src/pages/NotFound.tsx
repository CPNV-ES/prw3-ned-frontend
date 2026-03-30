import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="tech-surface-strong p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            The page you are looking for does not exist.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
