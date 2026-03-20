import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Project } from "../../models/project";
import { User } from "../../models/user";

export default function ActiveProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProjects() {
            try {
                const [allProjects, user] = await Promise.all([
                    Project.getAll(),
                    User.current(),
                ]);

                const activeProjects = allProjects.filter(
                    (project) => project.isActive === true
                );

                setProjects(activeProjects);
                setCurrentUser(user);
            } catch (error) {
                console.error("Erreur lors du chargement des projets :", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const handleCreateProject = () => {
        navigate("/projects/create");
    };

    const handleDelete = async (id: number) => {
        try {
            await Project.delete(id);
            setProjects(projects.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    const handleView = (id: number) => {
        navigate(`/projects/${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`/projects/edit/${id}`);
    };

    if (loading) {
        return <div className="p-4">Chargement des projets...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projets actifs</h1>
                <button
                    onClick={handleCreateProject}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600"
                >
                    Créer un projet
                </button>
            </div>

            {projects.length === 0 ? (
                <p>Aucun projet actif trouvé.</p>
            ) : (
                <div className="grid gap-4">
                    {projects.map((project) => {
                        const isAuthor = currentUser?.id === project.authorId;

                        return (
                        <div
                            key={project.id}
                            className="p-4 border rounded-2xl shadow-sm hover:shadow-md transition"
                        >
                            <h2 className="text-lg font-semibold">{project.title}</h2>
                            <p className="text-gray-600">{project.summary}</p>
                            <p className="text-gray-600">Likes: {project.like}</p>
                            <p className="text-gray-600">Tags: {project.tags.join(", ")}</p>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleView(project.id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                                >
                                    Voir
                                </button>

                                {isAuthor ? (
                                    <button
                                        onClick={() => handleEdit(project.id)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                                    >
                                        Modifier
                                    </button>
                                ) : null}

                                {isAuthor ? (
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                    >
                                        Supprimer
                                    </button>
                                ) : null}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
