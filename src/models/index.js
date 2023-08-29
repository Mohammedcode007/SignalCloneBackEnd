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

const { Favorite, Images, Friendship, FriendRequest, ChatRoomBanship, ChatRoomMembership, ChatRoomAdminship, ChatRoomOwnership, ChatRoom, User, Message, ChatRoomUser } = initSchema(schema);

export {
  Favorite,
  Images,
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