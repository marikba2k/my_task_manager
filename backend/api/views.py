from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer, SignupSerializer
from .permissions import IsProjectOwner, IsTaskProjectOwner


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health(request):
    """Health check endpoint."""
    return Response({"status": "ok"})


@api_view(['GET'])
def me(request):
    """Return authenticated user's id, username, and email."""
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def signup(request):
    """Create a new user account."""
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
