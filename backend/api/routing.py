"""
Django Channels URL routing — Upgrade 5
"""
from django.urls import re_path
from api import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<user_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]
