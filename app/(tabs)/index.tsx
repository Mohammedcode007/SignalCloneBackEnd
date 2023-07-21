import React,{useState,useEffect} from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser } from '../../src/models';

export default function TabOneScreen() {
  const chatRoomData = chatRoomDummy;
  const navigation = useNavigation();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  // console.log(chatRoom, "555555555555555555555555");

  const route = useRoute();
  const fetchChatRoom = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      if (userData) {
        // console.log(userData?.attributes?.sub, "userData");
      }

      const chatRooms1 = await DataStore.query(ChatRoomUser);
      // console.log(chatRooms1, "chatRoomsUschatRoomser1");

      const chatRoomsIds = chatRooms1
        .filter((ChatRoomUser) => ChatRoomUser?.userId === userData?.attributes?.sub)
        .map((ChatRoomUser) => ChatRoomUser.chatRoomId);
      // console.log(chatRoomsIds, "chatRoomsUschatRoomser");

      const chatRoomDetails = await Promise.all(chatRoomsIds.map(async (chatRoomItem) => await DataStore.query(ChatRoom, chatRoomItem)));
      setChatRoom(chatRoomDetails)
    } catch (error) {
      console.log('Error fetching chatRoomDetails:', error);
    }
  };

  useEffect(() => {
    fetchChatRoom();
  }, []);
  const handleItemPress = (item) => {
    // Navigate to another screen with the selected item
    
    navigation.navigate('ChatRoomScreen', { chatRoomDataItem: item.id });
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRoom}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>
            <ChatRoomItem chatRoomDataItem={item} />
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});
