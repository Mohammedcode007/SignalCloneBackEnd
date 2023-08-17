import React, { useState, useEffect } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser, Message } from '../../src/models';
import { AntDesign } from '@expo/vector-icons';

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
  }, []);

  const handleItemPress = (item) => {
    // Navigate to another screen with the selected item
    navigation.navigate('ChatRoomScreen', { id: item.id });
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  
  // ... باقي الكود
  
  const handleItemLongPress = (item) => {
    setSelectedChatRoom(item); // تخزين العنصر الحالي للذي تم الضغط المطول عليه
    setIsModalVisible(true); // عرض النموذج
  };
  const handleBackgroundPress = () => {
    // عند الضغط على أي مكان على الشاشة، قم بإغلاق النموذج
    setIsModalVisible(false);
  };
  return (
    <TouchableWithoutFeedback onPress={handleBackgroundPress}>

    <View style={styles.page}>
      <FlatList
        data={chatRoom}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)} onLongPress={() => handleItemLongPress(item)}>
            <View>
              <ChatRoomItem chatRoomDataItem={item} />
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
       <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
        
      >
        <View style={{backgroundColor:'#d0ddf2',display:'flex',alignItems:'center',justifyContent:'center',width:130,height:60,borderRadius:20,position:'absolute',bottom:100,left:'33.333%'}}>
        <AntDesign name="delete" size={20} color="black" />
        <Text style={{color:'black'}}>delete</Text>

        </View>
        {/* ... استخدام مكون النموذج هنا مع selectedChatRoom */}
      </Modal>
    </View>
    </TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});
