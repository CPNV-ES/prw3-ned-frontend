import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ActiveProjects from "./pages/Project/ActiveProjects";
import DetailProject from "./pages/Project/DetailProject";
import ProjectForm from "./pages/Project/ProjectForm";
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
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/projects" element={<ActiveProjects />} />
          <Route path="/projects/create" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<DetailProject />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
