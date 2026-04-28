"""
Celery application for JobQuench — Upgrade 4
=============================================
Start a worker with:
    celery -A backend worker --loglevel=info

Start the beat scheduler (for periodic tasks) with:
    celery -A backend beat --loglevel=info

Requires Redis running on localhost:6379
    Windows:  Use WSL2 + Redis, or Memurai (free Redis-compatible server for Windows)
    Mac/Linux: brew install redis && redis-server
"""

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Read config from Django settings — keys prefixed with CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all INSTALLED_APPS
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'[Celery] Request: {self.request!r}')
