// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const FriendRequestStatus = {
  "PENDING": "PENDING",
  "ACCEPTED": "ACCEPTED",
  "REJECTED": "REJECTED"
};

const MessageStatus = {
  "SENT": "SENT",
  "DELIVERED": "DELIVERED",
  "READ": "READ"
};

const { Friendship, FriendRequest, ChatRoomBanship, ChatRoomMembership, ChatRoomAdminship, ChatRoomOwnership, ChatRoom, User, Message, ChatRoomUser } = initSchema(schema);

export {
  Friendship,
  FriendRequest,
  ChatRoomBanship,
  ChatRoomMembership,
  ChatRoomAdminship,
  ChatRoomOwnership,
  ChatRoom,
  User,
  Message,
  ChatRoomUser,
  FriendRequestStatus,
  MessageStatus
};