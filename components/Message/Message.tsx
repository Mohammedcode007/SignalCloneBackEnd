import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, useWindowDimensions, Pressable, Animated, TouchableOpacity, Alert, Modal } from 'react-native';
import { ChatRoomAdminship, ChatRoomBanship, ChatRoomMembership, ChatRoomOwnership, ChatRoomUser, User, ChatRoom } from '../../src/models';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { S3Image } from "aws-amplify-react-native";
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";
import MessageReply from "../MessageReply";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { removeFromActive, setexitMessageContent } from '../../redux/mainSlice';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();

  // const isMe = message.user.id === myID;
  const { message: propMessage } = MessageProps;
  const { setAsMessageReply } = MessageProps;
  const [repliedTo, setRepliedTo] = useState<MessageModel | undefined>(
    undefined
  );
  const dispatch = useDispatch();


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

  // console.log(isMe,"isme");
  // console.log(user, "user");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isWelcomeMessageVisible, setWelcomeMessageVisible] = useState(false);
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const addOwner = async (userId) => {

    try {
      const user = await DataStore.query(User, userId);

      if (!user) {
        console.log(`User with ID ${userId} not found.`);
        return;
      }

      // Check if the user is already an admin or member
      const isAdmin = (await DataStore.query(ChatRoomAdminship)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isMember = (await DataStore.query(ChatRoomMembership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isOwner = (await DataStore.query(ChatRoomOwnership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);

      if (isOwner.length > 0) {
        console.log(`User with ID ${userId} is already an owner.`);
        return;
      }

      if (isAdmin.length > 0 || isMember.length > 0) {
        console.log('Removing user from admin or member list...');
        // Fetch and delete user's admin records
        await Promise.all(isAdmin.map(record => DataStore.delete(ChatRoomAdminship, record.id)));

        // Fetch and delete user's member records
        await Promise.all(isMember.map(record => DataStore.delete(ChatRoomMembership, record.id)));

        console.log('User removed from admin or member list.');
      }

      // Add user to the owner list
      const newOwnershipRecord = await DataStore.save(
        new ChatRoomOwnership({
          userID: userId,
          chatroomID: message?.chatroomID,
        })
      );
      console.log('User added to owner list successfully:', newOwnershipRecord);
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      // أنشئ محتوى رسالة الخروج
      if (dbUser) {

        const exitMessage = await DataStore.save(
          new MessageModel({
            content: `${user?.name}  set owner by ${dbUser.name} `,
            userID: '90ccf9ec-4021-700a-1e8e-3523a0692654',
            chatroomID: message?.chatroomID,
          })
        );
        dispatch(setexitMessageContent(exitMessage))


      }
      console.log('Ownership records updated successfully.');
    } catch (error) {
      console.error('Error updating ownership records:', error);
      throw error;
    }
  };


  const addAdmin = async (userId) => {

    try {
      const user = await DataStore.query(User, userId);

      if (!user) {
        console.log(`User with ID ${userId} not found.`);
        return;
      }

      // Check if the user is already an admin or member
      const isAdmin = (await DataStore.query(ChatRoomAdminship)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isMember = (await DataStore.query(ChatRoomMembership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isOwner = (await DataStore.query(ChatRoomOwnership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);

      if (isAdmin.length > 0) {
        console.log(`User with ID ${userId} is already an admin.`);
        return;
      }

      if (isOwner.length > 0 || isMember.length > 0) {
        console.log('Removing user from admin or member list...');
        // Fetch and delete user's admin records
        await Promise.all(isOwner.map(record => DataStore.delete(ChatRoomOwnership, record.id)));

        // Fetch and delete user's member records
        await Promise.all(isMember.map(record => DataStore.delete(ChatRoomMembership, record.id)));

        console.log('User removed from admin or member list.');
      }

      // Add user to the owner list
      const newAdminshipRecord = await DataStore.save(
        new ChatRoomAdminship({
          userID: userId,
          chatroomID: message?.chatroomID,
        })
      );
      console.log('User added to owner list successfully:', newAdminshipRecord);
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      // أنشئ محتوى رسالة الخروج
      if (dbUser) {

        const exitMessage = await DataStore.save(
          new MessageModel({
            content: `${user?.name}  set admin by ${dbUser.name} `,
            userID: '90ccf9ec-4021-700a-1e8e-3523a0692654',
            chatroomID: message?.chatroomID,
          })
        );
        dispatch(setexitMessageContent(exitMessage))


      }
      console.log('Ownership records updated successfully.');
    } catch (error) {
      console.error('Error updating ownership records:', error);
      throw error;
    }
  };

  const addMemer = async (userId) => {

    try {
      const user = await DataStore.query(User, userId);

      if (!user) {
        console.log(`User with ID ${userId} not found.`);
        return;
      }

      // Check if the user is already an admin or member
      const isAdmin = (await DataStore.query(ChatRoomAdminship)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isMember = (await DataStore.query(ChatRoomMembership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isOwner = (await DataStore.query(ChatRoomOwnership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);

      if (isMember.length > 0) {
        console.log(`User with ID ${userId} is already an admin.`);
        return;
      }

      if (isOwner.length > 0 || isAdmin.length > 0) {
        console.log('Removing user from admin or member list...');
        // Fetch and delete user's admin records
        await Promise.all(isOwner.map(record => DataStore.delete(ChatRoomOwnership, record.id)));

        // Fetch and delete user's member records
        await Promise.all(isAdmin.map(record => DataStore.delete(ChatRoomAdminship, record.id)));

        console.log('User removed from admin or member list.');
      }

      // Add user to the owner list
      const newAdminshipRecord = await DataStore.save(
        new ChatRoomMembership({
          userID: userId,
          chatroomID: message?.chatroomID,
        })
      );
      console.log('User added to owner list successfully:', newAdminshipRecord);
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      // أنشئ محتوى رسالة الخروج
      if (dbUser) {

        const exitMessage = await DataStore.save(
          new MessageModel({
            content: `${user?.name}  set member by ${dbUser.name} `,
            userID: '90ccf9ec-4021-700a-1e8e-3523a0692654',
            chatroomID: message?.chatroomID,
          })
        );
        dispatch(setexitMessageContent(exitMessage))


      }
      console.log('Ownership records updated successfully.');
    } catch (error) {
      console.error('Error updating ownership records:', error);
      throw error;
    }
  };


  const addBan = async (userId) => {

    try {
      const user = await DataStore.query(User, userId);

      if (!user) {
        console.log(`User with ID ${userId} not found.`);
        return;
      }

      // Check if the user is already an admin or member
      const isAdmin = (await DataStore.query(ChatRoomAdminship)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isMember = (await DataStore.query(ChatRoomMembership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);
      const isOwner = (await DataStore.query(ChatRoomOwnership)).filter((u) => u?.userID === userId && u?.chatroomID === message?.chatroomID);

      if (isMember.length > 0) {
        console.log(`User with ID ${userId} is already an admin.`);
        return;
      }

      if (isOwner.length > 0 || isAdmin.length > 0 || isMember.length > 0) {
        console.log('Removing user from admin or member list...');
        // Fetch and delete user's admin records
        await Promise.all(isOwner.map(record => DataStore.delete(ChatRoomOwnership, record.id)));

        // Fetch and delete user's member records
        await Promise.all(isAdmin.map(record => DataStore.delete(ChatRoomAdminship, record.id)));
        await Promise.all(isMember.map(record => DataStore.delete(ChatRoomMembership, record.id)));

        console.log('User removed from admin or member list.');
      }

      const chatRoomUserToDelete = await (
        await DataStore.query(ChatRoomUser)
      ).filter(
        (cru) => cru.chatRoomId === message?.chatroomID && cru?.userId === userId
      );

      if (chatRoomUserToDelete.length > 0) {

        await DataStore.delete(ChatRoomUser, chatRoomUserToDelete[0]?.id);

        navigation.navigate('(tabs)');


        console.log("تم حذف المستخدم بنجاح من غرفة الدردشة");
      } else {
        console.log("لم يتم العثور على المستخدم في غرفة الدردشة");
      }

      // Add user to the owner list
      const newBanshipRecord = await DataStore.save(
        new ChatRoomBanship({
          userID: userId,
          chatroomID: message?.chatroomID,
        })
      );


      console.log('User added to ban list successfully:', newBanshipRecord);
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      // أنشئ محتوى رسالة الخروج
      if (dbUser) {

        const exitMessage = await DataStore.save(
          new MessageModel({
            content: `${user?.name}  set ban by ${dbUser.name} `,
            userID: '90ccf9ec-4021-700a-1e8e-3523a0692654',
            chatroomID: message?.chatroomID,
          })
        );
        dispatch(removeFromActive(message?.chatroomID));

        dispatch(setexitMessageContent(exitMessage))


      }
      console.log('Ownership records updated successfully.');
    } catch (error) {
      console.error('Error updating ownership records:', error);
      throw error;
    }
  };
  const kickuser = async (userId) => {
    try {
      // Find the specific ChatRoomUser instance to delete
      const chatRoomUserToDelete = await (
        await DataStore.query(ChatRoomUser)
      ).filter(
        (cru) => cru.chatRoomId === message?.chatroomID && cru?.userId === userId
      );

      if (chatRoomUserToDelete.length > 0) {

        await DataStore.delete(ChatRoomUser, chatRoomUserToDelete[0]?.id);
        const authUser = await Auth.currentAuthenticatedUser();
        const dbUser = await DataStore.query(User, authUser.attributes.sub);

        // أنشئ محتوى رسالة الخروج
        if (dbUser) {

          const exitMessage = await DataStore.save(
            new MessageModel({
              content: `${user?.name}  kicked by ${dbUser.name} `,
              userID: '90ccf9ec-4021-700a-1e8e-3523a0692654',
              chatroomID: message?.chatroomID,
            })
          );
          dispatch(removeFromActive(message?.chatroomID));
          dispatch(setexitMessageContent(exitMessage))


        }
        navigation.navigate('(tabs)');

        console.log("user kickied");
      } else {
        console.log("لم يتم العثور على المستخدم في غرفة الدردشة");
      }


    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const [adminColor, setadminColor] = useState([])
  const [memberColor, setmemberColor] = useState([])
  const [ownerColor, setownerColor] = useState([])

  const chekcolor = async () => {
    if (message) {

      const isAdmin = (
        await DataStore.query(ChatRoomAdminship)
      ).filter((u) => u?.userID === message?.userID && u?.chatroomID === message?.chatroomID).map((i) => i?.userID);

      const isMember = (
        await DataStore.query(ChatRoomMembership)
      ).filter((u) => u?.userID === message?.userID && u?.chatroomID === message?.chatroomID).map((i) => i?.userID);

      const isOwner = (
        await DataStore.query(ChatRoomOwnership)
      ).filter((u) => u?.userID === message?.userID && u?.chatroomID === message?.chatroomID).map((i) => i?.userID);



      // Update adminColor state with the new values
      setadminColor((prevAdminColor) => prevAdminColor.concat(isAdmin));
      setmemberColor((prevAdminColor) => prevAdminColor.concat(isMember));
      setownerColor((prevAdminColor) => prevAdminColor.concat(isOwner));

      // Update memberColor state with the new values

    }
  };

  const handleCommonActions = () => {
    // Put the common logic you want to run here
    chekcolor();
  };

  useEffect(() => {

    handleCommonActions();



  }, [])

  useEffect(() => {
    handleCommonActions();



  }, [message])


  useEffect(() => {
    const addBan = async () => {

      try {
        const authUser = await Auth.currentAuthenticatedUser();
        const dbUser = await DataStore.query(User, authUser.attributes.sub);

        if (!dbUser) {
          console.log(`User with ID ${dbUser?.id} not found.`);
          return;
        }

        // Check if the user is already an admin or member
        const isAdmin = (await DataStore.query(ChatRoomAdminship)).filter((u) => u?.userID === dbUser?.id && u?.chatroomID === message?.chatroomID);
        const isMember = (await DataStore.query(ChatRoomMembership)).filter((u) => u?.userID === dbUser?.id && u?.chatroomID === message?.chatroomID);
        const isOwner = (await DataStore.query(ChatRoomOwnership)).filter((u) => u?.userID === dbUser?.id && u?.chatroomID === message?.chatroomID);

        // if (isMember.length > 0) {
        //   console.log(`User with ID ${dbUser?.id} is already an admin.`);
        //   return;
        // }

        if (isAdmin.length > 0) {
          console.log(`User with ID ${dbUser?.id} is already an admin2.`);
          return;
        }

        if (isOwner.length > 0) {
          console.log(`User with ID ${dbUser?.id} is already an OWNER.`);
          return;
        }




      } catch (error) {
        throw error;
      }
    };
    addBan()

  }, [])


  if (!user) {
    return <ActivityIndicator />;
  }
  return (
    <View style={{ flex: 1 }}>
      {
        message?.userID === '90ccf9ec-4021-700a-1e8e-3523a0692654' ? (
          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text>{message?.content}</Text>
          </View>
        ) : (
          <View style={{ flexDirection: isMe ? 'row' : 'row-reverse', display: "flex", alignItems: 'flex-start', position: 'relative' }}>
            <TouchableOpacity onPress={toggleDropdown}>
              {
                user?.imageUri ? (
                  <Image
                    style={[
                      styles.imagecontainer,
                      {
                        backgroundColor: "white",
                        marginRight: 5,
                      },
                      {
                        width: 40,
                        height: 40
                      },
                    ]}

                    source={user?.imageUri ? { uri: user.imageUri } : undefined} />
                ) : (
                  <Image
                    style={[
                      styles.imagecontainer,
                      {
                        backgroundColor: "white",
                        marginRight: 5,
                      },
                      {
                        width: 40,
                        height: 40
                      },
                    ]}

                    source={require('../../assets/images/manlogo.png')} />
                )
              }

              <View style={styles.star}>
                <Entypo name="star" size={20} color={adminColor.includes(user?.id) ? 'blue' : ownerColor.includes(user?.id) ? 'red' : memberColor.includes(user?.id) ? 'green' : 'grey'} />
              </View>
            </TouchableOpacity>
            <Modal
              visible={isDropdownVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={toggleDropdown}
            >
              <TouchableOpacity
                style={styles.modalBackground} // Add a new style for the background
                onPress={toggleDropdown}      // Close the modal when the background is pressed
              >
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity onPress={() => addOwner(user?.id)} style={styles.dropdownItem}>
                    <Text>Make Owner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => addAdmin(user?.id)} style={styles.dropdownItem}>
                    <Text>Make Admin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => addMemer(user?.id)} style={styles.dropdownItem}>
                    <Text>Make Member</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => kickuser(user?.id)} style={styles.dropdownItem}>
                    <Text>Kick</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => addBan(user?.id)} style={styles.dropdownItem}>
                    <Text>ban</Text>
                  </TouchableOpacity>
                  {/* Add more dropdown items as needed */}
                </View>
              </TouchableOpacity>

            </Modal>
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
                    backgroundColor: "#D0ECE8",
                    marginLeft: 2,
                    marginRight: 2,
                    borderTopRightRadius: isMe ? 20 : 0,
                    borderTopLeftRadius: isMe ? 0 : 20,
                    transform: [{ translateX: panX }],
                  },
                  { width: soundURI ? "75%" : "auto" },
                ]}
              >
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} onPress={openActionMenu}>
                    <View>
                      <Text style={{ color: adminColor.includes(user?.id) ? 'blue' : ownerColor.includes(user?.id) ? 'red' : memberColor.includes(user?.id) ? 'green' : 'black' }
                      }>
                        {user.name}


                      </Text>

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

                      <Text style={{ color: 'black' }}>
                        {isDeleted ? "message deleted" : message.content}


                      </Text>

                    </View>

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
                </View>

              </Animated.View>
            </PanGestureHandler>
          </View>

        )
      }

    </View>


  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3777f0',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: '75%',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  star: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  imagecontainer: {
    padding: 10,
    margin: 5,
    borderRadius: 20,
    alignItems: 'flex-end'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the opacity as needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 40, // Adjust this value based on your design
    right: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 5,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: '50%'
  },
});

export default Message;
