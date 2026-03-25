import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Project } from "../../models/project";
import { User } from "../../models/user";

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = id ? Number(id) : null;
  const isEditMode = projectId !== null && !Number.isNaN(projectId);
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [authorUsername, setAuthorUsername] = useState("");
  const [urlDemo, setUrlDemo] = useState("");
  const [urlRep, setUrlRep] = useState("");
  const [image, setImage] = useState("");
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
        const currentUser = await User.current();

        if (isEditMode && projectId !== null) {
          const project = await Project.getCurrent(projectId);

          if (!project) {
            if (!isCancelled) {
              setError("Project not found");
              setIsLoading(false);
            }
            return;
          }

          if (!currentUser || currentUser.id !== project.authorId) {
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
            setAuthorId(String(project.authorId));
            setAuthorUsername(currentUser.username);
            setUrlDemo(project.urlDemo);
            setUrlRep(project.urlRep);
            setImage(project.image);
            setTags(project.tags.join(", "));
            setSummary(project.summary);
            setIsLoading(false);
          }
          return;
        }

        if (!isCancelled && currentUser) {
          setAuthorId(String(currentUser.id));
          setAuthorUsername(currentUser.username);
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

    try {
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Image read failed"));
        reader.readAsDataURL(file);
      });

      setImage(fileContent);
      setImageName(file.name);
      setError("");
    } catch {
      setError("The image could not be loaded.");
      e.target.value = "";
    }
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
        title,
        summary,
        urlDemo,
        urlRep,
        image,
        authorId: Number(authorId),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (isEditMode && projectId !== null) {
        await Project.update(projectId, payload);
        navigate(`/projects/${projectId}`, { replace: true });
      } else {
        const project = await Project.create(payload);
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
    return <div className="p-6">Charging the project...</div>;
  }

  if (!isAuthorized) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Return
      </button>

      <h1 className="mb-6 text-2xl font-bold">
        {isEditMode ? "Modify the project" : "Create a new project"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title of the project
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Short description of the project
          </label>
          <input
            id="summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="authorUsername"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Author
          </label>
          <input
            id="authorUsername"
            type="text"
            value={authorUsername}
            readOnly
            className="w-full cursor-not-allowed bg-gray-100 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="urlDemo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Link to the demo
          </label>
          <input
            id="urlDemo"
            type="url"
            value={urlDemo}
            onChange={(e) => setUrlDemo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="urlRep"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Link to the repository
          </label>
          <input
            id="urlRep"
            type="url"
            value={urlRep}
            onChange={(e) => setUrlRep(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Image of the project
          </label>
          <input
            id="image"
            type="file"
            accept=".png,image/png"
            onChange={handleImageChange}
            className="block w-full rounded-xl border border-dashed border-blue-300 bg-blue-50 px-3 py-3 text-sm text-blue-900 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={!isEditMode && !image}
          />
          <p className="mt-1 text-sm text-blue-800">
            {imageName
              ? `Selected PNG: ${imageName}`
              : isEditMode && image
                ? "Current image kept until you choose a new PNG."
                : "No file selected."}
          </p>
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, typescript, api"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
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
  );
}
