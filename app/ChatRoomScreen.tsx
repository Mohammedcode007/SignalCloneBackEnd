import React from 'react';
import { StyleSheet, View, FlatList, SafeAreaView } from 'react-native';
import chatRoomData from '../assets/dummy-data/Chats';
import Message from '../components/Message/Message';
import MessageInput from '../components/MessageInput/MessageInput';
import { useRoute } from '@react-navigation/native';

const ChatRoomScreen = () => {
  const route = useRoute()
  // console.warn(route.params?.chatRoomDataItem.id);
  
  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={chatRoomData.messages}
        inverted
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Message message={item} />}
      />
      <MessageInput />
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
