from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    """Project model representing a user's project."""
    
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects',
        help_text='The user who owns this project'
    )
    name = models.CharField(
        max_length=200,
        help_text='Project name'
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Optional project description'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When the project was created'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return self.name


class Task(models.Model):
    """Task model representing a task within a project."""
    
    class Status(models.TextChoices):
        TODO = 'todo', 'Todo'
        DOING = 'doing', 'Doing'
        DONE = 'done', 'Done'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks',
        help_text='The project this task belongs to'
    )
    title = models.CharField(
        max_length=200,
        help_text='Task title'
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Optional task description'
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.TODO,
        help_text='Current status of the task'
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        help_text='Priority level of the task'
    )
    due_date = models.DateField(
        blank=True,
        null=True,
        help_text='Optional due date for the task'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When the task was created'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='When the task was last updated'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['project', 'priority']),
        ]

    def __str__(self):
        return f"{self.title} ({self.project.name})"
