import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
// import chatRoomData from '../assets/dummy-data/Chats';
import Message from '../components/Message/Message';
import MessageInput from '../components/MessageInput/MessageInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DataStore } from "@aws-amplify/datastore";
import { ChatRoom, Message as MessageModel } from "../src/models";
import { Auth,SortDirection } from 'aws-amplify';
import ChatRoomHeader from '../components/ChatRoomHeader/ChatRoomHeader';
const ChatRoomScreen = () => {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [messageReplyTo, setMessageReplyTo] = useState<MessageModel | null>(
    null
  );
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  // console.log(chatRoom, "chatRoom");

  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    fetchChatRoom();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [chatRoom]);

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
    if (!route.params?.chatRoomDataItem) {
      console.warn("No chatroom id provided");
      return;
    }
    const chatRoom = await DataStore.query(ChatRoom, route.params.chatRoomDataItem);
    if (!chatRoom) {
      console.error("Couldn't find a chat room with this id");
    } else {
      setChatRoom(chatRoom);
    }
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
    // console.log(fetchedMessages, "fetchedMessages");
    setMessages(fetchedMessages);
  };

  if (!chatRoom) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={{height:100,width:'100%',marginTop:'10%'}}>
<ChatRoomHeader id={route.params?.chatRoomDataItem}/>
      </View>
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Message message={item} />}
      />
      <MessageInput
        chatRoom={chatRoom}

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
