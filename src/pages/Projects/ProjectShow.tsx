import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Project } from "../../models/project";
import { User } from "../../models/user";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const [data, user] = await Promise.all([
          Project.getCurrent(projectId),
          User.current(),
        ]);
        setProject(data);
        setCurrentUser(user);
      } catch (error) {
        console.error("Erreur chargement projet:", error);
        setError("Impossible de charger le projet.");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  const handleLike = async (): Promise<void> => {
    if (!project || !currentUser) {
      setError("Vous devez etre connecte pour liker un projet.");
      return;
    }

    setIsLiking(true);
    setError("");

    try {
      const updatedProject = await Project.liked(project.id, currentUser);
      setProject(updatedProject);
    } catch (likeError) {
      console.error("Erreur ajout du like:", likeError);
      setError("Impossible d'ajouter un like pour le moment.");
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return <div className="app-container">Loading project...</div>;
  }

  if (!project) {
    return <div className="app-container">Project not found</div>;
  }

  const isAuthor = currentUser?.id === project.author_id;

  return (
    <div className="app-container">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost mb-4 px-3 py-1.5"
      >
        Return
      </button>

      <div className="terminal-card">
        <div className="terminal-card-header">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="terminal-card-title text-base">{project.title}</h1>
              <div className="terminal-card-meta">
                {project.author_name
                  ? `by ${project.author_name}`
                  : `author #${project.author_id}`}
                {project.created_at
                  ? ` | ${new Date(project.created_at).toLocaleDateString()}`
                  : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="badge-dark">{project.likes} likes</span>

              {isAuthor ? (
                <button
                  type="button"
                  onClick={() => navigate(`/projects/edit/${project.id}`)}
                  className="inline-flex items-center rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15"
                >
                  Edit
                </button>
              ) : null}

              {isAuthor ? null : (
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={isLiking || currentUser === null}
                  className="inline-flex items-center rounded-xl border border-white/15 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:opacity-60"
                >
                  {isLiking ? "Updating..." : "Like"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="aspect-[16/9] w-full bg-slate-100">
          <img
            src={project.image_url}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          <p className="mt-5 text-sm leading-relaxed text-slate-700">
            {project.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-cyan-200/60 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-950"
              >
                {tag}
              </span>
            ))}
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <a
              href={project.demo_url}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Open demo
            </a>

            <a
              href={project.repository_url}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              View repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
