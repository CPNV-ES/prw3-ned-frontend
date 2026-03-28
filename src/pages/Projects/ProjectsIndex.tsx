import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { AuthUser } from "../../api/auth";
import { getCurrentUser } from "../../api/auth";
import type { Project } from "../../api/projects";
import { deleteProject, listProjects } from "../../api/projects";

type SortOption = "date-desc" | "date-asc" | "likes-desc" | "likes-asc";

export default function ProjectsIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nameQuery, setNameQuery] = useState("");
  const [tagsQuery, setTagsQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("date-desc");

  const [appliedNameQuery, setAppliedNameQuery] = useState("");
  const [appliedTagsQuery, setAppliedTagsQuery] = useState("");
  const [appliedSort, setAppliedSort] = useState<SortOption>("date-desc");
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    async function fetchCurrentUser() {
      try {
        const user = await getCurrentUser();
        if (!isCancelled) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error during the loading of the projects:", error);
      }
    }

    fetchCurrentUser();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProjects() {
      setLoading(true);
      setError("");

      const trimmedName = appliedNameQuery.trim();
      const tags = appliedTagsQuery
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const [sortBy, order] = appliedSort.split("-") as [
        "date" | "likes",
        "asc" | "desc",
      ];

      try {
        const allProjects = await listProjects({
          name: trimmedName ? trimmedName : undefined,
          tags: tags.length > 0 ? tags : undefined,
          sortBy,
          order,
        });

        if (!isCancelled) {
          setProjects(allProjects);
        }
      } catch (error) {
        console.error("Error during the loading of the projects:", error);
        if (!isCancelled) {
          setError("Unable to load the projects.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isCancelled = true;
    };
  }, [appliedNameQuery, appliedTagsQuery, appliedSort]);

  const handleCreateProject = () => {
    navigate("/projects/create");
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      setProjects((currentProjects) =>
        currentProjects.filter((p) => p.id !== id),
      );
    } catch (error) {
      console.error("Error during the deleting of the project :", error);
    }
  };

  const handleView = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/projects/edit/${id}`);
  };

  return (
    <div className="app-container">
      <div className="tech-surface-strong mb-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Projects</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateProject}
            className="btn-accent"
          >
            Create project
          </button>
        </div>

        <div className="px-5 py-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="label">
                Search by name
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  id="projectName"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  placeholder="Demo Deck"
                  className="input"
                />

                <button
                  type="button"
                  onClick={() => setAppliedNameQuery(nameQuery)}
                  disabled={loading}
                  className="btn-primary shrink-0"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="tech-surface p-4">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
                <div>
                  <label htmlFor="projectTags" className="label">
                    Filter by tags
                  </label>
                  <input
                    id="projectTags"
                    value={tagsQuery}
                    onChange={(e) => setTagsQuery(e.target.value)}
                    placeholder="react, typescript"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="sortProjects" className="label">
                    Sort
                  </label>
                  <select
                    id="sortProjects"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="select"
                  >
                    <option value="date-desc">
                      Creation date (newest first)
                    </option>
                    <option value="date-asc">
                      Creation date (oldest first)
                    </option>
                    <option value="likes-desc">Likes (highest first)</option>
                    <option value="likes-asc">Likes (lowest first)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAppliedTagsQuery(tagsQuery);
                    setAppliedSort(sort);
                  }}
                  disabled={loading}
                  className="btn-primary w-full md:w-auto"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-slate-600">
              Loading projects...
            </div>
          ) : null}

          {!loading && projects.length === 0 ? (
            <div className="mt-6 tech-surface p-6 text-sm text-slate-700">
              No projects found.
            </div>
          ) : null}

          {projects.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const isAuthor = currentUser?.id === project.author_id;
                const createdLabel = project.created_at
                  ? new Date(project.created_at).toLocaleDateString()
                  : null;

                return (
                  <div
                    key={project.id}
                    className="terminal-card transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="terminal-card-header">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="terminal-card-title">{project.title}</h2>
                        <span className="badge-dark">
                          {project.likes} likes
                        </span>
                      </div>

                      <div className="terminal-card-meta">
                        {project.author_name
                          ? `by ${project.author_name}`
                          : `author #${project.author_id}`}
                        {createdLabel ? ` | ${createdLabel}` : null}
                      </div>
                    </div>

                    <div className="aspect-[16/9] w-full bg-slate-100">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4">
                      <p className="mt-2 line-clamp-3 text-sm text-slate-700">
                        {project.summary}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tags.slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-cyan-200/60 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-950"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 6 ? (
                          <span className="badge">
                            +{project.tags.length - 6}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(project.id)}
                          className="btn-accent px-3 py-1.5 text-xs"
                        >
                          Details
                        </button>

                        {isAuthor ? (
                          <button
                            type="button"
                            onClick={() => handleEdit(project.id)}
                            className="btn-warning px-3 py-1.5 text-xs"
                          >
                            Edit
                          </button>
                        ) : null}

                        {isAuthor ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(project.id)}
                            className="btn-danger px-3 py-1.5 text-xs"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
