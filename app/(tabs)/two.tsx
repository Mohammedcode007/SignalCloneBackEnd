import '@azure/core-asynciterator-polyfill'

import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, View, ActivityIndicator, Pressable, Text,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';

import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import UserItem from '../../components/UserItem/UserItem';
import { DataStore } from "@aws-amplify/datastore";
import { ChatRoom, ChatRoomUser, User } from "../../src/models";
import ChatRoomHeader from '../../components/ChatRoomHeader/ChatRoomHeader';
import NewGroupButton from '../../components/NewGroupButton';
import { Auth } from 'aws-amplify';

export default function TabTwoScreen({route}) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, []);
  // useEffect(() => {
  //   // query users
  //   const fetchUsers = async () => {
  //     try {
  //       const fetchedUsers = await DataStore.query(User);
  //       setUsers(fetchedUsers);
  //     } catch (error) {
  //       console.error("Error fetching users:", error.message || error);
  //     }
  //   };
  //   fetchUsers();
  // }, []);


  // const chatRoomData = User;
  const navigation = useNavigation();

  const handleItemPress = (item) => {
    // Navigate to another screen with the selected item
    // navigation.navigate('ChatRoomScreen', { chatRoomDataItem: item });
  };

  const addUserToChatRoom = async (user, chatroom) => {
    if(user ){
      await DataStore.save(new ChatRoomUser({
                user: user,
                chatRoom: chatroom
              }));
    }

  };

  const createChatRoom = async (users) => {
    try {
       // TODO if there is already a chat room between these 2 users
    // then redirect to the existing chat room
    // otherwise, create a new chatroom with these users.

    // connect authenticated user with the chat room
   

    const authUser = await Auth.currentAuthenticatedUser();
    const loggedInUserId = authUser.attributes.sub;
    const dbUser = await DataStore.query(User, loggedInUserId);

    if (!dbUser) {
      Alert.alert("There was an error creating the group");
      return;
    }
    // Create a chat room
    const newChatRoomData = {
      newMessages: 1,
      Admin: dbUser,
    };
    if (users.length > 1) {
      newChatRoomData.name = "New group";
      newChatRoomData.imageUri =
        "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/group.jpeg";

    }
    console.log(newChatRoomData,"chatroom");

    const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));


    if (dbUser) {
      await addUserToChatRoom(dbUser, newChatRoom);
    }

    // connect users user with the chat room
    await Promise.all(
      users.map((user) => addUserToChatRoom(user, newChatRoom))
    );
if(newChatRoom.id ){
  navigation.navigate("ChatRoomScreen", { id: newChatRoom.id });

}
    } catch (error) {
      console.log(error);
      
      
    }
   
  };

  const isUserSelected = (user) => {
    return selectedUsers.some((selectedUser) => selectedUser.id === user.id);
  };

  const onUserPress = async (user) => {
    if (isNewGroup) {
      if (isUserSelected(user)) {
        // remove it from selected
        setSelectedUsers(
          selectedUsers.filter((selectedUser) => selectedUser.id !== user.id)
        );
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      await createChatRoom([user]);
    }
  };

  const saveGroup = async () => {
    await createChatRoom(selectedUsers);
  };
  if (users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }
  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>
            <UserItem oneUserItem={item}  onPress={() => onUserPress(item)}
            isSelected={isNewGroup ? isUserSelected(item) : undefined}/>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={() => (
          <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)} />
        )}
      />
         {isNewGroup && (
        <Pressable style={styles.button} onPress={saveGroup}>
          <Text style={styles.buttonText}>
            Save group ({selectedUsers.length})
          </Text>
        </Pressable>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#3777f0",
    marginHorizontal: 10,
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});