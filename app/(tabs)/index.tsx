import React, { useState, useEffect } from 'react';
import { FlatList, TouchableHighlight, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser, Message } from '../../src/models';
import { AntDesign } from '@expo/vector-icons';
import { COLORS } from '../../utils/COLORS';

export default function TabOneScreen() {
  const chatRoomData = chatRoomDummy;
  const navigation = useNavigation();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  
  const route = useRoute();

  const fetchChatRoom = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      if (userData) {
        // Fetch initial chat room details
        const chatRooms1 = await DataStore.query(ChatRoomUser);
        const chatRoomsIds = chatRooms1
          .filter((ChatRoomUser) => ChatRoomUser?.userId === userData?.attributes?.sub)
          .map((ChatRoomUser) => ChatRoomUser.chatRoomId);
        const chatRoomDetails = await Promise.all(chatRoomsIds.map(async (chatRoomItem) => await DataStore.query(ChatRoom, chatRoomItem)));
        const filteredChatRooms = chatRoomDetails.filter(room => room?.isRoom === null);

        setChatRoom(filteredChatRooms);

        // Subscribe to changes in ChatRoomUser
        const subscription = DataStore.observe(ChatRoomUser).subscribe((msg) => {
          // msg.opType will be 'INSERT', 'UPDATE', or 'DELETE'
          // Fetch updated chat room details here and update state
          fetchChatRoom();
        });

        return () => subscription.unsubscribe();
      }
    } catch (error) {
      console.log('Error fetching chatRoomDetails:', error);
    }
  };

  useEffect(() => {
    fetchChatRoom();
    const subscription = DataStore.observe(ChatRoomUser).subscribe(() => {
      fetchChatRoom();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleItemPress = (item) => {
    // Navigate to another screen with the selected item
    navigation.navigate('ChatRoomScreen', { id: item.id });
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleItemLongPress = (item) => {
    setSelectedChatRoom(item); // تخزين العنصر الحالي للذي تم الضغط المطول عليه
    setIsModalVisible(true); // عرض النموذج
  };
  const deleteChatRoom = async (chatRoomId) => {
console.log(chatRoomId,"chatRoomId");

    try {
      
      // Fetch the chat room you want to delete
      const chatRoomToDelete = await DataStore.query(ChatRoom, chatRoomId);
  
      // Delete the chat room
      if (chatRoomToDelete) {
       const data = await DataStore.delete(chatRoomToDelete);
       if(data)
       {
        setIsModalVisible(false); // عرض النموذج
        console.log('Chat room deleted successfully.');

       }
        // Perform any other necessary actions after deletion
      }
    } catch (error) {
      console.error('Error deleting chat room:', error);
    }
  };
  
  const handleDelete = async (chatRoomId) => {
    try {
      await deleteChatRoom(chatRoomId);
      // تحديث القائمة بعد حذف المحادثة
      setChatRoom(prevChatRoom => prevChatRoom.filter(room => room.id !== chatRoomId));
    } catch (error) {
      console.log('Error deleting chat room:', error);
    }
  };

 
  
  return (
    <View style={styles.page}>
      <FlatList
        data={chatRoom}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor={COLORS.hover}
            onPress={() => handleItemPress(item)}
            onLongPress={() => handleItemLongPress(item)} // استخدام onPressIn بدلاً من onLongPress
          >
            <View>
              <ChatRoomItem chatRoomDataItem={item} />
            </View>
          </TouchableHighlight>
        )}
        showsHorizontalScrollIndicator={false}
      />
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalContainer}>
            <TouchableOpacity >
              <TouchableOpacity onPress={() => handleDelete (selectedChatRoom?.id)} style={styles.deleteButton}>
                <AntDesign name="delete" size={20} color="black" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#d0ddf2',
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 60,
    borderRadius: 20,
    position: 'absolute',
    bottom: 100,
    left: '33.333%',
  },
  deleteText: {
    color: 'black',
  },
});
