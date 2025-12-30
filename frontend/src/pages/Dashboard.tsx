import { useQuery } from '@tanstack/react-query';
import { auth } from '../lib/auth';
import { apiClient } from '../lib/api';
import './Dashboard.css';

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => auth.getMe(),
  });

  const { data: projects, isLoading: projectsLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>('/projects/');
      return response.data;
    },
    enabled: false, // Only fetch when button is clicked
  });

  const handleLogout = () => {
    auth.logout();
    window.location.reload();
  };

  const handleLoadProjects = () => {
    refetch();
  };

  if (userLoading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Hello, {user?.username}!</h1>
          <p className="user-info">ID: {user?.id} | Email: {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <button onClick={handleLoadProjects} disabled={projectsLoading} className="load-btn">
          {projectsLoading ? 'Loading...' : 'Load Projects'}
        </button>

        {projects && (
          <div className="projects-list">
            <h2>Projects ({projects.length})</h2>
            {projects.length === 0 ? (
              <p className="empty-state">No projects found.</p>
            ) : (
              <ul>
                {projects.map((project) => (
                  <li key={project.id}>
                    <strong>{project.name}</strong>
                    {project.description && <p>{project.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

