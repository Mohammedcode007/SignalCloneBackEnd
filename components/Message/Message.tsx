import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, Pressable, Animated,TouchableOpacity,Alert } from 'react-native';
import { User } from '../../src/models';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { S3Image } from "aws-amplify-react-native";
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import { Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";
import MessageReply from "../MessageReply";
import { PanGestureHandler,State } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';

interface MessageProps {
  message: {
    user: {
      id: string;
    };
    content: string;
    status: string

    // Add other properties of the message object if any
  };
  setAsMessageReply: () => void;

}
const myID = 'u1'
const blue = '#3777f0';
const grey = 'lightgrey';

const Message: React.FC<MessageProps> = (MessageProps) => {
  // const isMe = message.user.id === myID;
  const {  message: propMessage } = MessageProps;
  const {  setAsMessageReply} = MessageProps;
  const [repliedTo, setRepliedTo] = useState<MessageModel | undefined>(
    undefined
  );
  const [isDeleted, setIsDeleted] = useState(false);

  const { showActionSheetWithOptions } = useActionSheet();
  const deleteMessage = async () => {
    await DataStore.delete(message);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete the message?",
      [
        {
          text: "Delete",
          onPress: deleteMessage,
          style: "destructive",
        },
        {
          text: "Cancel",
        },
      ]
    );
  };

  const onActionPress = (index) => {
    if (index === 0) {
      setAsMessageReply();
    } else if (index === 1) {
      if (isMe) {
        confirmDelete();
      } else {
        Alert.alert("Can't perform action", "This is not your message");
      }
    }
  };
  const openActionMenu = () => {
    const options = ["Reply", "Delete", "Cancel"];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      onActionPress
    );
  };
  const [message, setMessage] = useState<MessageModel>(propMessage);

  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean | null>(null);
  const [soundURI, setSoundURI] = useState<any>(null);


  const { width } = useWindowDimensions();
  const panX = new Animated.Value(0);

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    setMessage(propMessage);
  }, [propMessage]);
  useEffect(() => {
    if (message?.replyToMessageID) {
      DataStore.query(MessageModel, message.replyToMessageID).then(
        setRepliedTo
      );
    }
  }, [message]);


  // useEffect(() => {
  //   const subscription = DataStore.observe(MessageModel, message?.id).subscribe(
  //     (msg) => {
  //       if (msg.model === MessageModel) {
  //         if (msg.opType === "UPDATE" && msg.element) {
  //           setMessage((prevMessage) => ({ ...prevMessage, ...msg.element }));
  //         } 
  //       }
  //     }
  //   );
  
  //   return () => subscription.unsubscribe();
  // }, []);


  useEffect(() => {
    const subscription = DataStore.observe(MessageModel, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModel) {
          if (msg.opType === "UPDATE") {
            setMessage((prevMessage) => ({ ...prevMessage, ...msg.element }));
          } else if (msg.opType === "DELETE") {
            setIsDeleted(true);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  
  useEffect(() => {
    setAsRead();
  }, [isMe, message]);
  useEffect(() => {
    const checkIfMe = async () => {
      if (!user) {
        return;
      }
      const authUser = await Auth.currentAuthenticatedUser();
      setIsMe(user?.id === authUser.attributes.sub);
    };
    checkIfMe();
  }, [user]);
  useEffect(() => {
    if (message.audio) {
      Storage.get(message.audio).then(setSoundURI);
    }
  }, [message]);

  const setAsRead = async () => {
    if (isMe === false && message.status !== "READ") {
      await DataStore.save(
        MessageModel.copyOf(message, (updated) => {
          updated.status = "READ";
        })
      );
    }
  };


  const handlePanGesture = Animated.event([{ nativeEvent: { translationX: panX } }], {
    useNativeDriver: false,
  });

  const handleRelease = () => {
    Animated.spring(panX, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };


  if (!user) {
    return <ActivityIndicator />;
  }
  return (

    <PanGestureHandler
      onGestureEvent={handlePanGesture}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
          if (nativeEvent.translationX > 0) {
            setAsMessageReply()
            // السحب إلى اليمين
            // اكتب الفعل الذي تريد تنفيذه عند السحب إلى اليمين هنا
          } else {
            setAsMessageReply()
            // السحب إلى اليسار
            // اكتب الفعل الذي تريد تنفيذه عند السحب إلى اليسار هنا
          }
          handleRelease();
        }
      }}
    >
      <Animated.View
      
        style={[
          styles.container,
          {
            backgroundColor: isMe ? grey : blue,
            marginLeft: isMe ? 'auto' : 10,
            marginRight: isMe ? 10 : 'auto',
            transform: [{ translateX: panX }],
          },
          { width: soundURI ? "75%" : "auto" },
        ]}
      >
        <TouchableOpacity onPress={openActionMenu}>
          
      {repliedTo && <MessageReply message={repliedTo} />}

{message.image && (
  <View style={{ marginBottom: message.content ? 10 : 0 }}>
    <S3Image
      imgKey={message.image}
      style={{ width: width * 0.65, aspectRatio: 4 / 3 }}
      resizeMode="contain"
    />
  </View>
)}
{soundURI && <AudioPlayer soundURI={soundURI} />}

<Text style={{ color: isMe ? 'black' : 'white' }}>
{isDeleted ? "message deleted" : message.content}

  
  </Text>

{isMe && !!message.status && message.status !== "SENT" && (
    <Ionicons
      name={
        message.status === "DELIVERED" ? "checkmark" : "checkmark-done"
      }
      size={16}
      color="gray"
      style={{ marginHorizontal: 5 }}
    />
  )}
        </TouchableOpacity>
</Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3777f0',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: '75%',
    alignItems:'flex-end'
  },
});

export default Message;
