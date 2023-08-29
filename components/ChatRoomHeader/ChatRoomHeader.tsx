import React, { useEffect, useState } from 'react';
import { Image, Text, View, TouchableOpacity, useWindowDimensions, SafeAreaView, Pressable, Modal, StyleSheet, TextInput, FlatList, ScrollView, Alert } from 'react-native';
import { Ionicons, Feather, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser, User } from '../../src/models';
import moment from 'moment';
import UserItem from '../UserItem/UserItem';
import Message from '../Message/Message';
import { Message as MessageModel } from "../../src/models";
import { COLORS } from '../../utils/COLORS';

const ChatRoomHeader = ({ id }) => {
  const { width } = useWindowDimensions()
  const navigation = useNavigation();
  const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newWelcomeMessage, setNewWelcomeMessage] = useState('');
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isDropdownVisibleuser, setDropdownVisibleuser] = useState(false);

  const [isWelcomeMessageVisible, setWelcomeMessageVisible] = useState(false); // State to control welcome message modal visibility
  // console.log(chatRoom,"chatRoom");

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const toggleDropdownuser = () => {
    setDropdownVisibleuser(!isDropdownVisibleuser);
  };
  const toggleWelcomeMessageModal = () => {
    setWelcomeMessageVisible(!isWelcomeMessageVisible);
  };
  // تنفيذ الرجوع عند الحاجة
  const handleGoBack = () => {
    navigation.goBack();
  };

  const [user, setUser] = useState<User | null>(null); // the display user
  const fetchChatRoom = async () => {
    DataStore.query(ChatRoom, id).then(setChatRoom);


  };
  const fetchUsers = async () => {
    const fetchedUsersId = (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.chatRoomId === id)
      .map((chatRoomUser) => chatRoomUser.userId);
    // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


    const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
    // console.log(UserDetails, "555555555555555555555555");
    // setUsers(UserDetails);
    setAllUsers(UserDetails);

    const authUser = await Auth.currentAuthenticatedUser();
    setUser(
      UserDetails.find((user) => user.id !== authUser.attributes.sub) || null
    );
  };
  useEffect(() => {
    if (!id) {
      return;
    }
    fetchChatRoom()
    fetchUsers();
  }, [id]);


  // في دالة getLastOnlineText
  const getLastOnlineText = () => {
    if (!user?.lastOnlineAt) {
      return null;
    }

    // if lastOnlineAt is less than 5 minutes ago, show him as ONLINE
    const lastOnlineDiffMS = moment().diff(moment(user.lastOnlineAt));
    if (lastOnlineDiffMS < 60 * 1000) {
      // less than 5 minutes
      return "online";
    } else {
      return `Last seen online ${moment(user?.lastOnlineAt).fromNow()}`;
    }
  };
  const getUsernames = () => {
    return allUsers.map((user) => user?.name).join(", ");
  };

  const openInfoModal = () => {
    setInfoModalVisible(true);
  };
  
  const closeInfoModal = () => {
    setInfoModalVisible(false);
  };

  const openSetting = () => {
    // redirect to info page
    navigation.navigate("SettingScreen", { id });
  };


  const handleSaveWelcomeMessage = async () => {
    if (!newWelcomeMessage) {
      return; // Don't save empty message
    }

    try {
      // Fetch the model by its ID
      const modelToUpdate = await DataStore.query(ChatRoom, id);

      if (modelToUpdate) {
        // Update the WelcomeMessage attribute
        modelToUpdate.WelcomeMessage = newWelcomeMessage;

        // Save the updated model
        await DataStore.save(modelToUpdate);

        toggleWelcomeMessageModal(); // Close the modal
      }
    } catch (error) {
      console.error('Error updating WelcomeMessage:', error);
    }
  };

  const LeaveRoom = async ()=>{
    try {
      
      
    const authUser = await Auth.currentAuthenticatedUser();
    const loggedInUserId = authUser.attributes.sub;
    const dbUser = await DataStore.query(User, loggedInUserId);
  
    if (!dbUser) {
      Alert.alert("There was an error leaving the group");
      return;
    }
  
    if (dbUser) {
      const chatRoomUserToDelete = await (
        await DataStore.query(ChatRoomUser)
      ).filter(
        (cru) => cru.chatRoomId === chatRoom?.id && cru?.userId === dbUser?.id
      );
  
        if (chatRoomUserToDelete.length > 0) {
               
   
      const leaving =     await DataStore.delete(ChatRoomUser, chatRoomUserToDelete[0]?.id);
          setAllUsers(allUsers.filter((u) => u?.id !== dbUser?.id));
          if(leaving){
            console.log(leaving);
            
            sendExitMessage();
  
          }
     }}
  
    
    } catch (error) {
      
    }
  }
  const sendExitMessage = async () => {
    if (!chatRoom) {
      return;
    }
  
    // احصل على معلومات المستخدم المصادق عليه
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
  
    // أنشئ محتوى رسالة الخروج
  if(dbUser){
  
     await DataStore.save(
      new MessageModel({
        content: `${dbUser.name} قد غادر الغرفة.`,
        userID: '80ecd97c-2071-70f7-79e6-4036fb2d5dbb',
        chatroomID: chatRoom.id,
      })
    );
  
  }
  
  };
  const isGroup = allUsers.length > 2;
  return (
    <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
      <TouchableOpacity onPress={handleGoBack}>
        <Feather name="skip-back" size={20} color="black" style={{marginHorizontal:20}}/>

      </TouchableOpacity >
{
  chatRoom?.isRoom ? null : (
    <Image
    source={{
      uri:  user?.imageUri,
    }}
    style={{ width: 30, height: 30, borderRadius: 30 }}
  />
  )
}
<Modal
  visible={isInfoModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={closeInfoModal}
>
<View style={styles.modalContainer}>
    <Text>{chatRoom?.WelcomeMessage}</Text>
  </View>
  {/* ... المحتوى الذي تريد تضمينه في نافذة الـ Modal ... */}
</Modal>

     
      <Pressable onPress={openInfoModal } style={{ flex: 1, marginLeft: 10 }}>
        <View style={{ flex: 1, marginLeft: 10,justifyContent:'center',alignItems:'center' }}>
          <Text style={{ fontWeight: "bold",textAlign:'left' }}>
            {chatRoom?.name || user?.name}
          </Text>
          {
            chatRoom?.isRoom === true ? (

              <Text style={{ textAlign: 'center' }} numberOfLines={1}>
                {chatRoom?.WelcomeMessage}
              </Text>

            ) : (
              <Text numberOfLines={1}>
                {isGroup ? getUsernames() : getLastOnlineText()}
              </Text>
            )
          }

        </View>
      </Pressable>
{
  chatRoom?.isRoom === true ? (
    <TouchableOpacity onPress={toggleDropdownuser}>

    <Ionicons name="people" size={24} color="black" style={{ marginRight: 15 }} />
    </TouchableOpacity>
  ):null
}
     

      <TouchableOpacity onPress={toggleDropdown}>
        <Entypo name="dots-three-vertical" size={20} color="black" style={{ marginRight: 15 }} />
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
          {
            chatRoom?.isRoom ? (
              <View style={styles.dropdownContainer}>
              <TouchableOpacity onPress={toggleWelcomeMessageModal} style={styles.dropdownItem}>
                <Text>Welcome message</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openSetting} style={styles.dropdownItem}>
                <Text>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={LeaveRoom}>
                <Text>Leave room</Text>
              </TouchableOpacity>
              {/* Add more dropdown items as needed */}
            </View>
            ):(
              <View style={styles.dropdownContainer}>
              <TouchableOpacity onPress={toggleWelcomeMessageModal} style={styles.dropdownItem}>
                <Text>block</Text>
              </TouchableOpacity>
         
              {/* Add more dropdown items as needed */}
            </View>
            )
          }
         
        </TouchableOpacity>

      </Modal>
      {/* user room  Modal */}
      <Modal
        visible={isDropdownVisibleuser}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleDropdownuser}
      >
        <TouchableOpacity
          style={styles.modalBackground} // Add a new style for the background
          onPress={toggleDropdownuser}      // Close the modal when the background is pressed

        >
          <View style={styles.dropdownContaineruser}>
            <Text style={styles.text}>{`Users  (${allUsers?.length})`} </Text>
            <FlatList
              data={allUsers}
              keyExtractor={(item, index) => `user-${index}`} // تحديد مفتاح فريد باستخدام اسم النموذج ومعرّف المستخدم

              renderItem={({ item }) => (
                <UserItem
                  oneUserItem={item}
                  chatRoom={chatRoom}
                  setDropdownVisibleuser={setDropdownVisibleuser}
                />
              )}
            />
          </View>
        </TouchableOpacity>

      </Modal>
      {/* Welcome Message Modal */}
      <Modal
        visible={isWelcomeMessageVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleWelcomeMessageModal}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Enter welcome message"
            placeholderTextColor="gray"
            borderBottomWidth={1}
            value={newWelcomeMessage}

            onChangeText={(text) => setNewWelcomeMessage(text)}

          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={handleSaveWelcomeMessage}>
              <Text style={{ color: COLORS.primary, fontWeight: 'bold',borderRadius:20,margin:20 }}>Ok</Text>

            </TouchableOpacity>
           
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
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
  dropdownContaineruser:{
    width:'85%',
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
  
  inputField: {
    width: '80%',
    height: 100,
    borderBottomWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
  },
  text:{
    fontWeight:'bold',
    fontSize:25,
    margin:10
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the opacity as needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    width: '80%',
  },
});
export default ChatRoomHeader
