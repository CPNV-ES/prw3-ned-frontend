import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../../models/project";

export default function ProjectForm() { //optionnal project, if project not null -> update else -> create
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [urlDemo, setUrlDemo] = useState("");
    const [urlRep, setUrlRep] = useState("");
    const [image, setImage] = useState("");
    const [tags, setTags] = useState("");
    const [summary, setSummary] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            await Project.create(title, summary, urlDemo, urlRep, image, author, 0, tags );
            navigate("/api/projects", { replace: true });
        } catch {
            setError("Invalid username or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                    Description court du projet
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
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Auteur du projet
                </label>
                <input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)} //set the value of this to the id of the user
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
                    type="file"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
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
                    type="text" //liste d'éléments -> tags
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
                {isSubmitting ? "Creating it..." : "Create the project"}
            </button>
        </form>
    )
}