import '@azure/core-asynciterator-polyfill'

import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, View, ActivityIndicator, Pressable, Text, Alert } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { TouchableHighlight } from 'react-native';

import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import UserItem from '../../components/UserItem/UserItem';
import { DataStore } from "@aws-amplify/datastore";
import { ChatRoom, ChatRoomUser, Friendship, User } from "../../src/models";
import ChatRoomHeader from '../../components/ChatRoomHeader/ChatRoomHeader';
import NewGroupButton from '../../components/NewGroupButton';
import { Auth } from 'aws-amplify';
import { useDispatch } from 'react-redux';
import { addTonotify } from '../../redux/mainSlice';
import FriendsUserItem from '../../components/FriendsUserItem/FriendsUserItem';
import { COLORS } from '../../utils/COLORS';

export default function TabTwoScreen({ route }) {
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setfriends] = useState<User[]>([]);
  const dispatch = useDispatch();

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(true);
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
    if (user) {
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
      console.log(dbUser, "dbUser");

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

      const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));


      if (dbUser) {
        await addUserToChatRoom(dbUser, newChatRoom);
      }

      // connect users user with the chat room
      await Promise.all(
        users.map((user) => addUserToChatRoom(user, newChatRoom))
      );
      if (newChatRoom.id) {
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

    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);

    if (dbUser, user) {
      const chatroomuser = await (await DataStore.query(ChatRoomUser)).filter((item) => {
        return (
          item?.userId === dbUser?.id || item?.userId === user?.id
        )
      })
      console.log(chatroomuser, "chatroomuser");

      const duplicatedChatRoomIds = chatroomuser.filter((item, index, self) => {
        // استخدام indexOf للتحقق إذا كانت هذه العنصر مكررة مسبقًا في المصفوفة
        return self.findIndex((el) => el.chatRoomId === item.chatRoomId) !== index;
      });

      console.log(duplicatedChatRoomIds, "duplicatedChatRoomIds");

      const chatRoomId = await Promise.all(
        duplicatedChatRoomIds.map(async (i) => {
          return i?.chatRoomId;
        })
      )
      console.log(chatRoomId, "chatRoomId");

      if (chatRoomId) {
        const chatroomdetails = await Promise.all(chatRoomId.map(async (i) => {
          return (
            await DataStore.query(ChatRoom, i)
          )
        }))
        console.log(chatroomdetails, "chatroomdetails");

        if (chatroomdetails) {
          const filterRoom = await chatroomdetails.filter((i) => {
            return (
              i?.isRoom === null
            )
          })
          console.log(filterRoom, "filterRoom");
          if (filterRoom.length > 0) {
            navigation.navigate("ChatRoomScreen", { id: filterRoom[0].id });


          } else {
            await createChatRoom([user]);

          }

        }


      }

    }




  };



  const isFocused = useIsFocused(); // Hook to determine if the screen is focused

  useEffect(() => {
    if (isFocused) {
      const getFriends = async () => {
        const authUser = await Auth.currentAuthenticatedUser();
        const dbUser = await DataStore.query(User, authUser.attributes.sub);
        console.log(dbUser, "dbUser");

        if (dbUser) {
          const friends = (await DataStore.query(Friendship)).filter((i) => i?.myID === dbUser?.id)
            .map((item) => item?.userID);

          if (friends) {
            const userDetailsPromises = friends.map(async (friendID) => {
              return await DataStore.query(User, friendID);
            });

            const userDetails = await Promise.all(userDetailsPromises);
            setfriends(userDetails)

            console.log(userDetails, "userDetails");
          }

          // console.log(friends, "friends");
        }
      };


      const subscription = DataStore.observe(Friendship).subscribe(() => {
        getFriends();
      });

      getFriends();
      return () => {
        subscription.unsubscribe();
      };
    }



  }, [isFocused]);

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
        data={friends}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (

          <FriendsUserItem oneUserItem={item} onPress={() => onUserPress(item)}
            isSelected={isNewGroup ? isUserSelected(item) : undefined} />
        )}
        showsHorizontalScrollIndicator={false}
      // ListHeaderComponent={() => (
      //   <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)} />
      // )}
      />

    </View>
  );
}


const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white'
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