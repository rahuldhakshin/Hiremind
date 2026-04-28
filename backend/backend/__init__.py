# This makes Celery app available as a default app when Django starts
# so that shared_task decorator works correctly — Upgrade 4
from .celery import app as celery_app  # noqa: F401

__all__ = ('celery_app',)
