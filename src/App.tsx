import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProjectsIndex from "./pages/Projects/ProjectsIndex";
import ProjectDetail from "./pages/Projects/ProjectShow";
import ProjectForm from "./pages/Projects/ProjectForm";
import UserShow from "./pages/Users/UserShow";
import NotFound from "./pages/NotFound";
import { GuestRoute, ProtectedRoute } from "./routes/AuthGuards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/projects" element={<ProjectsIndex />} />
          <Route path="/projects/create" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/users/:id" element={<UserShow />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
