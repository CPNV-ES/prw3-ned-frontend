import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Project } from "../../models/project";
import { User } from "../../models/user";

export default function DetailProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const [data, user] = await Promise.all([
          Project.getCurrent(projectId),
          User.current(),
        ]);
        setProject(data);
        setCurrentUser(user);
      } catch (error) {
        console.error("Erreur chargement projet:", error);
        setError("Impossible de charger le projet.");
      } finally {
        setLoading(false);
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
      const updatedProject = await Project.liked(project.id, currentUser);
      setProject(updatedProject);
    } catch (likeError) {
      console.error("Erreur ajout du like:", likeError);
      setError("Impossible d'ajouter un like pour le moment.");
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return <div className="p-6">Charging the project...</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  const isAuthor = currentUser?.id === project.authorId;
  const hasLiked =
    currentUser !== null && project.likedBy?.includes(currentUser.id) === true;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Return
      </button>

      <div className="border rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">{project.title}</h1>

        <img
          src={project.image}
          alt={project.title}
          className="w-full h-60 object-cover rounded-xl mb-4"
        />

        <p className="text-gray-700 mb-4">{project.summary}</p>

        <div className="mb-4">
          <strong>Author :</strong>{" "}
          {project.authorUsername ?? `#${project.authorId}`}
        </div>

        <div className="mb-4">
          <strong>Tags :</strong> {project.tags.join(", ")}
        </div>

        <div className="mb-4">
          <strong>Likes :</strong> {project.like}
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-4 mt-6">
          {isAuthor! ? null : (
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking || currentUser === null}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLiking
                ? "Updating..."
                : hasLiked
                  ? "Remove the like"
                  : "Like the project"}
            </button>
          )}

          <a
            href={project.urlDemo}
            target="_blank"
            rel="noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
          >
            See the demo
          </a>

          <a
            href={project.urlRep}
            target="_blank"
            rel="noreferrer"
            className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-900"
          >
            See the repository
          </a>

          {isAuthor ? (
            <button
              type="button"
              onClick={() => navigate(`/projects/edit/${project.id}`)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600"
            >
              Modify
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
