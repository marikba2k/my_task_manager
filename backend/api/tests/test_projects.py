import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import Project


@pytest.mark.django_db
class TestProjectsAuth:
    """Test projects endpoint authentication requirements."""

    def test_projects_list_requires_auth(self):
        """Test that projects list endpoint requires authentication."""
        client = APIClient()

        response = client.get("/api/projects/")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_projects_create_requires_auth(self):
        """Test that projects create endpoint requires authentication."""
        client = APIClient()
        data = {"name": "Test Project", "description": "Test"}

        response = client.post("/api/projects/", data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProjectsIsolation:
    """Test user isolation for projects."""

    def test_user_sees_only_own_projects(self):
        """Test that users only see their own projects."""
        # Create two users
        user1 = User.objects.create_user(username="user1", password="pass123")
        user2 = User.objects.create_user(username="user2", password="pass123")

        # Create projects for each user
        Project.objects.create(owner=user1, name="User1 Project")
        Project.objects.create(owner=user1, name="User1 Project 2")
        Project.objects.create(owner=user2, name="User2 Project")

        # Authenticate as user1
        client = APIClient()
        refresh = RefreshToken.for_user(user1)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        response = client.get("/api/projects/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        assert all(project["name"].startswith("User1") for project in response.data)

    def test_user_can_create_own_project(self):
        """Test that authenticated user can create their own project."""
        user = User.objects.create_user(username="user1", password="pass123")
        client = APIClient()
        refresh = RefreshToken.for_user(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        data = {"name": "My Project", "description": "My description"}

        response = client.post("/api/projects/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "My Project"
        assert response.data["owner"] == "user1"

        # Verify project was created with correct owner
        project = Project.objects.get(name="My Project")
        assert project.owner == user

