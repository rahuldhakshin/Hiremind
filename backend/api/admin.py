from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, StudentProfile, RecruiterProfile, JobPosting, Application,
    InterviewSchedule, PlacementDrive, AlumniProfile, Review,
    Notification, ChatMessage, Feedback, SkillCourse, StudentCourseProgress
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'profile_picture')}),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'roll_number', 'department', 'cgpa', 'is_placed')
    list_filter = ('department', 'is_placed', 'batch_year')
    search_fields = ('user__first_name', 'user__last_name', 'roll_number')


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'industry', 'contact_email')
    search_fields = ('company_name', 'industry')


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'recruiter', 'job_type', 'status', 'application_deadline')
    list_filter = ('status', 'job_type')
    search_fields = ('title', 'description')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'job', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('student__first_name', 'job__title')


@admin.register(InterviewSchedule)
class InterviewScheduleAdmin(admin.ModelAdmin):
    list_display = ('application', 'round_type', 'scheduled_date', 'result')
    list_filter = ('round_type', 'result')


@admin.register(PlacementDrive)
class PlacementDriveAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'drive_date', 'status')
    list_filter = ('status',)


@admin.register(AlumniProfile)
class AlumniProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_company', 'current_role', 'graduation_year')
    search_fields = ('user__first_name', 'current_company')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'company_name', 'rating', 'created_at')
    list_filter = ('rating',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'is_read', 'created_at')


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'feedback_type', 'title', 'rating', 'created_at')
    list_filter = ('feedback_type',)


@admin.register(SkillCourse)
class SkillCourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'provider', 'price')
    list_filter = ('category',)


@admin.register(StudentCourseProgress)
class StudentCourseProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'progress_percentage')
    list_filter = ('status',)