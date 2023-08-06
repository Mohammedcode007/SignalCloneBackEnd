import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatRoomItem from '../../components/ChatRoomItem';
import { RefreshControl } from 'react-native';

import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser, User } from '../../src/models';
import { addToActive, setjoin } from '../../redux/mainSlice';
import { useDispatch, useSelector } from 'react-redux';

const Rooms = () => {
  const {rooms,join} = useSelector((state) => state.mainReducer);

  const chatRoomData = chatRoomDummy;
  const navigation = useNavigation();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [ItemcRoom, setItemcRoom] = useState(null);
  const [item, setitem] = useState();

  const dispatch = useDispatch();


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
      setChatRoom(list)



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
    // const checkjoin = join?.filter((item)=>{return(
    //   item?.chatRoomId === ItemcRoom?.id
    // )})
    // console.log(checkjoin,"checkjoin");
    
    // if(checkjoin === false){
    //   dispatch(setjoin({
    //     At: new Date(),
    //     UserId :dbUser?.id,
    //     chatRoomId:ItemcRoom?.id,
    //   }));
    // }

    const isUserInside = allUsers?.filter((user) => { return (user === dbUser?.id) })

console.log(isUserInside,"isUserInside");

    if (isUserInside.length > 0) {
   
      navigation.navigate('ChatRoomScreen', { id: ItemcRoom.id });

    } else {
      if (dbUser) {
    const savedata=    await DataStore.save(new ChatRoomUser({
          user: dbUser,
          chatRoom: ItemcRoom,

        }));
        if(savedata){
          navigation.navigate('ChatRoomScreen', { id: ItemcRoom.id });

        }

      }


    }

    // dispatch(addToActive(chatRoom));


  };

  
  const handleItemPress = async (item) => {
    setItemcRoom(item)
    // Navigate to another screen with the selected item
    // const authUser = await Auth.currentAuthenticatedUser();
    // const loggedInUserId = authUser.attributes.sub;
    // const dbUser = await DataStore.query(User, loggedInUserId);

    // if (!dbUser) {
    //   Alert.alert("There was an error creating the group");
    //   return;
    // }
    setitem(item)

    fetchUsers(item)
// setTimeout(async()=>{
//   if (dbUser) {
//     await addUserToChatRoom(dbUser, item);
//   }
// },3000)
   

    // navigation.navigate('ChatRoomScreen', { id: item.id });
  };
  const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  // قم بجلب البيانات أو أداء أي مهام تحديث هنا
  await fetchChatRoom();
  await  fetchUsers(ItemcRoom)

  setRefreshing(false);
};


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

export default Rooms
