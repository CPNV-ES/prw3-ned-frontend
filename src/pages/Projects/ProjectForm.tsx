import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";
import { createProject, getProject, updateProject } from "../../api/projects";

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = id ? Number(id) : null;
  const isEditMode = projectId !== null && !Number.isNaN(projectId);
  const [title, setTitle] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [tags, setTags] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isAuthorized, setIsAuthorized] = useState(!isEditMode);

  useEffect(() => {
    let isCancelled = false;

    async function loadForm(): Promise<void> {
      try {
        const currentUser = await getCurrentUser();

        if (isEditMode && projectId !== null) {
          const project = await getProject(projectId);

          if (!project) {
            if (!isCancelled) {
              setError("Project not found");
              setIsLoading(false);
            }
            return;
          }

          if (!currentUser || currentUser.id !== project.author_id) {
            if (!isCancelled) {
              setError("Only the author can modify this project.");
              setIsAuthorized(false);
              setIsLoading(false);
            }
            return;
          }

          if (!isCancelled) {
            setIsAuthorized(true);
            setTitle(project.title);
            setDemoUrl(project.demo_url);
            setRepositoryUrl(project.repository_url);
            setExistingImageUrl(project.image_url ?? "");
            setImage(null);
            setTags(project.tags.join(", "));
            setSummary(project.summary);
            setIsLoading(false);
          }
          return;
        }

        if (!isCancelled && currentUser) {
          setIsAuthorized(true);
        }
      } catch {
        if (!isCancelled) {
          setError("Impossible to charge the form.");
        }
      } finally {
        if (!isCancelled && !isEditMode) {
          setIsLoading(false);
        }
      }
    }

    loadForm();

    return () => {
      isCancelled = true;
    };
  }, [isEditMode, projectId]);

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const isPng =
      file.type === "image/png" || file.name.toLowerCase().endsWith(".png");

    if (!isPng) {
      setError("Only PNG images are allowed.");
      e.target.value = "";
      return;
    }

    setImage(file);
    setImageName(file.name);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      if (!isAuthorized) {
        throw new Error("Unauthorized project edit");
      }

      const payload = {
        title: title,
        summary: summary,
        demo_url: demoUrl,
        repository_url: repositoryUrl,
        image: image ?? undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (!isEditMode && !image) {
        throw new Error("Image is required for project creation");
      }

      if (isEditMode && projectId !== null) {
        await updateProject(projectId, payload);
        navigate(`/projects/${projectId}`, { replace: true });
      } else {
        const project = await createProject(payload);
        navigate(`/projects/${project.id}`, { replace: true });
      }
    } catch {
      setError(
        isEditMode
          ? "The update of the project has failed."
          : "The cration of the project has failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="app-container">Loading project...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="app-container">
        <div className="tech-surface p-6 text-sm text-rose-700">{error}</div>
      </div>
    );
  }

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
          <div className="text-xs uppercase tracking-widest text-slate-300">
            {isEditMode ? "Edit" : "Create"}
          </div>
          <h1 className="mt-1 text-xl font-bold text-white">
            {isEditMode ? "Modify the project" : "Create a new project"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="title" className="label">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="summary" className="label">
                Summary
              </label>
              <input
                id="summary"
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="urlDemo" className="label">
                Demo URL
              </label>
              <input
                id="urlDemo"
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="urlRep" className="label">
                Repository URL
              </label>
              <input
                id="urlRep"
                type="url"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="tags" className="label">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, typescript, api"
                className="input"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Comma-separated values.
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="label">
                Project image
              </label>
              <input
                id="image"
                type="file"
                accept=".png,image/png"
                onChange={handleImageChange}
                className="block w-full rounded-xl border border-dashed border-slate-300 bg-white/80 px-3 py-3 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required={!isEditMode && !image}
              />
              <p className="mt-1 text-xs text-slate-500">
                {imageName
                  ? `Selected PNG: ${imageName}`
                  : isEditMode && existingImageUrl
                    ? "Current image kept until you choose a new PNG."
                    : "No file selected."}
              </p>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update the project"
                : "Create the project"}
          </button>
        </form>
      </div>
    </div>
  );
}
