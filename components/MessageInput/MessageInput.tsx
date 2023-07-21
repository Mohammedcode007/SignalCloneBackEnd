import React, { useState } from 'react'
import { View, KeyboardAvoidingView, Platform, StyleSheet, TextInput, Pressable } from 'react-native'
import { SimpleLineIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Feather, AntDesign } from '@expo/vector-icons';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, LazyMessage, Message } from '../../src/models';

const MessageInput = ({ chatRoom }) => {
    const [message, setmessage] = useState('')
    const sendMessage = async () => {
        const authUser = await Auth.currentAuthenticatedUser();

        const newMessage = await DataStore.save(new Message({
            content: message,
            userID: authUser.attributes.sub,
            chatroomID: chatRoom.id
        }))

        updateLastMessage(newMessage)
        setmessage('')
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
            style={styles.root}>
            <View style={styles.inputContainer}>
                <SimpleLineIcons style={styles.icon} name="emotsmile" size={24} color="#595959" />
                <TextInput
                    value={message}
                    onChangeText={setmessage}
                    placeholder='Message'
                    style={styles.input} />
                <Ionicons style={styles.icon} name="camera-outline" size={24} color="#595959" />
                <Feather style={styles.icon} name="mic" size={24} color="#595959" />
            </View>
            <Pressable onPress={onPress} style={styles.buttonContainer}>
                {
                    Message ? <Feather name="send" size={24} color="blue" /> :
                        <Feather name="send" size={24} color="grey" />

                }
            </Pressable>
        </KeyboardAvoidingView>

    )
}
const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        padding: 10
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
    input: {
        flex: 1,
        marginHorizontal: 5
    }
});
export default MessageInput
