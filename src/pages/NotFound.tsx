import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Page not found
        </h1>
        <p className="mt-3 text-gray-600">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
