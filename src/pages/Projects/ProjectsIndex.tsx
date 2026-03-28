import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Project } from "../../models/project";
import { User } from "../../models/user";

type SortOption = "date-desc" | "date-asc" | "likes-desc" | "likes-asc";

export default function ProjectsIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nameQuery, setNameQuery] = useState("");
  const [tagsQuery, setTagsQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("date-desc");

  const [appliedNameQuery, setAppliedNameQuery] = useState("");
  const [appliedTagsQuery, setAppliedTagsQuery] = useState("");
  const [appliedSort, setAppliedSort] = useState<SortOption>("date-desc");
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    async function fetchCurrentUser() {
      try {
        const user = await User.current();
        if (!isCancelled) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error during the loading of the projects:", error);
      }
    }

    fetchCurrentUser();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProjects() {
      setLoading(true);
      setError("");

      const trimmedName = appliedNameQuery.trim();
      const tags = appliedTagsQuery
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const [sortBy, order] = appliedSort.split("-") as [
        "date" | "likes",
        "asc" | "desc",
      ];

      try {
        const allProjects = await Project.getAll({
          name: trimmedName ? trimmedName : undefined,
          tags: tags.length > 0 ? tags : undefined,
          sortBy,
          order,
        });

        if (!isCancelled) {
          setProjects(allProjects);
        }
      } catch (error) {
        console.error("Error during the loading of the projects:", error);
        if (!isCancelled) {
          setError("Unable to load the projects.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isCancelled = true;
    };
  }, [appliedNameQuery, appliedTagsQuery, appliedSort]);

  const handleCreateProject = () => {
    navigate("/projects/create");
  };

  const handleDelete = async (id: number) => {
    try {
      await Project.delete(id);
      setProjects((currentProjects) =>
        currentProjects.filter((p) => p.id !== id),
      );
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-500 hover:underline"
        >
          ← Return
        </button>
        <button
          onClick={handleCreateProject}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600"
        >
          Create a new project
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="mb-6 space-y-4">
        <div>
          <label
            htmlFor="projectName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Search by name
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              id="projectName"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="Demo Deck"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => setAppliedNameQuery(nameQuery)}
              disabled={loading}
              className="shrink-0 bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600 disabled:bg-gray-400"
            >
              Search
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <div>
              <label
                htmlFor="projectTags"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Filter by tags
              </label>
              <input
                id="projectTags"
                value={tagsQuery}
                onChange={(e) => setTagsQuery(e.target.value)}
                placeholder="react, typescript"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="sortProjects"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Sort
              </label>
              <select
                id="sortProjects"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Creation date (newest first)</option>
                <option value="date-asc">Creation date (oldest first)</option>
                <option value="likes-desc">Likes (highest first)</option>
                <option value="likes-asc">Likes (lowest first)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setAppliedTagsQuery(tagsQuery);
                setAppliedSort(sort);
              }}
              disabled={loading}
              className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600 disabled:bg-gray-400"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>

      {loading ? <div className="p-4">Loading the projects...</div> : null}

      {!loading && projects.length === 0 ? <p>No projects found</p> : null}

      {projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project) => {
            const isAuthor = currentUser?.id === project.author_id;

            return (
              <div
                key={project.id}
                className="p-4 border rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold">{project.title}</h2>
                <p className="text-gray-600">{project.summary}</p>
                <p className="text-gray-600">Likes: {project.likes}</p>
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
      ) : null}
    </div>
  );
}
