import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import Project, Task


@pytest.mark.django_db
class TestTaskProjectOwnership:
    """Test task creation with project ownership validation."""

    def test_cannot_create_task_for_other_users_project(self):
        """Test that users cannot create tasks for projects they don't own."""
        # Create two users
        user1 = User.objects.create_user(username="user1", password="pass123")
        user2 = User.objects.create_user(username="user2", password="pass123")

        # Create a project owned by user1
        project = Project.objects.create(owner=user1, name="User1 Project")

        # Authenticate as user2
        client = APIClient()
        refresh = RefreshToken.for_user(user2)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        # Try to create a task for user1's project
        data = {
            "project": project.id,
            "title": "Unauthorized Task",
            "description": "Should fail",
        }

        response = client.post("/api/tasks/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "project" in response.data
        assert "own projects" in str(response.data["project"][0]).lower()

        # Verify task was not created
        assert Task.objects.filter(title="Unauthorized Task").count() == 0

    def test_can_create_task_for_own_project(self):
        """Test that users can create tasks for their own projects."""
        user = User.objects.create_user(username="user1", password="pass123")
        project = Project.objects.create(owner=user, name="My Project")

        client = APIClient()
        refresh = RefreshToken.for_user(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        data = {
            "project": project.id,
            "title": "My Task",
            "description": "My task description",
            "status": "todo",
            "priority": "high",
        }

        response = client.post("/api/tasks/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "My Task"
        assert response.data["project"] == project.id

        # Verify task was created
        task = Task.objects.get(title="My Task")
        assert task.project == project
        assert task.project.owner == user

