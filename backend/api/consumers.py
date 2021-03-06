import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

from main.models import ChatBox as ChatBoxModel
from main.serializers import ChatBoxSerializer

class ChatBoxConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chatter = self.scope['user']

        self.chatter_pk = self.chatter.pk
        self.chattee_pk = self.scope['url_route']['kwargs']['user_pk']
        self.chat_group_name = 'chat_{}_{}'.format(self.chatter_pk, self.chattee_pk)

        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data_json = json.loads(text_data)

        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'send_message',
                'data': data_json
            }
        )

    async def send_message(self, event):
        data = event['data']

        user_recipient = await self.get_user(self.chattee_pk)
        user = await self.get_user(self.chatter_pk)

        serializer = ChatBoxSerializer(data=data)

        if not serializer.is_valid():
            await self.send(text_data=json.dumps({
                'status': 400,
                'detail': 'Invalid text input'
            }))
            return

        chatbox = await self.create_chatbox(user, user_recipient, data['text'])

        res_data = ChatBoxSerializer(chatbox).data

        await self.send(json.dumps(res_data))

    @database_sync_to_async
    def create_chatbox(self, user, user_recipient, text):

        chatbox = ChatBoxModel.objects.create(
            text=text,
            msg_from=user,
            msg_to=user_recipient
        )

        return chatbox

    @database_sync_to_async
    def get_user(self, user_pk):
        User = get_user_model()

        user = None

        try:
            user = User.objects.get(pk=user_pk)
        except (ObjectDoesNotExist):
            pass

        return user

