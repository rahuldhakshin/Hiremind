from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),                      # NEW: JWT blacklist logout
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.get_profile, name='get_profile'),

    # Student Profile
    path('student/profile/', views.StudentProfileView.as_view(), name='student_profile'),
    path('students/', views.StudentListView.as_view(), name='student_list'),

    # Recruiter Profile
    path('recruiter/profile/', views.RecruiterProfileView.as_view(), name='recruiter_profile'),

    # Jobs — literal paths BEFORE parameterised <int:pk> paths
    path('jobs/', views.JobPostingListView.as_view(), name='job_list'),
    path('jobs/create/', views.JobPostingCreateView.as_view(), name='job_create'),
    path('jobs/my-jobs/', views.RecruiterJobsView.as_view(), name='recruiter_jobs'),
    path('jobs/pending/', views.PendingJobsView.as_view(), name='pending_jobs'),
    path('jobs/<int:pk>/', views.JobPostingDetailView.as_view(), name='job_detail'),
    path('jobs/<int:pk>/approve/', views.JobApprovalView.as_view(), name='job_approve'),
    path('jobs/<int:pk>/skill-gap/', views.skill_gap, name='skill_gap'),

    # Applications
    path('applications/apply/', views.ApplyJobView.as_view(), name='apply_job'),
    path('applications/my/', views.StudentApplicationsView.as_view(), name='my_applications'),
    path('applications/job/<int:job_id>/', views.JobApplicationsView.as_view(), name='job_applications'),
    path('applications/<int:pk>/status/', views.UpdateApplicationStatusView.as_view(), name='update_application'),
    path('applications/<int:pk>/withdraw/', views.withdraw_application, name='withdraw_application'),  # NEW

    # Interviews
    path('interviews/create/', views.InterviewScheduleCreateView.as_view(), name='create_interview'),
    path('interviews/my/', views.StudentInterviewsView.as_view(), name='my_interviews'),
    path('interviews/<int:pk>/update/', views.InterviewScheduleUpdateView.as_view(), name='update_interview'),  # NEW

    # Placement Drives
    path('drives/', views.PlacementDriveListView.as_view(), name='drive_list'),
    path('drives/<int:pk>/', views.PlacementDriveDetailView.as_view(), name='drive_detail'),           # NEW
    path('drives/<int:pk>/register/', views.PlacementDriveRegisterView.as_view(), name='drive_register'),

    # Alumni
    path('alumni/', views.AlumniListView.as_view(), name='alumni_list'),
    path('alumni/create/', views.AlumniProfileCreateView.as_view(), name='alumni_create'),             # NEW
    path('alumni/my/', views.AlumniProfileUpdateView.as_view(), name='alumni_my'),                     # NEW
    path('alumni/<int:pk>/', views.AlumniDetailView.as_view(), name='alumni_detail'),

    # Reviews
    path('reviews/', views.ReviewListCreateView.as_view(), name='review_list'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review_detail'),                 # NEW

    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/read/', views.mark_notification_read, name='mark_read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark_all_read'),

    # Chat
    path('chat/<int:user_id>/', views.ChatMessageListView.as_view(), name='chat_messages'),
    path('chat/contacts/', views.chat_contacts, name='chat_contacts'),

    # Feedback
    path('feedback/', views.FeedbackListCreateView.as_view(), name='feedback_list'),
    path('feedback/<int:pk>/', views.FeedbackDetailView.as_view(), name='feedback_detail'),             # NEW

    # Skills & Courses
    path('courses/', views.SkillCourseListView.as_view(), name='course_list'),
    path('courses/progress/', views.StudentCourseProgressView.as_view(), name='course_progress'),
    path('courses/progress/<int:pk>/', views.UpdateCourseProgressView.as_view(), name='update_progress'),

    # Analytics
    path('analytics/', views.placement_analytics, name='analytics'),

    # Admin
    path('admin/students/', views.AdminStudentListView.as_view(), name='admin_students'),
    path('admin/all-users/', views.AdminAllUsersListView.as_view(), name='admin_all_users'),
    path('admin/users/<int:pk>/', views.AdminUserUpdateView.as_view(), name='admin_user_update'),
    path('admin/system-stats/', views.admin_system_stats, name='admin_system_stats'),

    # ── Upgrade 1: Placement Predictor (ML) ──────────────────────────
    path('predict/placement/', views.placement_prediction, name='placement_predict'),
    path('predict/train/', views.train_placement_model, name='train_model'),

    # ── Upgrade 2: Resume Parser ─────────────────────────────────────
    path('resume/parse/', views.parse_resume, name='parse_resume'),
    path('resume/review/', views.resume_ats_review, name='resume_ats_review'),
    path('resume/interview-questions/', views.resume_interview_questions, name='resume_interview_questions'),

    # ── Auto-Apply: Upload resume → auto-apply to matching jobs ──────
    path('resume/auto-apply/', views.auto_apply_from_resume, name='auto_apply'),

    # ── Cover Letter per job ──────────────────────────────────────────
    path('jobs/<int:pk>/cover-letter/', views.generate_cover_letter_view, name='cover_letter'),

    # ── Upgrade 6: Report Exports ─────────────────────────────────────
    path('reports/placement.pdf', views.export_placement_pdf, name='export_pdf'),
    path('reports/placement.xlsx', views.export_placement_excel, name='export_excel'),

    # ── Upgrade 7: Interview Readiness Score ──────────────────────────
    path('student/readiness-score/', views.interview_readiness_score, name='readiness_score'),

    # AI Career Coach (Groq-powered)
    path('ai/chat/', views.ai_chat, name='ai_chat'),
]
