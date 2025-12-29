from django.contrib import admin
from .models import Project, Task


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin interface for Project model."""
    
    list_display = ['name', 'owner', 'created_at']
    list_filter = ['created_at', 'owner']
    search_fields = ['name', 'description', 'owner__username']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('owner', 'name', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """Admin interface for Task model."""
    
    list_display = ['title', 'project', 'status', 'priority', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'created_at', 'due_date', 'project']
    search_fields = ['title', 'description', 'project__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('project', 'title', 'description')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'due_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
