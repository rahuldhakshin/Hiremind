from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """Custom user model with role-based access."""
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('recruiter', 'Recruiter'),
        ('placement_officer', 'Placement Officer'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class StudentProfile(models.Model):
    """Student profile with academic and professional details."""
    DEPARTMENT_CHOICES = [
        ('CSE', 'Computer Science and Engineering'),
        ('ECE', 'Electronics and Communication Engineering'),
        ('EEE', 'Electrical and Electronics Engineering'),
        ('MECH', 'Mechanical Engineering'),
        ('CIVIL', 'Civil Engineering'),
        ('IT', 'Information Technology'),
        ('AIDS', 'AI and Data Science'),
        ('OTHER', 'Other'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    batch_year = models.IntegerField()
    cgpa = models.DecimalField(
        max_digits=4, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    twelfth_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    skills = models.TextField(blank=True, help_text="Comma-separated skills")
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    is_placed = models.BooleanField(default=False)
    placed_company = models.CharField(max_length=100, blank=True, null=True)
    placed_package = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.roll_number}"


class RecruiterProfile(models.Model):
    """Recruiter/Company profile."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=200)
    company_website = models.URLField(blank=True, null=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    company_description = models.TextField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    headquarters = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.company_name


class JobPosting(models.Model):
    """Job postings created by recruiters."""
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
    ]
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('internship', 'Internship'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
    ]
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    location = models.CharField(max_length=200)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    min_cgpa = models.DecimalField(
        max_digits=4, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    eligible_departments = models.CharField(
        max_length=200, blank=True,
        help_text="Comma-separated department codes: CSE,ECE,IT"
    )
    required_skills = models.TextField(
        blank=True,
        help_text="Comma-separated required skills e.g. Python,SQL,AWS"
    )
    application_deadline = models.DateTimeField()
    interview_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_jobs'
    )
    max_applications = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.recruiter.recruiter_profile.company_name}"


class Application(models.Model):
    """Student job applications."""
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Interview Scheduled'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cover_letter = models.TextField(blank=True, null=True)
    recruiter_notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'job')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.get_full_name()} -> {self.job.title}"


class InterviewSchedule(models.Model):
    """Interview scheduling for placement drives."""
    ROUND_CHOICES = [
        ('online_test', 'Online Coding Test'),
        ('technical', 'Technical Interview'),
        ('hr', 'HR Interview'),
        ('group_discussion', 'Group Discussion'),
        ('final', 'Final Round'),
    ]
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    round_type = models.CharField(max_length=20, choices=ROUND_CHOICES)
    round_number = models.IntegerField(default=1)
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    location = models.CharField(max_length=200, blank=True)
    meeting_link = models.URLField(blank=True, null=True)
    instructions = models.TextField(blank=True)
    result = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('passed', 'Passed'), ('failed', 'Failed')],
        default='pending'
    )
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_date']

    def __str__(self):
        return f"{self.application} - Round {self.round_number}"


class PlacementDrive(models.Model):
    """Placement drives organized by placement officers."""
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name='placement_drives')
    drive_date = models.DateTimeField()
    venue = models.CharField(max_length=200)
    eligible_departments = models.CharField(max_length=200, blank=True)
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_drives'
    )
    registered_students = models.ManyToManyField(User, blank=True, related_name='registered_drives')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-drive_date']

    def __str__(self):
        return self.title


class AlumniProfile(models.Model):
    """Alumni profiles for mentorship and connect."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='alumni_profile')
    graduation_year = models.IntegerField()
    department = models.CharField(max_length=10)
    current_company = models.CharField(max_length=200)
    current_role = models.CharField(max_length=200)
    experience_years = models.IntegerField(default=0)
    salary_package = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    interview_tips = models.TextField(blank=True)
    is_available_for_mentorship = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.current_company}"


class Review(models.Model):
    """Reviews and ratings for companies/jobs by students and alumni."""
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    company_name = models.CharField(max_length=200)
    job_role = models.CharField(max_length=200, blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    content = models.TextField()
    interview_experience = models.TextField(blank=True)
    pros = models.TextField(blank=True)
    cons = models.TextField(blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)
    sentiment_label = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewer.get_full_name()} - {self.company_name}"


class Notification(models.Model):
    """Notifications for all users."""
    TYPE_CHOICES = [
        ('job_alert', 'New Job Alert'),
        ('application_update', 'Application Update'),
        ('interview_reminder', 'Interview Reminder'),
        ('drive_reminder', 'Placement Drive Reminder'),
        ('profile_viewed', 'Profile Viewed'),
        ('message', 'New Message'),
        ('general', 'General'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class ChatMessage(models.Model):
    """Chat messages between students and alumni."""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}"


class Feedback(models.Model):
    """Feedback and surveys for placement process."""
    FEEDBACK_TYPE_CHOICES = [
        ('placement_experience', 'Placement Experience'),
        ('system_usability', 'System Usability'),
        ('career_support', 'Career Support'),
        ('company_feedback', 'Company Feedback'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    feedback_type = models.CharField(max_length=30, choices=FEEDBACK_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class SkillCourse(models.Model):
    """Curated skill development courses."""
    CATEGORY_CHOICES = [
        ('programming', 'Programming'),
        ('data_science', 'Data Science'),
        ('cloud', 'Cloud Computing'),
        ('web_dev', 'Web Development'),
        ('mobile_dev', 'Mobile Development'),
        ('soft_skills', 'Soft Skills'),
        ('other', 'Other'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    provider = models.CharField(max_length=100)
    url = models.URLField()
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    duration_hours = models.IntegerField(blank=True, null=True)
    thumbnail = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class StudentCourseProgress(models.Model):
    """Track student progress on courses."""
    STATUS_CHOICES = [
        ('saved', 'Saved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(SkillCourse, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='saved')
    progress_percentage = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} - {self.course.title}"