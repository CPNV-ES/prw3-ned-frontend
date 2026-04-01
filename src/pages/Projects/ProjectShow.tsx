import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { AuthUser } from "../../api/auth";
import { getCurrentUser } from "../../api/auth";
import type { Comment, Project } from "../../api/projects";
import {
  createProjectComment,
  getProject,
  likeProject,
  listProjectComments,
} from "../../api/projects";
import { listUsers } from "../../api/users";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [userNamesById, setUserNamesById] = useState<Record<number, string>>(
    {},
  );

  useEffect(() => {
    async function fetchProject() {
      try {
        if (Number.isNaN(projectId)) {
          setProject(null);
          return;
        }

        setLoading(true);
        setCommentsLoading(true);
        setCommentsError("");

        const [projectResult, userResult, commentsResult, usersResult] =
          await Promise.allSettled([
            getProject(projectId),
            getCurrentUser(),
            listProjectComments(projectId),
            listUsers({ page: 1, limit: 200 }),
          ]);

        if (projectResult.status === "fulfilled") {
          setProject(projectResult.value);
        } else {
          throw projectResult.reason;
        }

        if (userResult.status === "fulfilled") {
          setCurrentUser(userResult.value);
        } else {
          setCurrentUser(null);
        }

        if (commentsResult.status === "fulfilled") {
          setComments(commentsResult.value);
        } else {
          setComments([]);
          setCommentsError("Unable to load comments.");
        }

        {
          const map: Record<number, string> = {};
          if (usersResult.status === "fulfilled") {
            for (const user of usersResult.value) {
              map[user.id] = user.name;
            }
          }

          if (userResult.status === "fulfilled" && userResult.value) {
            map[userResult.value.id] = userResult.value.name;
          }

          setUserNamesById(map);
        }
      } catch (error) {
        console.error("Erreur chargement projet:", error);
        setError("Impossible de charger le projet.");
      } finally {
        setLoading(false);
        setCommentsLoading(false);
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
      const updatedProject = await likeProject(project.id, currentUser.id);
      setProject(updatedProject);
    } catch (likeError) {
      console.error("Erreur ajout du like:", likeError);
      setError("Impossible d'ajouter un like pour le moment.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (): Promise<void> => {
    if (!project) {
      return;
    }

    if (!currentUser) {
      setCommentsError("You must be logged in to comment.");
      return;
    }

    const content = commentDraft.trim();
    if (!content) {
      return;
    }

    setIsCommenting(true);
    setCommentsError("");

    try {
      const created = await createProjectComment(project.id, content);
      setComments((current) => [created, ...current]);
      setCommentDraft("");
    } catch (commentError) {
      console.error("Error posting comment:", commentError);
      setCommentsError("Unable to post comment.");
    } finally {
      setIsCommenting(false);
    }
  };

  if (loading) {
    return <div className="app-container">Loading project...</div>;
  }

  if (!project) {
    return <div className="app-container">Project not found</div>;
  }

  const isAuthor = currentUser?.id === project.author.id;

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
                <span>by </span>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/users/${project.author.id}`);
                  }}
                  className="font-semibold text-white/90 underline decoration-white/40 underline-offset-2 transition hover:text-white hover:decoration-white/70"
                >
                  {project.author.name}
                </button>
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

        <div className="aspect-video w-full bg-slate-100">
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">Comments</h2>
              <span className="text-xs text-slate-500">
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            <div className="mt-4">
              <label htmlFor="comment" className="label">
                Add a comment
              </label>
              <textarea
                id="comment"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                className="input min-h-24 resize-y"
                placeholder={
                  currentUser
                    ? "Write something helpful..."
                    : "Log in to post a comment."
                }
                disabled={isCommenting || currentUser === null}
              />
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  {currentUser ? "Be respectful and constructive." : null}
                </div>
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={
                    isCommenting ||
                    currentUser === null ||
                    commentDraft.trim().length === 0
                  }
                  className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCommenting ? "Posting..." : "Post"}
                </button>
              </div>

              {commentsError ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {commentsError}
                </div>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              {commentsLoading ? (
                <div className="text-sm text-slate-600">
                  Loading comments...
                </div>
              ) : null}

              {!commentsLoading && comments.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  No comments yet.
                </div>
              ) : null}

              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-700">
                      {userNamesById[comment.author_id] ?? "Unknown user"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString()
                        : null}
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
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
