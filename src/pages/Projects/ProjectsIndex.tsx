import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { AuthUser } from "../../api/auth";
import { getCurrentUser } from "../../api/auth";
import type { Project } from "../../api/projects";
import { deleteProject, listProjects } from "../../api/projects";
import ProjectCard from "../../components/ProjectCard";

type SortOption = "date-desc" | "date-asc" | "likes-desc" | "likes-asc";

export default function ProjectsIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to delete a project.");
      return;
    }

    if (currentUser.id !== project.author_id) {
      setError("You cannot delete a project you do not own.");
      return;
    }

    const isConfirmed = window.confirm(
      `Delete "${project.title}"? This action cannot be undone.`,
    );
    if (!isConfirmed) {
      return;
    }

    try {
      setError("");
      setDeletingId(id);
      await deleteProject(id);
      setProjects((currentProjects) =>
        currentProjects.filter((p) => p.id !== id),
      );
    } catch (error) {
      console.error("Error during the deleting of the project :", error);
      setError("Unable to delete this project.");
    } finally {
      setDeletingId((current) => (current === id ? null : current));
    }
  };

  const handleView = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/projects/edit/${id}`);
  };

  const handleViewAuthor = (authorId: number) => {
    navigate(`/users/${authorId}`);
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
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onAuthorClick={handleViewAuthor}
                    onDetails={() => handleView(project.id)}
                    onEdit={() => handleEdit(project.id)}
                    onDelete={() => handleDelete(project.id)}
                    isAuthor={isAuthor}
                    isDeleting={deletingId === project.id}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
