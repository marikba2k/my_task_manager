from rest_framework import viewsets, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer
from .permissions import IsProjectOwner, IsTaskProjectOwner


@api_view(['GET'])
def health(request):
    """Health check endpoint."""
    return Response({"status": "ok"})


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing projects."""
    
    serializer_class = ProjectSerializer
    permission_classes = [IsProjectOwner]

    def get_queryset(self):
        """Return only projects owned by the authenticated user."""
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """Set owner to the authenticated user on create."""
        serializer.save(owner=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing tasks."""
    
    serializer_class = TaskSerializer
    permission_classes = [IsTaskProjectOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'status', 'priority']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only tasks from projects owned by the authenticated user."""
        return Task.objects.filter(project__owner=self.request.user)
