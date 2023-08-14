import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncItem, AsyncCollection } from "@aws-amplify/datastore";

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ"
}



type EagerChatRoomBanship = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomBanship, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoomBanship = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomBanship, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoomBanship = LazyLoading extends LazyLoadingDisabled ? EagerChatRoomBanship : LazyChatRoomBanship

export declare const ChatRoomBanship: (new (init: ModelInit<ChatRoomBanship>) => ChatRoomBanship) & {
  copyOf(source: ChatRoomBanship, mutator: (draft: MutableModel<ChatRoomBanship>) => MutableModel<ChatRoomBanship> | void): ChatRoomBanship;
}

type EagerChatRoomMembership = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomMembership, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoomMembership = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomMembership, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoomMembership = LazyLoading extends LazyLoadingDisabled ? EagerChatRoomMembership : LazyChatRoomMembership

export declare const ChatRoomMembership: (new (init: ModelInit<ChatRoomMembership>) => ChatRoomMembership) & {
  copyOf(source: ChatRoomMembership, mutator: (draft: MutableModel<ChatRoomMembership>) => MutableModel<ChatRoomMembership> | void): ChatRoomMembership;
}

type EagerChatRoomAdminship = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomAdminship, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly chatroomID: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoomAdminship = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomAdminship, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly chatroomID: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoomAdminship = LazyLoading extends LazyLoadingDisabled ? EagerChatRoomAdminship : LazyChatRoomAdminship

export declare const ChatRoomAdminship: (new (init: ModelInit<ChatRoomAdminship>) => ChatRoomAdminship) & {
  copyOf(source: ChatRoomAdminship, mutator: (draft: MutableModel<ChatRoomAdminship>) => MutableModel<ChatRoomAdminship> | void): ChatRoomAdminship;
}

type EagerChatRoomOwnership = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomOwnership, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoomOwnership = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomOwnership, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoomOwnership = LazyLoading extends LazyLoadingDisabled ? EagerChatRoomOwnership : LazyChatRoomOwnership

export declare const ChatRoomOwnership: (new (init: ModelInit<ChatRoomOwnership>) => ChatRoomOwnership) & {
  copyOf(source: ChatRoomOwnership, mutator: (draft: MutableModel<ChatRoomOwnership>) => MutableModel<ChatRoomOwnership> | void): ChatRoomOwnership;
}

type EagerChatRoom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoom, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly newMessages?: number | null;
  readonly name?: string | null;
  readonly imageUri?: string | null;
  readonly isRoom?: boolean | null;
  readonly LastMessage?: Message | null;
  readonly Messages?: (Message | null)[] | null;
  readonly ChatRoomUsers?: (ChatRoomUser | null)[] | null;
  readonly Admin?: (User | null)[] | null;
  readonly WelcomeMessage?: string | null;
  readonly Creator?: User | null;
  readonly Owners?: (User | null)[] | null;
  readonly ChatRoomOwnerships?: (ChatRoomOwnership | null)[] | null;
  readonly ChatRoomAdminships?: (ChatRoomAdminship | null)[] | null;
  readonly ChatRoomMemberships?: (ChatRoomMembership | null)[] | null;
  readonly ChatRoomBanships?: (ChatRoomBanship | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly chatRoomLastMessageId?: string | null;
  readonly chatRoomCreatorId?: string | null;
}

type LazyChatRoom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoom, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly newMessages?: number | null;
  readonly name?: string | null;
  readonly imageUri?: string | null;
  readonly isRoom?: boolean | null;
  readonly LastMessage: AsyncItem<Message | undefined>;
  readonly Messages: AsyncCollection<Message>;
  readonly ChatRoomUsers: AsyncCollection<ChatRoomUser>;
  readonly Admin: AsyncCollection<User>;
  readonly WelcomeMessage?: string | null;
  readonly Creator: AsyncItem<User | undefined>;
  readonly Owners: AsyncCollection<User>;
  readonly ChatRoomOwnerships: AsyncCollection<ChatRoomOwnership>;
  readonly ChatRoomAdminships: AsyncCollection<ChatRoomAdminship>;
  readonly ChatRoomMemberships: AsyncCollection<ChatRoomMembership>;
  readonly ChatRoomBanships: AsyncCollection<ChatRoomBanship>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly chatRoomLastMessageId?: string | null;
  readonly chatRoomCreatorId?: string | null;
}

export declare type ChatRoom = LazyLoading extends LazyLoadingDisabled ? EagerChatRoom : LazyChatRoom

export declare const ChatRoom: (new (init: ModelInit<ChatRoom>) => ChatRoom) & {
  copyOf(source: ChatRoom, mutator: (draft: MutableModel<ChatRoom>) => MutableModel<ChatRoom> | void): ChatRoom;
}

type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly imageUri?: string | null;
  readonly name?: string | null;
  readonly status?: string | null;
  readonly lastOnlineAt?: number | null;
  readonly chatrooms?: (ChatRoomUser | null)[] | null;
  readonly Messages?: (Message | null)[] | null;
  readonly chatroomID?: string | null;
  readonly ownedChatRooms?: (ChatRoomOwnership | null)[] | null;
  readonly adminChatRooms?: (ChatRoomAdminship | null)[] | null;
  readonly memberChatRooms?: (ChatRoomMembership | null)[] | null;
  readonly banChatRooms?: (ChatRoomBanship | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly imageUri?: string | null;
  readonly name?: string | null;
  readonly status?: string | null;
  readonly lastOnlineAt?: number | null;
  readonly chatrooms: AsyncCollection<ChatRoomUser>;
  readonly Messages: AsyncCollection<Message>;
  readonly chatroomID?: string | null;
  readonly ownedChatRooms: AsyncCollection<ChatRoomOwnership>;
  readonly adminChatRooms: AsyncCollection<ChatRoomAdminship>;
  readonly memberChatRooms: AsyncCollection<ChatRoomMembership>;
  readonly banChatRooms: AsyncCollection<ChatRoomBanship>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly content?: string | null;
  readonly image?: string | null;
  readonly audio?: string | null;
  readonly status?: MessageStatus | keyof typeof MessageStatus | null;
  readonly replayToMessageID?: string | null;
  readonly chatroomID: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly content?: string | null;
  readonly image?: string | null;
  readonly audio?: string | null;
  readonly status?: MessageStatus | keyof typeof MessageStatus | null;
  readonly replayToMessageID?: string | null;
  readonly chatroomID: string;
  readonly userID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Message = LazyLoading extends LazyLoadingDisabled ? EagerMessage : LazyMessage

export declare const Message: (new (init: ModelInit<Message>) => Message) & {
  copyOf(source: Message, mutator: (draft: MutableModel<Message>) => MutableModel<Message> | void): Message;
}

type EagerChatRoomUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly chatRoomId?: string | null;
  readonly userId?: string | null;
  readonly chatRoom: ChatRoom;
  readonly user: User;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoomUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly chatRoomId?: string | null;
  readonly userId?: string | null;
  readonly chatRoom: AsyncItem<ChatRoom>;
  readonly user: AsyncItem<User>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoomUser = LazyLoading extends LazyLoadingDisabled ? EagerChatRoomUser : LazyChatRoomUser

export declare const ChatRoomUser: (new (init: ModelInit<ChatRoomUser>) => ChatRoomUser) & {
  copyOf(source: ChatRoomUser, mutator: (draft: MutableModel<ChatRoomUser>) => MutableModel<ChatRoomUser> | void): ChatRoomUser;
}