import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';
import { ChatRoomUser, User,ChatRoom, Message } from '../../src/models';
import { Auth, DataStore } from 'aws-amplify';

interface ChatRoomItemProps {
  chatRoomDataItem: {
    users: any[]; // Update this with the actual type of 'user' arraa
    newMessages:any;
    lastMessage:any;
    // Add other properties of 'chatRoomDataItem' if any
  };
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ chatRoomDataItem }: ChatRoomItemProps) => {
  // const user = chatRoomDataItem?.users[1];
    const [users, setUsers] = useState<User[]>([]); // all users in this chatroom
    const [user, setUser] = useState<User | null>(null); // the display user
    const [lastMessage, setLastMessage] = useState<Message | undefined>();
    const [isLoading, setIsLoading] = useState(true);
console.log(lastMessage,"chatRoomDataItem");

    useEffect(() => {
      const fetchUsers = async () => {
        const fetchedUsersId = (await DataStore.query(ChatRoomUser))
          .filter((chatRoomUser) => chatRoomUser.chatRoomId === chatRoomDataItem?.id)
          .map((chatRoomUser) => chatRoomUser.userId);
  // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");
  

  const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
      // console.log(UserDetails, "555555555555555555555555");
        // setUsers(UserDetails);
  
        const authUser = await Auth.currentAuthenticatedUser();
        setUser(
          UserDetails.find((user) => user.id !== authUser.attributes.sub) || null
        );
        setIsLoading(false);
      };
      fetchUsers();
    }, []);

    useEffect(() => {
      if (!chatRoomDataItem.chatRoomLastMessageId) {
        return;
      }
      DataStore.query(Message, chatRoomDataItem.chatRoomLastMessageId).then(
        setLastMessage
      );
    }, []);
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{uri : user?.imageUri}} />
      {chatRoomDataItem.newMessages > 0 ? <View style={styles.badgeContainer}><Text style={styles.badgeText}>{chatRoomDataItem?.newMessages}</Text></View> : null}
      <View style={styles.RightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.text}>{lastMessage?.createdAt}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>{lastMessage?.content}</Text>
      </View>
    </View>
  );
};





export default ChatRoomItem
