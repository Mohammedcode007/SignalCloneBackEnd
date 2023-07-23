import React, { useEffect, useState } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, TextInput, Pressable, Image } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Feather, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { ChatRoom, LazyMessage, Message } from '../../src/models';
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from 'expo-image-picker';
import uuid from 'uuid-random';
import { Audio, AVPlaybackStatus } from "expo-av";
import AudioPlayer from "../AudioPlayer";

const MessageInput = ({ chatRoom }) => {
  const [message, setmessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundURI, setSoundURI] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const libraryResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
        await Audio.requestPermissionsAsync();

        if (libraryResponse.status !== "granted" || photoResponse.status !== "granted") {
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

    if (!result.cancelled) {
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

  const resetFields = () => {
    setmessage("");
    setIsEmojiPickerOpen(false);
    setImage(null);
    setProgress(0);
    setSoundURI(null);

  };

  const progressCallback = (progress) => {
    setProgress(progress.loaded / progress.total);
  };

  const sendImage = async () => {
    if (!image) {
      return;
    }
    const blob = await getBlob(image);
    const { key } = await Storage.put(`${uuid()}.png`, blob, {
      progressCallback,
    });

    // send message
    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        image: key,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
      })
    );

    updateLastMessage(newMessage);

    resetFields();
  };

  const getBlob = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  // ... الكود السابق ...

const startRecording = async () => {
  try {
    if (recording) {
      console.log("Recording is already in progress.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    console.log("Starting recording..");
    const { recording } = await Audio.Recording.createAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
    );
    setRecording(recording);
    console.log("Recording started");
  } catch (err) {
    console.error("Failed to start recording", err);
  }
};

// ... الكود السابق ...


  const stopRecording = async () => {
    console.log("Stopping recording..");
    if (!recording) {
      return;
    }

    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
    if (!uri) {
      return;
    }
    setSoundURI(uri);
  };

  const sendAudio = async () => {
    if (!soundURI) {
      return;
    }
    const uriParts = soundURI.split(".");
    const extenstion = uriParts[uriParts.length - 1];
    const blob = await getBlob(soundURI);
    const { key } = await Storage.put(`${uuid()}.${extenstion}`, blob, {
      progressCallback,
    });

    // send message
    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        audio: key,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
      })
    );

    updateLastMessage(newMessage);

    resetFields();
  };

  const onPress = () => {
    if (image) {
      sendImage();
    } else if (message) {
      sendMessage();
    } else if (soundURI) {
      sendAudio();
    } else {
      // onPlusClicked();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
      style={[styles.root, { height: isEmojiPickerOpen ? '50%' : 'auto' }]}
    >
      {image && (
        <View style={styles.sendImageContainer}>
          <Image
            source={{ uri: image }}
            style={{ width: 100, height: 100, borderRadius: 10 }}
          />
          <View style={{ flex: 1, justifyContent: "flex-start", alignSelf: "flex-end" }}>
            <View style={{ height: 5, borderRadius: 5, backgroundColor: "#3777f0", width: `${progress * 100}%` }} />
          </View>
          <Pressable onPress={() => setImage(null)}>
            <AntDesign name="close" size={24} color="black" style={{ margin: 5 }} />
          </Pressable>
        </View>
      )}
            {soundURI && <AudioPlayer soundURI={soundURI} />}

      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Pressable onPress={() => setIsEmojiPickerOpen((currentValue) => !currentValue)}>
            <SimpleLineIcons style={styles.icon} name="emotsmile" size={24} color="#595959" />
          </Pressable>
          <TextInput
            value={message}
            onChangeText={setmessage}
            placeholder='Message'
            style={styles.input}
          />
          <Pressable onPress={() => pickImage()}>
            <Ionicons style={styles.icon} name="image" size={24} color="#595959" />
          </Pressable>
          <Pressable onPress={takePhoto}>
            <Feather name="camera" size={24} color="#595959" style={styles.icon} />
          </Pressable>
          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <MaterialCommunityIcons
              name={recording ? "microphone" : "microphone-outline"}
              size={24}
              color={recording ? "red" : "#595959"}
              style={styles.icon}
            />
          </Pressable>
        </View>
        <Pressable onPress={onPress} style={styles.buttonContainer}>
          {message || image || soundURI ? (
            <Feather name="send" size={24} color="blue" />
          ) : (
            <Feather name="send" size={24} color="grey" />
          )}
        </Pressable>
      </View>
      {isEmojiPickerOpen && (
        <EmojiSelector
          onEmojiSelected={(emoji) => setmessage((currentMessage) => currentMessage + emoji)}
          columns={8}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 10,
  },
  buttonContainer: {
    width: 40,
    height: 40,
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

export default MessageInput;
