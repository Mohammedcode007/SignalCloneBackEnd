import React, { useEffect, useState } from 'react'
import { View, KeyboardAvoidingView, Platform, StyleSheet, TextInput, Pressable,Image } from 'react-native'
import { SimpleLineIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Feather, AntDesign } from '@expo/vector-icons';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, LazyMessage, Message } from '../../src/models';
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from 'expo-image-picker';
const MessageInput = ({ chatRoom }) => {
    const [message, setmessage] = useState('')
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        (async () => {
          if (Platform.OS !== "web") {
            const libraryResponse =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
            // await Audio.requestPermissionsAsync();
    
            if (
              libraryResponse.status !== "granted" ||
              photoResponse.status !== "granted"
            ) {
              alert("Sorry, we need camera roll permissions to make this work!");
            }
          }
        })();
      }, []);
    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          aspect: [4, 3],
        });
    
        if (!result.cancelled) {
          setImage(result.uri);
        }
      };

    const sendMessage = async () => {
        const authUser = await Auth.currentAuthenticatedUser();

        const newMessage = await DataStore.save(new Message({
            content: message,
            userID: authUser.attributes.sub,
            chatroomID: chatRoom.id
        }))

        updateLastMessage(newMessage)
        setmessage('')
        setIsEmojiPickerOpen(false)
    };
    const updateLastMessage = async (newMessage: LazyMessage | null | undefined) => {

        DataStore.save(
            ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
                updatedChatRoom.LastMessage = newMessage;
            })
        );
    };

    const onPlusMessage = () => {
        console.warn('on plus');

    }
    const onPress = () => {
        if (Message) {
            sendMessage()
        } else {
            onPlusMessage()
        }

    }
   
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
            style={[styles.root, { height: isEmojiPickerOpen ? '50%' : 'auto' }]}>
                   {image && (
        <View style={styles.sendImageContainer}>
          <Image
            source={{ uri: image }}
            style={{ width: 100, height: 100, borderRadius: 10 }}
          />

          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignSelf: "flex-end",
            }}
          >
            <View
              style={{
                height: 5,
                borderRadius: 5,
                backgroundColor: "#3777f0",
                width: `${progress * 100}%`,
              }}
            />
          </View>

          <Pressable onPress={() => setImage(null)}>
            <AntDesign
              name="close"
              size={24}
              color="black"
              style={{ margin: 5 }}
            />
          </Pressable>
        </View>
      )}
            <View style={styles.row}>
                <View style={styles.inputContainer}>
                    <Pressable
                        onPress={() =>
                            setIsEmojiPickerOpen((currentValue) => !currentValue)
                        }>
                        <SimpleLineIcons style={styles.icon} name="emotsmile" size={24} color="#595959" />

                    </Pressable>
                    <TextInput
                        value={message}
                        onChangeText={setmessage}
                        placeholder='Message'
                        style={styles.input} />
                        <Pressable onPress={()=>pickImage()}>
                        <Ionicons style={styles.icon} name="image" size={24} color="#595959" />

                        </Pressable>
                        <Pressable onPress={takePhoto}>
            <Feather
              name="camera"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>
                    <Feather style={styles.icon} name="mic" size={24} color="#595959" />
                </View>
                <Pressable onPress={onPress} style={styles.buttonContainer}>
                    {
                        Message ? <Feather name="send" size={24} color="blue" /> :
                            <Feather name="send" size={24} color="grey" />

                    }
                </Pressable>
            </View>


            {isEmojiPickerOpen && (
                <EmojiSelector
                    onEmojiSelected={(emoji) =>
                        setmessage((currentMessage) => currentMessage + emoji)
                    }
                    columns={8}
                />
            )}
        </KeyboardAvoidingView>

    )
}
const styles = StyleSheet.create({
    root: {
        padding: 10,
    },
    buttonContainer: {
        width: 40,
        height: 40,
        // backgroundColor: '#3777f0',
        borderRadius: 25,
        justifyContent: "center",
        alignItems: 'center'
    },
    icon: {
        marginHorizontal: 5
    },
    row: {
        flexDirection: "row",
    },
    inputContainer: {
        backgroundColor: '#f2f2f2',
        flex: 1,
        marginRight: 10,
        borderRadius: 25,
        // justifyContent: 'center',
        borderColor: '#dedede',
        borderWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
        padding: 5

    },
    buttonText: {
        color: 'white',
        fontSize: 35,
    },
    sendImageContainer: {
        flexDirection: "row",
        marginVertical: 10,
        alignSelf: "stretch",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "lightgray",
        borderRadius: 10,
      },
    input: {
        flex: 1,
        marginHorizontal: 5
    }
});
export default MessageInput
