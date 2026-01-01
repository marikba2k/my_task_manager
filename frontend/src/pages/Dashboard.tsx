import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "../lib/auth";
import { projectsApi } from "../lib/projects";
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
} from "../lib/projects";
import "./Dashboard.css";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => auth.getMe(),
  });

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectData) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreateForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectData }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleLogout = () => {
    auth.logout();
    onLogout();
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    createMutation.mutate({ name, description: description || undefined });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    updateMutation.mutate({
      id: editingProject.id,
      data: { name, description: description || undefined },
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

  if (userLoading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Hello, {user?.username}!</h1>
          <p className="user-info">
            ID: {user?.id} | Email: {user?.email}
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="projects-section">
          <div className="projects-header">
            <h2>Projects</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="new-project-btn"
            >
              {showCreateForm ? "Cancel" : "New Project"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreate} className="project-form">
              <h3>Create Project</h3>
              <div className="form-group">
                <label htmlFor="create-name">Name *</label>
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Project name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-description">Description</label>
                <textarea
                  id="create-description"
                  name="description"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
              {createMutation.isError && (
                <div className="error-message">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Failed to create project"}
                </div>
              )}
            </form>
          )}

          {projectsLoading && (
            <div className="loading-state">Loading projects...</div>
          )}

          {projectsError && (
            <div className="error-state">
              Error loading projects. Please try again.
            </div>
          )}

          {!projectsLoading && !projectsError && (
            <div className="projects-list">
              {projects && projects.length === 0 ? (
                <p className="empty-state">
                  No projects found. Create your first project!
                </p>
              ) : (
                <ul>
                  {projects?.map((project) => (
                    <li key={project.id}>
                      {editingProject?.id === project.id ? (
                        <form
                          onSubmit={handleUpdate}
                          className="project-form-inline"
                        >
                          <div className="form-group">
                            <input
                              name="name"
                              type="text"
                              defaultValue={project.name}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <textarea
                              name="description"
                              defaultValue={project.description || ""}
                              rows={2}
                            />
                          </div>
                          <div className="form-actions">
                            <button
                              type="submit"
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProject(null)}
                              className="cancel-btn"
                            >
                              Cancel
                            </button>
                          </div>
                          {updateMutation.isError && (
                            <div className="error-message">
                              {updateMutation.error instanceof Error
                                ? updateMutation.error.message
                                : "Failed to update project"}
                            </div>
                          )}
                        </form>
                      ) : (
                        <>
                          <div className="project-info">
                            <strong>{project.name}</strong>
                            {project.description && (
                              <p>{project.description}</p>
                            )}
                          </div>
                          <div className="project-actions">
                            <button
                              onClick={() => setEditingProject(project)}
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              disabled={deleteMutation.isPending}
                              className="delete-btn"
                            >
                              {deleteMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
