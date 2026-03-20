import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Example fake data
const users = [
  { id: 1, name: "John Doe", username: "johndoe" },
  { id: 2, name: "Jane Smith", username: "janesmith" },
];
let projects = [
  { id:1, title: "Project 1", summary: "yippie", urlDemo: "link", urlRep: "link", image: "default.png", authorId:1, like: 0, tags: ["yup", "yes"], isActive: true, likedBy: [] as number[] },
  { id:2, title: "Project 2", summary: "yippeie", urlDemo: "link", urlRep: "link", image: "default.png", authorId:2, like: 1110, tags: ["yeeup"], isActive: false, likedBy: [] as number[] },
  { id:3, title: "Project 3", summary: "whoops", urlDemo: "link", urlRep: "link", image: "default.png", authorId:2, like: 5, tags: ["yup", "yipie"], isActive: true, likedBy: [] as number[] }
];

type ProjectRequestBody = {
  title?: string;
  summary?: string;
  urlDemo?: string;
  urlRep?: string;
  image?: string;
  authorId?: number;
  tags?: string[];
};

type LikeRequestBody = {
  userId?: number;
};

//--- login ---
app.get("/api/sessions", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token === "fake-token-123") {
    res.json({ user: users[0] });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/api/sessions", (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (password === "password123" && user) {
    res.json({
      user: { id: user.id, name: user.name, username: user.username },
      token: "Fake fake-token-123",
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.delete("/api/sessions", (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

//--- Projects ---

app.get("/api/projects", (req: Request, res: Response) => {
  res.json(projects);
}); 

app.get("/api/projects/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const project = projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

app.post("/api/projects", (req: Request, res: Response) => {
  const { title, summary, urlDemo, urlRep, image, authorId, tags } =
    req.body as ProjectRequestBody;

  if (
    !title ||
    !summary ||
    !urlDemo ||
    !urlRep ||
    !image ||
    typeof authorId !== "number" ||
    !Array.isArray(tags)
  ) {
    return res.status(400).json({ error: "Invalid project payload" });
  }

  const newProject = {
    id: Date.now(),
    title,
    summary,
    urlDemo,
    urlRep,
    image,
    authorId,
    tags,
    isActive: true,
    like: 0,
    likedBy: [] as number[],
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.delete("/api/projects/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  projects = projects.filter(p => p.id !== id);
  res.json({ message: "Deleted" });
});

app.patch("/api/projects/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  projects[index] = { ...projects[index], ...req.body };
  res.json(projects[index]);
});

app.post("/api/projects/:id/like", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { userId } = req.body as LikeRequestBody;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (typeof userId !== "number") {
    return res.status(400).json({ error: "Invalid user id" });
  }

  if (!project.likedBy.includes(userId)) {
    project.likedBy.push(userId);
    project.like += 1;
  }

  res.json(project);
});

//--- Others ---

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Fake server running at http://localhost:${PORT}`);
});
