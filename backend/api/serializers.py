from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, StudentProfile, RecruiterProfile, JobPosting, Application,
    InterviewSchedule, PlacementDrive, AlumniProfile, Review,
    Notification, ChatMessage, Feedback, SkillCourse, StudentCourseProgress
)


# ============ AUTH SERIALIZERS ============

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)
    college = serializers.CharField(write_only=True, required=False, allow_blank=True)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name',
                  'last_name', 'role', 'phone', 'department', 'college', 'company_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        department = validated_data.pop('department', 'CSE')
        college = validated_data.pop('college', '')
        company_name = validated_data.pop('company_name', 'My Company')
        
        user = User.objects.create_user(**validated_data)
        
        if user.role == 'student':
            import uuid
            StudentProfile.objects.create(
                user=user,
                roll_number=f"TEMP_{user.id}_{uuid.uuid4().hex[:6]}",
                department=department or 'CSE',
                batch_year=2026,
                cgpa=0.0
            )
        elif user.role == 'recruiter':
            RecruiterProfile.objects.create(
                user=user,
                company_name=company_name or 'My Company'
            )
            
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'profile_picture', 'created_at')
        read_only_fields = ('id', 'created_at')


# ============ PROFILE SERIALIZERS ============

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = '__all__'


# ============ JOB SERIALIZERS ============

class JobPostingListSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = ('id', 'title', 'company_name', 'company_logo', 'job_type',
                  'location', 'salary_min', 'salary_max', 'min_cgpa',
                  'eligible_departments', 'application_deadline', 'interview_date',
                  'status', 'application_count', 'created_at')

    def get_company_name(self, obj):
        try:
            return obj.recruiter.recruiter_profile.company_name
        except RecruiterProfile.DoesNotExist:
            return "Unknown Company"

    def get_company_logo(self, obj):
        try:
            if obj.recruiter.recruiter_profile.company_logo:
                return obj.recruiter.recruiter_profile.company_logo.url
        except RecruiterProfile.DoesNotExist:
            pass
        return None

    def get_application_count(self, obj):
        return obj.applications.count()


class JobPostingDetailSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()
    company_description = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = '__all__'

    def get_company_name(self, obj):
        try:
            return obj.recruiter.recruiter_profile.company_name
        except RecruiterProfile.DoesNotExist:
            return "Unknown Company"

    def get_company_logo(self, obj):
        try:
            if obj.recruiter.recruiter_profile.company_logo:
                return obj.recruiter.recruiter_profile.company_logo.url
        except RecruiterProfile.DoesNotExist:
            pass
        return None

    def get_company_description(self, obj):
        try:
            return obj.recruiter.recruiter_profile.company_description
        except RecruiterProfile.DoesNotExist:
            return ""

    def get_application_count(self, obj):
        return obj.applications.count()

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Application.objects.filter(student=request.user, job=obj).exists()
        return False


class JobPostingCreateSerializer(serializers.ModelSerializer):
    # required_skills has blank=True but no model default, so DRF would mark it
    # required=True by default. Override to make it optional with a safe default.
    required_skills = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = JobPosting
        exclude = ('recruiter', 'approved_by', 'status')


# ============ APPLICATION SERIALIZERS ============

class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('student', 'applied_at')

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_student_email(self, obj):
        return obj.student.email

    def get_job_title(self, obj):
        return obj.job.title

    def get_company_name(self, obj):
        try:
            return obj.job.recruiter.recruiter_profile.company_name
        except RecruiterProfile.DoesNotExist:
            return "Unknown"


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('job', 'cover_letter')


# ============ INTERVIEW SERIALIZERS ============

class InterviewScheduleSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()

    class Meta:
        model = InterviewSchedule
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.application.student.get_full_name()

    def get_job_title(self, obj):
        return obj.application.job.title


# ============ PLACEMENT DRIVE SERIALIZERS ============

class PlacementDriveSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    registered_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    # Auto-set in perform_create — not required from the client
    company = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PlacementDrive
        fields = '__all__'

    def get_company_name(self, obj):
        try:
            return obj.company.recruiter_profile.company_name
        except RecruiterProfile.DoesNotExist:
            return "Unknown"

    def get_registered_count(self, obj):
        return obj.registered_students.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.registered_students.filter(id=request.user.id).exists()
        return False


# ============ ALUMNI SERIALIZERS ============

class AlumniProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = AlumniProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name()


# ============ REVIEW SERIALIZERS ============

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = '__all__'
        # sentiment_score and sentiment_label are auto-set by signals (Upgrade 3)
        read_only_fields = ('reviewer', 'sentiment_score', 'sentiment_label')

    def get_reviewer_name(self, obj):
        return obj.reviewer.get_full_name()


# ============ NOTIFICATION SERIALIZERS ============

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user',)


# ============ CHAT SERIALIZERS ============

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('sender',)

    def get_sender_name(self, obj):
        return obj.sender.get_full_name()

    def get_receiver_name(self, obj):
        return obj.receiver.get_full_name()


# ============ FEEDBACK SERIALIZERS ============

class FeedbackSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ('user',)

    def get_user_name(self, obj):
        return obj.user.get_full_name()


# ============ SKILL COURSE SERIALIZERS ============

class SkillCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCourse
        fields = '__all__'


class StudentCourseProgressSerializer(serializers.ModelSerializer):
    course = SkillCourseSerializer(read_only=True)

    class Meta:
        model = StudentCourseProgress
        fields = '__all__'
        read_only_fields = ('student',)

        