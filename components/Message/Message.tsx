import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageProps {
  message: {
    user: {
      id: string;
    };
    content:string
    // Add other properties of the message object if any
  };
}
const myID = 'u1'
const blue = '#3777f0';
const grey = 'lightgrey';

const Message: React.FC<MessageProps> = ({ message }) => {
  const isMe = message.user.id === myID;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isMe ? grey : blue,
          marginLeft: isMe ? 'auto' : 10,
          marginRight: isMe ? 10 : 'auto',
        },
      ]}
    >
      <Text style={{ color: isMe ? 'black' : 'white' }}>{message.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3777f0',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
});

export default Message;
