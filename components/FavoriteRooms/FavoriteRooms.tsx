import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatRoomItem from '../../components/ChatRoomItem';
import { RefreshControl } from 'react-native';

import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomBanship, ChatRoomUser, Favorite, User } from '../../src/models';
import { addToActive, setjoin } from '../../redux/mainSlice';
import { useDispatch, useSelector } from 'react-redux';

const FavoriteRooms = () => {
  const {rooms,join} = useSelector((state) => state.mainReducer);

  const chatRoomData = chatRoomDummy;
  const navigation = useNavigation();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [ItemcRoom, setItemcRoom] = useState(null);
  const [item, setitem] = useState();
  const [favoriteChatRooms, setFavoriteChatRooms] = useState<ChatRoom[]>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const getFav = async () => {
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);
      const favList = (await DataStore.query(Favorite)).filter((i) => {
        return i?.userID === dbUser?.id;
      }).map((i) => {
        return i?.chatroomID;
      });
  
      if (favList.length > 0) {
        const chatRoomsfav = await Promise.all(
          favList.map(async (chatroomId) => {
            const chatRoom = await DataStore.query(ChatRoom, chatroomId);
            return chatRoom;
          })
        );
  
        setChatRoom(chatRoomsfav);
        console.log(chatRoomsfav, "chatRoomsfav");
      }
      console.log(favList, "favList");
    };
  
    getFav();
  }, []);
  
  
  
  const route = useRoute();
  const fetchChatRoom = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      if (userData) {
        // console.log(userData?.attributes?.sub, "userData");
      }

      const chatRooms1 = await DataStore.query(ChatRoomUser);
      const chatRooms15 = await DataStore.query(ChatRoom);

      const list = chatRooms15.filter((i) => { return (i?.name !== null) })
      // setChatRoom(list)

      const chatRoomsData = await Promise.all(
        list.map(async (room) => {
          const usersCount = chatRooms1.filter((cr) => cr.chatRoomId === room.id).length;
          return {
            ...room,
            usersCount,
          };
        })
      );

      // ترتيب الغرف بناءً على عدد المستخدمين بالترتيب النازل
      const sortedChatRooms = chatRoomsData.sort((a, b) => b.usersCount - a.usersCount);

      // setChatRoom(sortedChatRooms);

    } catch (error) {
      console.log('Error fetching chatRoomDetails:', error);
    }
  };
  const [allUsers, setAllUsers] = useState<User[]>([]);


  const fetchUsers = async (ItemcRoom) => {

    const fetchedUsersId = (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.chatRoomId === ItemcRoom?.id)
      .map((chatRoomUser) => chatRoomUser.userId);


    const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
    if(fetchedUsersId)
    setAllUsers(fetchedUsersId);
  };


  useEffect(() => {
    fetchChatRoom();
    // fetchUsers(ItemcRoom)
  }, [ItemcRoom]);

  useEffect(() => {
    const checkusers = async ()=>{
      const authUser = await Auth.currentAuthenticatedUser();
      const loggedInUserId = authUser.attributes.sub;
      const dbUser = await DataStore.query(User, loggedInUserId);
  
      if (!dbUser) {
        Alert.alert("There was an error creating the group");
        return;
      }
      if (dbUser && ItemcRoom) {
    
        await addUserToChatRoom(dbUser, ItemcRoom);
        

      }
    }
    
    checkusers()
  }, [allUsers]);

  const addUserToChatRoom = async (dbUser, ItemcRoom) => {
    console.log('إضافة مستخدم إلى غرفة الدردشة:', dbUser, ItemcRoom);
  
    const isUserInside = allUsers?.filter((user) => user === dbUser?.id);
  
    console.log('هل المستخدم داخل الغرفة:', isUserInside);
  
    if (isUserInside.length > 0) {
      console.log('الانتقال إلى غرفة الدردشة...');
      navigation.navigate('ChatRoomScreen', { id: ItemcRoom.id });
    } else {
      if (dbUser) {
        try {
          const savedData = await DataStore.save(
            new ChatRoomUser({
              user: dbUser,
              chatRoom: ItemcRoom,
            })
          );
  
          console.log('تم حفظ ChatRoomUser:', savedData);
  
          navigation.navigate('ChatRoomScreen', { id: ItemcRoom.id });
        } catch (error) {
          console.error('خطأ في حفظ ChatRoomUser:', error);
        }
      }
    }
  };
  

  
  const handleItemPress = async (item) => {
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
  
    if (dbUser) {
      const isBAN = (await DataStore.query(ChatRoomBanship)).filter((u) => u?.userID === dbUser?.id && u?.chatroomID === item?.id);
  
      if (isBAN.length > 0) {
        // User is banned, show alert
        Alert.alert("You are banned from this room.");
      } else {
        // User is not banned, proceed with the rest of the code
        const fetchedChatRoom = await DataStore.query(ChatRoom, item.id); // Fetch the complete ChatRoom model
        setItemcRoom(fetchedChatRoom); // Set the fetched ChatRoom
        setitem(fetchedChatRoom);
        fetchUsers(fetchedChatRoom);
      }
    }
  };
  
  
  const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  // قم بجلب البيانات أو أداء أي مهام تحديث هنا
  await fetchChatRoom();
  await  fetchUsers(ItemcRoom)

  setRefreshing(false);
};


const  [listOfRooms , setlistOfRooms] = useState<ChatRoom | null>(null);

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRoom}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item,index }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>
            <ChatRoomItem chatRoomDataItem={item} index={index} />
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

    </View>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});

export default FavoriteRooms
