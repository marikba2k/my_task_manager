from rest_framework import permissions  # pyright: ignore[reportMissingImports]


class IsProjectOwner(permissions.BasePermission):
    """Permission to only allow owners of a project to access it."""

    def has_permission(self, request, view):
        """Require authentication for all actions."""
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """Check if the user is the owner of the project."""
        return obj.owner == request.user


class IsTaskProjectOwner(permissions.BasePermission):
    """Permission to only allow owners of a task's project to access it."""

    def has_permission(self, request, view):
        """Require authentication for all actions."""
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """Check if the user is the owner of the task's project."""
        return obj.project.owner == request.user

