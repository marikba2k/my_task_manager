from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
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


class SignupSerializer(serializers.Serializer):
    """Serializer for user signup."""
    
    username = serializers.CharField(
        required=True,
        max_length=150,
        help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'
    )
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        help_text='Required. Must meet password validation requirements.'
    )
    
    def validate_username(self, value):
        """Check that username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value
    
    def validate_email(self, value):
        """Validate email format if provided."""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value
    
    def create(self, validated_data):
        """Create and return a new user with set_password."""
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

