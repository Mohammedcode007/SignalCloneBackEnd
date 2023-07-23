import React,{useState,useEffect} from 'react';
import { View, Text, StyleSheet,ActivityIndicator,useWindowDimensions } from 'react-native';
import { User } from '../../src/models';
import { Auth, DataStore } from 'aws-amplify';
import { S3Image } from "aws-amplify-react-native";

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
  // const isMe = message.user.id === myID;
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean | null>(null);


  const { width } = useWindowDimensions();
  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    const checkIfMe = async () => {
      if (!user) {
        return;
      }
      const authUser = await Auth.currentAuthenticatedUser();
      setIsMe(user.id === authUser.attributes.sub);
    };
    checkIfMe();
  }, [user]);


  if (!user) {
    return <ActivityIndicator />;
  }
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
       {message.image && (
          <View style={{ marginBottom: message.content ? 10 : 0 }}>
            <S3Image
              imgKey={message.image}
              style={{ width: width * 0.65, aspectRatio: 4 / 3 }}
              resizeMode="contain"
            />
          </View>
        )}
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
