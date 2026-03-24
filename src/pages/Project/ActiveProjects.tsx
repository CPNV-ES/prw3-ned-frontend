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
                console.error("Error during the loading of the projects:", error);
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
            console.error("Error during the deleting of the project :", error);
        }
    };

    const handleView = (id: number) => {
        navigate(`/projects/${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`/projects/edit/${id}`);
    };

    if (loading) {
        return <div className="p-4">Charging the projects...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-blue-500 hover:underline"
                >
                    ← Return
                </button>
                <h1 className="text-2xl font-bold">Active projects</h1>
                <button
                    onClick={handleCreateProject}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600"
                >
                    Create a new project
                </button>
            </div>

            {projects.length === 0 ? (
                <p>No active project has been found</p>
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
                                        See in detail
                                    </button>

                                    {isAuthor ? (
                                        <button
                                            onClick={() => handleEdit(project.id)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                                        >
                                            Modify
                                        </button>
                                    ) : null}

                                    {isAuthor ? (
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                        >
                                            Delete
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
