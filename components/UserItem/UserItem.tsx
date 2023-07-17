import React from 'react';
import { Image, StyleSheet,Pressable } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser } from "../../src/models";
import { useNavigation } from '@react-navigation/native';
interface UserItemProps {
  oneUserItem: {
    imageUri:any;
    name:any;
    // Add other properties of 'chatRoomDataItem' if any
  };
}

const UserItem: React.FC<UserItemProps> = ({ oneUserItem }: UserItemProps) => {
  const navigation = useNavigation();

  const createChatRoom = async () => {
    const newChatRoom = await DataStore.save(new ChatRoom({newMessages:0}));

    // TODO if there is already a chat room between these 2 users
    // then redirect to the existing chat room
    // otherwise, create a new chatroom with these users.

    // connect authenticated user with the chat room
    const authUser = await Auth.currentAuthenticatedUser();
    console.log(authUser.attributes.sub);
    
    const dbUser = await DataStore.query(User, authUser.attributes.sub);

    await DataStore.save(new ChatRoomUser({
      user : dbUser,
      chatroom : newChatRoom
    }))

    await DataStore.save(new ChatRoomUser({
      user : oneUserItem,
      chatroom : newChatRoom
    }))
    // if (!dbUser) {
    //   Alert.alert("There was an error creating the group");
    //   return;
    // }
    // Create a chat room
    // const newChatRoomData = {
    //   newMessages: 0,
    //   Admin: dbUser,
    // };
    // if (users.length > 1) {
    //   newChatRoomData.name = "New group 2";
    //   newChatRoomData.imageUri =
    //     "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/group.jpeg";
    // }

    // if (dbUser) {
    //   await addUserToChatRoom(dbUser, newChatRoom);
    // }

    // connect users user with the chat room
    // await Promise.all(
    //   users.map((user) => addUserToChatRoom(user, newChatRoom))
    // );

    // navigation.navigate('ChatRoomScreen', { chatRoomDataItem: item });
  };

 

  
  console.log(oneUserItem,"chatRoomDataItem");
  
  
  return (
    <Pressable  onPress={createChatRoom}>
<View style={styles.container}>
      <Image style={styles.image} source={{uri : oneUserItem?.imageUri}} />
      {/* {chatRoomDataItem.newMessages ? <View style={styles.badgeContainer}><Text style={styles.badgeText}>{chatRoomDataItem.newMessages}</Text></View> : null} */}
      <View style={styles.RightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{oneUserItem?.name}</Text>
          {/* <Text style={styles.text}>{chatRoomDataItem.lastMessage.createdAt}</Text> */}
        </View>
        {/* <Text numberOfLines={1} style={styles.text}>{chatRoomDataItem.lastMessage.content}</Text> */}
      </View>
    </View>
    </Pressable>
    
  );
};





export default UserItem
