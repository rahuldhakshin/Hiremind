"""
Django Channels WebSocket Consumer — Upgrade 5: Real-time Chat
==============================================================
Enables instant messaging between students and alumni (no page refresh needed).

Flutter connects via:
    ws://your-server/ws/chat/<other_user_id>/?token=<jwt_access_token>

Requires:
    pip install channels channels-redis daphne
    Redis running on localhost:6379
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for 1-to-1 chat.
    Each pair of users shares a private group channel named:
        chat_<min_id>_<max_id>
    so that both sides subscribe to the same channel regardless of
    who initiated the connection.
    """

    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.other_user_id = self.scope['url_route']['kwargs']['user_id']
        uid1 = min(self.user.id, int(self.other_user_id))
        uid2 = max(self.user.id, int(self.other_user_id))
        self.room_group_name = f'chat_{uid1}_{uid2}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle incoming message from Flutter client."""
        try:
            data = json.loads(text_data)
            message_text = data.get('message', '').strip()
            if not message_text:
                return

            # Save to DB
            msg = await self.save_message(message_text)

            # Broadcast to both participants
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_text,
                    'sender_id': self.user.id,
                    'sender_name': await self.get_full_name(),
                    'message_id': msg.id,
                    'timestamp': msg.created_at.isoformat(),
                }
            )
        except json.JSONDecodeError:
            pass

    async def chat_message(self, event):
        """Push broadcast message to WebSocket client."""
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'message_id': event['message_id'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def save_message(self, text):
        from api.models import ChatMessage, User
        receiver = User.objects.get(pk=self.other_user_id)
        return ChatMessage.objects.create(
            sender=self.user,
            receiver=receiver,
            message=text,
        )

    @database_sync_to_async
    def get_full_name(self):
        return self.user.get_full_name() or self.user.username


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time push notifications.
    Flutter connects via:
        ws://your-server/ws/notifications/?token=<jwt_access_token>
    """

    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.group_name = f'notifications_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # Client doesn't send notifications to server via this socket

    async def send_notification(self, event):
        """Called by server to push a notification to this user's socket."""
        await self.send(text_data=json.dumps(event.get('notification', event.get('data', {}))))
