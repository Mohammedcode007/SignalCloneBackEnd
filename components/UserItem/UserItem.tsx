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
    try {
      const newChatRoom = await DataStore.save(new ChatRoom({ newMessages: 0 }));
  
      const authUser = await Auth.currentAuthenticatedUser();
  
      const loggedInUserId = authUser.attributes.sub;
      const loggedInUser = await DataStore.query(User, loggedInUserId);
      const selectedUser = await DataStore.query(User, oneUserItem.id);
  
      if (loggedInUser && selectedUser) {
        await DataStore.save(new ChatRoomUser({
          user: loggedInUser,
          chatRoom: newChatRoom
        }));
  
        await DataStore.save(new ChatRoomUser({
          user: selectedUser,
          chatRoom: newChatRoom
        }));
      }
  
      // Rest of the code..
    } catch (error) {
      console.error('Error creating chatroom:', error);
    }
  };
  
  
 

  
  
  
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
