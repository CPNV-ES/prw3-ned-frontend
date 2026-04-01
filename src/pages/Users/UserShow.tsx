import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { AuthUser } from "../../api/auth";
import { getCurrentUser } from "../../api/auth";
import type { Project } from "../../api/projects";
import { deleteProject } from "../../api/projects";
import type { User } from "../../api/users";
import { getUser, listUserProjects } from "../../api/users";
import ProjectCard from "../../components/ProjectCard";

export default function UserShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const userId = useMemo(() => Number(id), [id]);

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      if (!id || Number.isNaN(userId)) {
        setUser(null);
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        const [userResult, userProjects, sessionUser] = await Promise.all([
          getUser(userId),
          listUserProjects(userId),
          getCurrentUser(),
        ]);

        if (isCancelled) {
          return;
        }

        setUser(userResult);
        setProjects(userProjects);
        setCurrentUser(sessionUser);
        setActionError("");
      } catch (err) {
        console.error("Failed to load user page:", err);
        if (!isCancelled) {
          setError("Unable to load this user.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [id, userId]);

  if (loading) {
    return <div className="app-container">Loading user...</div>;
  }

  if (error) {
    return (
      <div className="app-container">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-ghost mb-4 px-3 py-1.5"
        >
          Return
        </button>

        <div className="tech-surface p-6 text-sm text-rose-700">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-ghost mb-4 px-3 py-1.5"
        >
          Return
        </button>

        <div className="tech-surface p-6 text-sm text-slate-700">
          User not found.
        </div>
      </div>
    );
  }

  const isSelf = currentUser?.id === userId;

  const handleDelete = async (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      return;
    }

    if (!currentUser) {
      setActionError("You must be logged in to delete a project.");
      return;
    }

    if (currentUser.id !== project.author.id) {
      setActionError("You cannot delete a project you do not own.");
      return;
    }

    const isConfirmed = window.confirm(
      `Delete "${project.title}"? This action cannot be undone.`,
    );
    if (!isConfirmed) {
      return;
    }

    try {
      setActionError("");
      setDeletingId(projectId);
      await deleteProject(projectId);
      setProjects((current) => current.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Failed to delete project:", err);
      setActionError("Unable to delete this project.");
    } finally {
      setDeletingId((current) => (current === projectId ? null : current));
    }
  };

  return (
    <div className="app-container">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost mb-4 px-3 py-1.5"
      >
        Return
      </button>

      <div className="tech-surface-strong overflow-hidden">
        <div className="border-b border-slate-200 bg-white/70 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <div className="text-sm text-slate-600">@{user.username}</div>
            </div>

            <div className="text-sm text-slate-600">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          {actionError ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          ) : null}

          {projects.length === 0 ? (
            <div className="tech-surface p-6 text-sm text-slate-700">
              No projects found for this user.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onAuthorClick={(authorId) => navigate(`/users/${authorId}`)}
                    onDetails={() => navigate(`/projects/${project.id}`)}
                    onEdit={
                      isSelf
                        ? () => navigate(`/projects/edit/${project.id}`)
                        : undefined
                    }
                    onDelete={
                      isSelf ? () => handleDelete(project.id) : undefined
                    }
                    isAuthor={isSelf}
                    isDeleting={deletingId === project.id}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
