// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const MessageStatus = {
  "SENT": "SENT",
  "DELIVERED": "DELIVERED",
  "READ": "READ"
};

const { ChatRoomBanship, ChatRoomMembership, ChatRoomAdminship, ChatRoomOwnership, ChatRoom, User, Message, ChatRoomUser } = initSchema(schema);

export {
  ChatRoomBanship,
  ChatRoomMembership,
  ChatRoomAdminship,
  ChatRoomOwnership,
  ChatRoom,
  User,
  Message,
  ChatRoomUser,
  MessageStatus
};