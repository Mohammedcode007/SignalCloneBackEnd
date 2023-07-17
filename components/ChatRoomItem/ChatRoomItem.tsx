import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';

interface ChatRoomItemProps {
  chatRoomDataItem: {
    users: any[]; // Update this with the actual type of 'user' arraa
    newMessages:any;
    lastMessage:any;
    // Add other properties of 'chatRoomDataItem' if any
  };
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ chatRoomDataItem }: ChatRoomItemProps) => {
  const user = chatRoomDataItem?.users[1];
  
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{uri : user.imageUri}} />
      {chatRoomDataItem.newMessages ? <View style={styles.badgeContainer}><Text style={styles.badgeText}>{chatRoomDataItem.newMessages}</Text></View> : null}
      <View style={styles.RightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.text}>{chatRoomDataItem.lastMessage.createdAt}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>{chatRoomDataItem.lastMessage.content}</Text>
      </View>
    </View>
  );
};





export default ChatRoomItem
