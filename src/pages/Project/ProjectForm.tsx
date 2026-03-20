import type { FormEvent } from "react";
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
    const [urlDemo, setUrlDemo] = useState("");
    const [urlRep, setUrlRep] = useState("");
    const [image, setImage] = useState("");
    const [tags, setTags] = useState("");
    const [summary, setSummary] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);

    useEffect(() => {
        let isCancelled = false;

        async function loadForm(): Promise<void> {
            try {
                if (isEditMode && projectId !== null) {
                    const project = await Project.getCurrent(projectId);

                    if (!project) {
                        if (!isCancelled) {
                            setError("Projet introuvable.");
                            setIsLoading(false);
                        }
                        return;
                    }

                    if (!isCancelled) {
                        setTitle(project.title);
                        setAuthorId(String(project.authorId));
                        setUrlDemo(project.urlDemo);
                        setUrlRep(project.urlRep);
                        setImage(project.image);
                        setTags(project.tags.join(", "));
                        setSummary(project.summary);
                        setIsLoading(false);
                    }
                    return;
                }

                const currentUser = await User.current();
                if (!isCancelled && currentUser) {
                    setAuthorId(String(currentUser.id));
                }
            } catch (loadError) {
                if (!isCancelled) {
                    setError("Impossible de charger le formulaire.");
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

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
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
                    ? "La mise a jour du projet a echoue."
                    : "La creation du projet a echoue.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-6">Chargement du formulaire...</div>;
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-6 text-2xl font-bold">
                {isEditMode ? "Modifier le projet" : "Créer un projet"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Titre du projet
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
                        Description courte du projet
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
                        htmlFor="authorId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Identifiant de l'auteur
                    </label>
                    <input
                        id="authorId"
                        type="number"
                        min="1"
                        value={authorId}
                        onChange={(e) => setAuthorId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="urlDemo"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Lien vers la démo
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
                        Lien vers le dépôt
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
                        Image du projet
                    </label>
                    <input
                        id="image"
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="default.png"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
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
                            ? "Mise a jour..."
                            : "Creation..."
                        : isEditMode
                          ? "Mettre a jour le projet"
                          : "Creer le projet"}
                </button>
            </form>
        </div>
    );
}
