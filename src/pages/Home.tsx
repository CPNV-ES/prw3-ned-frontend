import { useNavigate } from "react-router-dom";
export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900">
        Welcome to the Home Page
      </h2>
      <button onClick={() => navigate("/projects")}>
        See all actives projects
      </button>
    </main>
  );
}
