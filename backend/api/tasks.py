"""
Celery Tasks — Upgrade 4: Background Task Processing
=====================================================
All heavy operations are offloaded here so Django views return instantly.

Usage from a view:
    from api.tasks import send_notification_email, run_ml_prediction
    run_ml_prediction.delay(student_id)
"""

from celery import shared_task


@shared_task(name='api.tasks.send_notification_email')
def send_notification_email(user_id, subject, body):
    """Send an email notification asynchronously."""
    try:
        from django.contrib.auth import get_user_model
        from django.core.mail import send_mail
        from django.conf import settings

        User = get_user_model()
        user = User.objects.get(pk=user_id)
        send_mail(
            subject=subject,
            message=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jobquench.com'),
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"[Celery] Email error for user {user_id}: {e}")


@shared_task(name='api.tasks.run_ml_prediction')
def run_ml_prediction(student_id):
    """Run ML placement prediction for a student and cache the result."""
    try:
        from api.models import StudentProfile
        from api.ml.train_model import predict_for_profile

        profile = StudentProfile.objects.get(user_id=student_id)
        probability = predict_for_profile(profile)
        print(f"[Celery] ML Prediction for student {student_id}: {probability}%")
        return probability
    except Exception as e:
        print(f"[Celery] ML prediction error for student {student_id}: {e}")
        return None


@shared_task(name='api.tasks.parse_resume_async')
def parse_resume_async(student_id, resume_path):
    """Parse uploaded resume in the background and auto-fill student profile."""
    try:
        import pdfplumber
        from api.models import StudentProfile

        profile = StudentProfile.objects.get(user_id=student_id)

        # Extract text
        text = ''
        with pdfplumber.open(resume_path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or '') + '\n'

        # Simple skills extraction
        known_skills = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go',
            'rust', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
            'react', 'angular', 'vue', 'django', 'flask', 'fastapi',
            'node', 'express', 'spring', 'docker', 'kubernetes', 'aws',
            'azure', 'gcp', 'git', 'linux', 'machine learning', 'deep learning',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
        ]
        text_lower = text.lower()
        found = [s for s in known_skills if s in text_lower]

        if found:
            existing = [s.strip().lower() for s in profile.skills.split(',') if s.strip()]
            merged = list(set(existing + found))
            profile.skills = ', '.join(merged)
            profile.save(update_fields=['skills'])
            print(f"[Celery] Resume parsed for student {student_id}. Skills: {profile.skills}")
    except Exception as e:
        print(f"[Celery] Resume parse error for student {student_id}: {e}")


@shared_task(name='api.tasks.notify_students_new_job')
def notify_students_new_job(job_id):
    """Send in-app notifications to eligible students for a new approved job."""
    try:
        from api.models import JobPosting, StudentProfile, Notification, User

        job = JobPosting.objects.get(pk=job_id)
        students = User.objects.filter(role='student')
        count = 0
        for student in students:
            try:
                profile = student.student_profile
                if float(profile.cgpa) >= float(job.min_cgpa):
                    if not job.eligible_departments or profile.department in job.eligible_departments:
                        Notification.objects.get_or_create(
                            user=student,
                            notification_type='job_alert',
                            title=f'New Job: {job.title}',
                            defaults={
                                'message': (
                                    f'{job.title} at '
                                    f'{job.recruiter.recruiter_profile.company_name}. '
                                    f'Apply before {job.application_deadline}.'
                                ),
                                'link': f'/jobs/{job.id}',
                            }
                        )
                        count += 1
            except Exception:
                pass
        print(f"[Celery] Notified {count} students about job {job_id}")
    except Exception as e:
        print(f"[Celery] Notification error for job {job_id}: {e}")
