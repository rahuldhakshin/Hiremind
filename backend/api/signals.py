"""
Django signals for JobQuench
============================
NOTE: TextBlob sentiment was removed because it was overwriting the
Groq-powered sentiment score that views.py sets after review creation.
Groq analysis now runs exclusively inside ReviewListCreateView.perform_create().
This file is kept to register any future signals without breaking imports.
"""

# No active signals — sentiment is handled by Groq in views.py
