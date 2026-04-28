"""
JWT Authentication Middleware for Django Channels
=================================================
Authenticates WebSocket connections using the JWT access token
passed as a query parameter: ws://server/ws/chat/5/?token=<access_token>
"""

from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)


class JWTAuthMiddleware(BaseMiddleware):
    """Authenticate Channels scope using JWT token from query string."""

    async def __call__(self, scope, receive, send):
        close_old_connections()
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token_list = params.get('token', [])

        scope['user'] = AnonymousUser()
        if token_list:
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                from django.contrib.auth import get_user_model
                from channels.db import database_sync_to_async

                User = get_user_model()
                access_token = AccessToken(token_list[0])
                user_id = access_token['user_id']

                @database_sync_to_async
                def get_user():
                    return User.objects.get(pk=user_id)

                scope['user'] = await get_user()
            except Exception:
                pass  # Stays AnonymousUser

        return await super().__call__(scope, receive, send)
