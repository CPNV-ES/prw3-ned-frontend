import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Project } from "../../models/project";
import { User } from "../../models/user";

export default function ActiveProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState("all");
    const [sortBy, setSortBy] = useState("name-asc");
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

    const availableTags = Array.from(
        new Set(projects.flatMap((project) => project.tags)),
    ).sort((a, b) => a.localeCompare(b));

    const visibleProjects = [...projects]
        .filter((project) =>
            selectedTag === "all" ? true : project.tags.includes(selectedTag),
        )
        .sort((firstProject, secondProject) => {
            switch (sortBy) {
                case "name-desc":
                    return secondProject.title.localeCompare(firstProject.title);
                case "likes-desc":
                    return secondProject.like - firstProject.like;
                case "likes-asc":
                    return firstProject.like - secondProject.like;
                case "name-asc":
                default:
                    return firstProject.title.localeCompare(secondProject.title);
            }
        });

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
                <>
                    <div className="mb-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="tagFilter"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Filter by tag
                            </label>
                            <select
                                id="tagFilter"
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All tags</option>
                                {availableTags.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="sortProjects"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Order by
                            </label>
                            <select
                                id="sortProjects"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="likes-desc">Likes (highest first)</option>
                                <option value="likes-asc">Likes (lowest first)</option>
                            </select>
                        </div>
                    </div>

                    {visibleProjects.length === 0 ? (
                        <p>No active project matches the selected tag</p>
                    ) : (
                        <div className="grid gap-4">
                            {visibleProjects.map((project) => {
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
                </>
            )}
        </div>
    );
}
