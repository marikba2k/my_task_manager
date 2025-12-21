from rest_framework import serializers
from .models import Project, Task


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""
    
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Project
        fields = ['id', 'owner', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model."""
    
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'project_name', 'title', 'description',
            'status', 'priority', 'due_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'project_name', 'created_at', 'updated_at']

    def validate_project(self, value):
        """Ensure the project belongs to the authenticated user."""
        user = self.context['request'].user
        if value.owner != user:
            raise serializers.ValidationError(
                "You can only create tasks for your own projects."
            )
        return value

