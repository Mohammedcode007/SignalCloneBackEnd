import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
// import chatRoomData from '../assets/dummy-data/Chats';
import Message from '../components/Message/Message';
import MessageInput from '../components/MessageInput/MessageInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DataStore } from "@aws-amplify/datastore";
import { ChatRoom, ChatRoomUser, Message as MessageModel, User } from "../src/models";
import { Auth, SortDirection } from 'aws-amplify';
import ChatRoomHeader from '../components/ChatRoomHeader/ChatRoomHeader';
import { useDispatch } from 'react-redux';
import { addToActive } from '../redux/mainSlice';

const ChatRoomScreen = () => {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [messageReplyTo, setMessageReplyTo] = useState<MessageModel | null>(
    null
  );
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [entryTime, setEntryTime] = useState<Date | null>(null);
  const [entryTimeSet, setEntryTimeSet] = useState(false);
  console.log(entryTime,"entryTime");
  
  useEffect(() => {
    if (!entryTimeSet) {
      setEntryTime(new Date());
      setEntryTimeSet(true);
    }
  }, [entryTimeSet]);
  
  
  const dispatch = useDispatch();

  const route = useRoute();
  const navigation = useNavigation();
  


  useEffect(() => {

    fetchChatRoom();
  }, []);

  useEffect(() => {
    if (chatRoom?.isRoom === true) {
      
      fetchRecentMessages()
    } else (
      fetchMessages()

    )
  }, [chatRoom,time]);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel).subscribe((msg) => {
      // console.log(msg.model, msg.opType, msg.element);
      if (msg.model === MessageModel && msg.opType === "INSERT") {
        setMessages((existingMessage) => [msg.element, ...existingMessage]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const fetchChatRoom = async () => {
    if (!route.params?.id) {
      console.warn("No chatroom id provided");
      return;
    }
    const chatRoom = await DataStore.query(ChatRoom, route.params.id);
    console.log(chatRoom, "chatRoom");

    if (!chatRoom) {
      console.error("Couldn't find a chat room with this id");
    } else {
      setChatRoom(chatRoom);
      dispatch(addToActive(chatRoom));

    }
  };

  const fetchRecentMessages = async () => {
    if (!chatRoom || !entryTime) {
      return;
    }
  
    // استعلام الرسائل التي تم استلامها بعد دخول المستخدم للغرفة
    const fetchedMessages = await DataStore.query(
      MessageModel,
      (message) =>
        message.chatroomID.eq(chatRoom?.id).createdAt('gt', entryTime),
      {
        sort: (message) => message.createdAt(SortDirection.DESCENDING),
      }
    );
  
    setMessages(fetchedMessages);
  };
  
  


  const fetchMessages = async () => {
    if (!chatRoom) {
      return;
    }
    const authUser = await Auth.currentAuthenticatedUser();
    const myId = authUser.attributes.sub;

    const fetchedMessages = await DataStore.query(
      MessageModel,
      (message) => message.chatroomID.eq(chatRoom?.id),
      {
        sort: (message) => message.createdAt(SortDirection.DESCENDING),
      } // Use dot notation and eq operator
    );
    console.log(fetchedMessages, "fetchedMessages");
    setMessages(fetchedMessages);
  };

  if (!chatRoom) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={{ height: 100, width: '100%', marginTop: '10%' }}>
        <ChatRoomHeader id={route.params?.id} />
      </View>
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Message message={item} setAsMessageReply={() => setMessageReplyTo(item)}
        />}
      />
      <MessageInput
        chatRoom={chatRoom}
        messageReplyTo={messageReplyTo}
        removeMessageReplyTo={() => setMessageReplyTo(null)}

      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default ChatRoomScreen;
