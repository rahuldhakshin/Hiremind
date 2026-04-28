"""
ASGI config for JobQuench — upgraded with Django Channels (Upgrade 5)

HTTP requests   → Django views (as before)
WebSocket /ws/* → Channels consumers (real-time chat & notifications)

Run with Daphne:
    daphne -p 8000 backend.asgi:application
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django ASGI app early to populate apps registry
django_asgi_app = get_asgi_application()

try:
    from channels.routing import ProtocolTypeRouter, URLRouter
    from channels.security.websocket import AllowedHostsOriginValidator
    from api.middleware import JWTAuthMiddlewareStack
    from api.routing import websocket_urlpatterns

    application = ProtocolTypeRouter({
        'http': django_asgi_app,
        'websocket': AllowedHostsOriginValidator(
            JWTAuthMiddlewareStack(
                URLRouter(websocket_urlpatterns)
            )
        ),
    })
except ImportError:
    # Channels not installed — fall back to plain Django ASGI
    application = django_asgi_app
