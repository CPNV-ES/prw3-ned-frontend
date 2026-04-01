import { useNavigate } from "react-router-dom";
export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="app-container">
      <div className="tech-surface-strong overflow-hidden">
        <div className="border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5 text-white">
          <div className="text-xs uppercase tracking-widest text-cyan-200/90">
            Demo Deck
          </div>
          <h2 className="mt-2 text-2xl font-bold">Showcase student projects</h2>
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="btn-accent"
            >
              Explore projects
            </button>
            <button
              type="button"
              onClick={() => navigate("/projects/create")}
              className="btn-ghost"
            >
              Create a project
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
