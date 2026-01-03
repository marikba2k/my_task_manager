import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


@pytest.mark.django_db
class TestSignup:
    """Test signup endpoint."""

    def test_signup_success(self):
        """Test successful user signup."""
        client = APIClient()
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!",
        }

        response = client.post("/api/auth/signup/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["username"] == "testuser"
        assert response.data["email"] == "test@example.com"
        assert "id" in response.data
        assert "password" not in response.data

        # Verify user was created
        user = User.objects.get(username="testuser")
        assert user.email == "test@example.com"
        assert user.check_password("TestPass123!")

    def test_signup_without_email(self):
        """Test signup with optional email omitted."""
        client = APIClient()
        data = {
            "username": "testuser2",
            "password": "TestPass123!",
        }

        response = client.post("/api/auth/signup/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["username"] == "testuser2"
        assert response.data["email"] == ""

    def test_signup_duplicate_username(self):
        """Test signup with duplicate username fails."""
        User.objects.create_user(username="existing", password="pass123")
        client = APIClient()
        data = {
            "username": "existing",
            "password": "TestPass123!",
        }

        response = client.post("/api/auth/signup/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "username" in response.data

