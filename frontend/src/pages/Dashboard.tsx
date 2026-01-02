import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "../lib/auth";
import { projectsApi } from "../lib/projects";
import { tasksApi } from "../lib/tasks";
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
} from "../lib/projects";
import type { Task, CreateTaskData, UpdateTaskData } from "../lib/tasks";
import "./Dashboard.css";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskStatus, setTaskStatus] = useState<"todo" | "doing" | "done" | "">(
    ""
  );
  const [taskPriority, setTaskPriority] = useState<
    "low" | "medium" | "high" | ""
  >("");
  const [taskSearch, setTaskSearch] = useState("");

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

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: [
      "tasks",
      selectedProjectId,
      taskStatus || null,
      taskPriority || null,
      taskSearch || null,
    ],
    queryFn: () =>
      tasksApi.list({
        project: selectedProjectId || undefined,
        status: taskStatus || undefined,
        priority: taskPriority || undefined,
        search: taskSearch || undefined,
      }),
    enabled: !!selectedProjectId,
  });

  // Project mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: CreateProjectData) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreateForm(false);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectData }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditingProject(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (selectedProjectId === deletedId) {
        setSelectedProjectId(null);
      }
    },
  });

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowCreateTaskForm(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskData }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleLogout = () => {
    auth.logout();
    onLogout();
  };

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    createProjectMutation.mutate({
      name,
      description: description || undefined,
    });
  };

  const handleUpdateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    updateProjectMutation.mutate({
      id: editingProject.id,
      data: { name, description: description || undefined },
    });
  };

  const handleDeleteProject = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(id);
    setShowCreateTaskForm(false);
    setEditingTask(null);
    setTaskStatus("");
    setTaskPriority("");
    setTaskSearch("");
  };

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "todo" | "doing" | "done";
    const priority = formData.get("priority") as "low" | "medium" | "high";
    const due_date = formData.get("due_date") as string;

    createTaskMutation.mutate({
      project: selectedProjectId,
      title,
      description: description || undefined,
      status: status || undefined,
      priority: priority || undefined,
      due_date: due_date || undefined,
    });
  };

  const handleUpdateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "todo" | "doing" | "done";
    const priority = formData.get("priority") as "low" | "medium" | "high";
    const due_date = formData.get("due_date") as string;

    updateTaskMutation.mutate({
      id: editingTask.id,
      data: {
        title,
        description: description || undefined,
        status: status || undefined,
        priority: priority || undefined,
        due_date: due_date || undefined,
      },
    });
  };

  const handleDeleteTask = (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
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
        <div className="dashboard-grid">
          {/* Projects Section */}
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
              <form onSubmit={handleCreateProject} className="project-form">
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
                  <button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
                {createProjectMutation.isError && (
                  <div className="error-message">
                    {createProjectMutation.error instanceof Error
                      ? createProjectMutation.error.message
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
                      <li
                        key={project.id}
                        className={
                          selectedProjectId === project.id ? "selected" : ""
                        }
                      >
                        {editingProject?.id === project.id ? (
                          <form
                            onSubmit={handleUpdateProject}
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
                                disabled={updateProjectMutation.isPending}
                              >
                                {updateProjectMutation.isPending
                                  ? "Saving..."
                                  : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProject(null)}
                                className="cancel-btn"
                              >
                                Cancel
                              </button>
                            </div>
                            {updateProjectMutation.isError && (
                              <div className="error-message">
                                {updateProjectMutation.error instanceof Error
                                  ? updateProjectMutation.error.message
                                  : "Failed to update project"}
                              </div>
                            )}
                          </form>
                        ) : (
                          <>
                            <div
                              className="project-info"
                              onClick={() => handleSelectProject(project.id)}
                              style={{ cursor: "pointer" }}
                            >
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
                                onClick={() => handleDeleteProject(project.id)}
                                disabled={deleteProjectMutation.isPending}
                                className="delete-btn"
                              >
                                {deleteProjectMutation.isPending
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

          {/* Tasks Section */}
          <div className="tasks-section">
            {selectedProject ? (
              <>
                <div className="tasks-header">
                  <h2>Tasks for {selectedProject.name}</h2>
                  <button
                    onClick={() => setShowCreateTaskForm(!showCreateTaskForm)}
                    className="new-task-btn"
                  >
                    {showCreateTaskForm ? "Cancel" : "New Task"}
                  </button>
                </div>

                {showCreateTaskForm && (
                  <form onSubmit={handleCreateTask} className="task-form">
                    <h3>Create Task</h3>
                    <div className="form-group">
                      <label htmlFor="create-title">Title *</label>
                      <input
                        id="create-title"
                        name="title"
                        type="text"
                        required
                        placeholder="Task title"
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
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="create-status">Status</label>
                        <select id="create-status" name="status">
                          <option value="todo">Todo</option>
                          <option value="doing">Doing</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="create-priority">Priority</label>
                        <select id="create-priority" name="priority">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="create-due-date">Due Date</label>
                      <input id="create-due-date" name="due_date" type="date" />
                    </div>
                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={createTaskMutation.isPending}
                      >
                        {createTaskMutation.isPending
                          ? "Creating..."
                          : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateTaskForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                    {createTaskMutation.isError && (
                      <div className="error-message">
                        {createTaskMutation.error instanceof Error
                          ? createTaskMutation.error.message
                          : "Failed to create task"}
                      </div>
                    )}
                  </form>
                )}

                <div className="tasks-filters">
                  <div className="form-group">
                    <label htmlFor="filter-status">Status</label>
                    <select
                      id="filter-status"
                      value={taskStatus}
                      onChange={(e) =>
                        setTaskStatus(
                          e.target.value as "todo" | "doing" | "done" | ""
                        )
                      }
                    >
                      <option value="">All</option>
                      <option value="todo">Todo</option>
                      <option value="doing">Doing</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="filter-priority">Priority</label>
                    <select
                      id="filter-priority"
                      value={taskPriority}
                      onChange={(e) =>
                        setTaskPriority(
                          e.target.value as "low" | "medium" | "high" | ""
                        )
                      }
                    >
                      <option value="">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="filter-search">Search</label>
                    <input
                      id="filter-search"
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                    />
                  </div>
                </div>

                {tasksLoading && (
                  <div className="loading-state">Loading tasks...</div>
                )}

                {tasksError && (
                  <div className="error-state">
                    Error loading tasks. Please try again.
                  </div>
                )}

                {!tasksLoading && !tasksError && (
                  <div className="tasks-list">
                    {tasks && tasks.length === 0 ? (
                      <p className="empty-state">
                        No tasks found. Create your first task!
                      </p>
                    ) : (
                      <ul>
                        {tasks?.map((task) => (
                          <li key={task.id}>
                            {editingTask?.id === task.id ? (
                              <form
                                onSubmit={handleUpdateTask}
                                className="task-form-inline"
                              >
                                <div className="form-group">
                                  <input
                                    name="title"
                                    type="text"
                                    defaultValue={task.title}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <textarea
                                    name="description"
                                    defaultValue={task.description || ""}
                                    rows={2}
                                  />
                                </div>
                                <div className="form-row">
                                  <div className="form-group">
                                    <select
                                      name="status"
                                      defaultValue={task.status}
                                    >
                                      <option value="todo">Todo</option>
                                      <option value="doing">Doing</option>
                                      <option value="done">Done</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <select
                                      name="priority"
                                      defaultValue={task.priority}
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <input
                                      name="due_date"
                                      type="date"
                                      defaultValue={
                                        task.due_date
                                          ? task.due_date.split("T")[0]
                                          : ""
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="form-actions">
                                  <button
                                    type="submit"
                                    disabled={updateTaskMutation.isPending}
                                  >
                                    {updateTaskMutation.isPending
                                      ? "Saving..."
                                      : "Save"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTask(null)}
                                    className="cancel-btn"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                {updateTaskMutation.isError && (
                                  <div className="error-message">
                                    {updateTaskMutation.error instanceof Error
                                      ? updateTaskMutation.error.message
                                      : "Failed to update task"}
                                  </div>
                                )}
                              </form>
                            ) : (
                              <>
                                <div className="task-info">
                                  <strong>{task.title}</strong>
                                  {task.description && (
                                    <p>{task.description}</p>
                                  )}
                                  <div className="task-meta">
                                    <span className={`status-${task.status}`}>
                                      {task.status}
                                    </span>
                                    <span
                                      className={`priority-${task.priority}`}
                                    >
                                      {task.priority}
                                    </span>
                                    {task.due_date && (
                                      <span className="due-date">
                                        Due: {formatDate(task.due_date)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="task-actions">
                                  <button
                                    onClick={() => setEditingTask(task)}
                                    className="edit-btn"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    disabled={deleteTaskMutation.isPending}
                                    className="delete-btn"
                                  >
                                    {deleteTaskMutation.isPending
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
              </>
            ) : (
              <div className="tasks-placeholder">
                <p>Select a project to view tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
