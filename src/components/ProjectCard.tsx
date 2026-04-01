import type { Project } from "../api/projects";

type Props = {
  project: Project;
  createdLabel?: string | null;
  onDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAuthorClick?: (authorId: number) => void;
  isAuthor?: boolean;
  isDeleting?: boolean;
};

export default function ProjectCard({
  project,
  createdLabel,
  onDetails,
  onEdit,
  onDelete,
  onAuthorClick,
  isAuthor = false,
  isDeleting = false,
}: Props) {
  const authorName = project.author?.name ?? `author #${project.author.id}`;

  const resolvedCreatedLabel =
    createdLabel !== undefined
      ? createdLabel
      : project.created_at
        ? new Date(project.created_at).toLocaleDateString()
        : null;

  return (
    <div className="terminal-card transition hover:border-slate-300 hover:shadow-md">
      <div className="terminal-card-header">
        <div className="flex items-start justify-between gap-3">
          <h2 className="terminal-card-title">{project.title}</h2>
          <span className="badge-dark">{project.likes} likes</span>
        </div>

        <div className="terminal-card-meta">
          <span>by </span>
          {onAuthorClick ? (
            <button
              type="button"
              onClick={() => onAuthorClick(project.author.id)}
              className="font-semibold text-white underline decoration-white/40 underline-offset-2 transition hover:text-white/90 hover:decoration-white/70"
            >
              {authorName}
            </button>
          ) : (
            <span className="font-semibold text-white">{authorName}</span>
          )}
          {resolvedCreatedLabel ? ` | ${resolvedCreatedLabel}` : null}
        </div>
      </div>

      <div className="aspect-video w-full bg-slate-100">
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
            <span className="badge">+{project.tags.length - 6}</span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {onDetails ? (
            <button
              type="button"
              onClick={onDetails}
              className="btn-accent px-3 py-1.5 text-xs"
            >
              Details
            </button>
          ) : null}

          {isAuthor && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="btn-warning px-3 py-1.5 text-xs"
            >
              Edit
            </button>
          ) : null}

          {isAuthor && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="btn-danger px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
