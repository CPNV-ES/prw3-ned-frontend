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
const projects = [
 { id:1, title: "Project 1", summary: "yippie", urlDemo: "link", urlRep: "link", image: "default.png", authorId:1, like: 0, tags: ["yup", "yes"] },
 { id:2, title: "Project 2", summary: "yippeie", urlDemo: "link", urlRep: "link", image: "default.png", authorId:2, like: 1110, tags: ["yeeup"] }
];

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

// 6 apps to do


//--- Others ---

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Fake server running at http://localhost:${PORT}`);
});
