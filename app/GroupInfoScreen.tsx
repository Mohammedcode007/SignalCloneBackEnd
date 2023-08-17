import { useRoute } from "@react-navigation/native";
import { DataStore, Auth } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { ChatRoom, ChatRoomUser, Message, User,  } from "../src/models";
import UserItem from "../components/UserItem/UserItem";
import {  Message as MessageModel } from "../src/models";
import { useDispatch } from "react-redux";
import {  setexitMessageContent } from '../redux/mainSlice';

const GroupInfoScreen = () => {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const route = useRoute();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchChatRoom();
    fetchUsers();
  }, []);

  const fetchChatRoom = async () => {
    if (!route.params?.id) {
      console.warn("No chatroom id provided");
      return;
    }
    const chatRoom = await DataStore.query(ChatRoom, route.params.id);
    if (!chatRoom) {
      console.error("Couldn't find a chat room with this id");
    } else {
      setChatRoom(chatRoom);
    }
  };

  const fetchUsers = async () => {
    const fetchedUsersId = (await DataStore.query(ChatRoomUser))
    .filter((chatRoomUser) => chatRoomUser.chatRoomId === route.params?.id)
    .map((chatRoomUser) => chatRoomUser.userId);
  // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


  const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
  console.log(UserDetails, "555555555555555555555555");
  // setUsers(UserDetails);
  setAllUsers(UserDetails);
  };

  const confirmDelete = async (user) => {
    // console.log(user,"user");
    
    // check if Auth user is admin of this group
    const authData = await Auth.currentAuthenticatedUser();
    if (chatRoom?.chatRoomAdminId !== authData.attributes.sub) {
      Alert.alert("You are not the admin of this group");
      return;
    }

    if (user.id === chatRoom?.chatRoomAdminId) {
      Alert.alert("You are the admin, you cannot delete yourself");
      return;
    }

    Alert.alert(
      "Confirm delete",
      `Are you sure you want to delete ${user.name} from the group`,
      [
        {
          text: "Delete",
          onPress: () => deleteUser(user, chatRoom?.id), // Pass the chatRoomId to the deleteUser function
          style: "destructive",
        },
        {
          text: "Cancel",
        },
      ]
    );
  };

  const deleteUser = async (user, chatRoomId) => {
    try {
      // Find the specific ChatRoomUser instance to delete
        const chatRoomUserToDelete = await (
      await DataStore.query(ChatRoomUser)
    ).filter(
      (cru) => cru.chatRoomId === chatRoom?.id && cru?.userId === user?.id
    );

      if (chatRoomUserToDelete.length > 0) {
        
        await DataStore.delete(ChatRoomUser, chatRoomUserToDelete[0]?.id);
        setAllUsers(allUsers.filter((u) => u?.id !== user?.id));

        console.log("تم حذف المستخدم بنجاح من غرفة الدردشة");
      } else {
        console.log("لم يتم العثور على المستخدم في غرفة الدردشة");
      }

  
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  
  
const LeaveRoom = async ()=>{
  try {
    
    
  const authUser = await Auth.currentAuthenticatedUser();
  const loggedInUserId = authUser.attributes.sub;
  const dbUser = await DataStore.query(User, loggedInUserId);

  if (!dbUser) {
    Alert.alert("There was an error leaving the group");
    return;
  }

  if (dbUser) {
    const chatRoomUserToDelete = await (
      await DataStore.query(ChatRoomUser)
    ).filter(
      (cru) => cru.chatRoomId === chatRoom?.id && cru?.userId === dbUser?.id
    );

      if (chatRoomUserToDelete.length > 0) {
             
   // احصل على جميع الرسائل المرتبطة بالغرفة
   const messagesToDelete = (await DataStore.query(Message)).filter(
    (m) => m.chatroomID === chatRoom?.id && m?.userID === dbUser?.id
  );

    const leaving =     await DataStore.delete(ChatRoomUser, chatRoomUserToDelete[0]?.id);
        setAllUsers(allUsers.filter((u) => u?.id !== dbUser?.id));
        if(leaving){
          sendExitMessage();

        }
   }}

  
  } catch (error) {
    
  }
}


const sendExitMessage = async () => {
  if (!chatRoom) {
    return;
  }

  // احصل على معلومات المستخدم المصادق عليه
  const authUser = await Auth.currentAuthenticatedUser();
  const dbUser = await DataStore.query(User, authUser.attributes.sub);

  // أنشئ محتوى رسالة الخروج
if(dbUser){

  const exitMessage = await DataStore.save(
    new MessageModel({
      content: `${dbUser.name} قد غادر الغرفة.`,
      userID: '80ecd97c-2071-70f7-79e6-4036fb2d5dbb',
      chatroomID: chatRoom.id,
    })
  );
  dispatch(setexitMessageContent(exitMessage))

}

};


  // const deleteUser = async (user) => {
  //   const chatRoomUsersToDelete1 = await (
  //     await DataStore.query(ChatRoomUser)
  //   )

  //   console.log(user,"chatRoomUsersToDelete1");
    

  //   const chatRoomUsersToDelete = await (
  //     await DataStore.query(ChatRoomUser)
  //   ).filter(
  //     (cru) => cru.chatRoomId === chatRoom?.id && cru.userId === user?.id
  //   );

  //   console.log(chatRoomUsersToDelete);

  //   if (chatRoomUsersToDelete.length > 0) {
  //     await DataStore.delete(chatRoomUsersToDelete[0]);

  //     setAllUsers(allUsers.filter((u) => u?.id !== user?.id));
  //   }
  // };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{chatRoom?.name}</Text>

      <Text style={styles.title}>Users ({allUsers.length})</Text>
      <Pressable onPress={LeaveRoom}>
      <Text>
        Leave Room
      </Text>
      </Pressable>
      
      <FlatList
        data={allUsers}
        keyExtractor={(item,index) => `user-${index}`} // تحديد مفتاح فريد باستخدام اسم النموذج ومعرّف المستخدم

        renderItem={({ item }) => (
          <UserItem
          oneUserItem={item}
            isAdmin={chatRoom?.chatRoomAdminId === item?.id}
            onLongPress={() => confirmDelete(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: "white",
    padding: 10,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 10,
  },
});

export default GroupInfoScreen;