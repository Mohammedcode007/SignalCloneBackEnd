import React from 'react';
import { Image, StyleSheet, Pressable } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser } from "../../src/models";
import { useNavigation } from '@react-navigation/native';
import { Feather } from "@expo/vector-icons";

interface UserItemProps {
  oneUserItem: {
    imageUri: any;
    name: any;
    // Add other properties of 'chatRoomDataItem' if any

  };
  isSelected: void;
  onPress: () => void;
  isAdmin: false;
  onLongPress: () => void;

}

const UserItem: React.FC<UserItemProps> = ({ oneUserItem, isSelected, onPress, isAdmin, onLongPress }: UserItemProps) => {
  const navigation = useNavigation();


  // const createChatRoom = async () => {
  //   try {
  //     const newChatRoom = await DataStore.save(new ChatRoom({ newMessages: 0 }));

  //     const authUser = await Auth.currentAuthenticatedUser();

  //     const loggedInUserId = authUser.attributes.sub;
  //     const loggedInUser = await DataStore.query(User, loggedInUserId);
  //     const selectedUser = await DataStore.query(User, oneUserItem.id);

  //     if (loggedInUser && selectedUser) {
  //       await DataStore.save(new ChatRoomUser({
  //         user: loggedInUser,
  //         chatRoom: newChatRoom
  //       }));

  //       await DataStore.save(new ChatRoomUser({
  //         user: selectedUser,
  //         chatRoom: newChatRoom
  //       }));
  //     }
  //     navigation.navigate('ChatRoomScreen', { id: newChatRoom?.id });

  //     // Rest of the code..
  //   } catch (error) {
  //     console.error('Error creating chatroom:', error);
  //   }
  // };







  return (
    <Pressable onLongPress={onLongPress}
      onPress={onPress}>
      <View style={styles.container}>
        <Image style={styles.image} source={{ uri: oneUserItem?.imageUri }} />
        <View style={styles.RightContainer}>
          <View >
            <Text style={styles.name}>{oneUserItem?.name}</Text>
            {isAdmin && <Text>admin</Text>}

          </View>
        </View>
      </View>

      {isSelected !== undefined && (
        <Feather
          name={isSelected ? "check-circle" : "circle"}
          size={20}
          color="#4f4f4f"
        />
      )}
    </Pressable>

  );
};





export default UserItem
