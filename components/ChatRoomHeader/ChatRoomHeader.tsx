import React, { useEffect, useState } from 'react';
import { Image, Text, View, TouchableOpacity, useWindowDimensions, SafeAreaView, Pressable, Modal, StyleSheet, TextInput, FlatList, ScrollView } from 'react-native';
import { Ionicons, Feather, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser, User } from '../../src/models';
import moment from 'moment';
import UserItem from '../UserItem/UserItem';

const ChatRoomHeader = ({ id }) => {
  const { width } = useWindowDimensions()
  const navigation = useNavigation();
  const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newWelcomeMessage, setNewWelcomeMessage] = useState('');

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

  const openInfo = () => {
    // redirect to info page
    navigation.navigate("GroupInfoScreen", { id });
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

 

  const isGroup = allUsers.length > 2;
  return (
    <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
      <TouchableOpacity onPress={handleGoBack}>
        <Feather name="skip-back" size={20} color="black" />

      </TouchableOpacity >

      <Image
        source={{
          uri: chatRoom?.imageUri || user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Pressable onPress={openInfo} style={{ flex: 1, marginLeft: 10 }}>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontWeight: "bold" }}>
            {chatRoom?.name || user?.name}
          </Text>
          {
            chatRoom?.isRoom === true ? (

              <Text style={{ textAlign: 'center' }}>
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

      <TouchableOpacity onPress={toggleDropdownuser}>

      <Ionicons name="people" size={24} color="black" style={{ marginRight: 15 }} />
      </TouchableOpacity>

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
          <View style={styles.dropdownContainer}>
            <TouchableOpacity onPress={toggleWelcomeMessageModal} style={styles.dropdownItem}>
              <Text>Welcome message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openSetting} style={styles.dropdownItem}>
              <Text>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem}>
              <Text>Leave room</Text>
            </TouchableOpacity>
            {/* Add more dropdown items as needed */}
          </View>
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
            <Text style={styles.text}>Users</Text>
            <FlatList
              data={allUsers}
              keyExtractor={(item, index) => `user-${index}`} // تحديد مفتاح فريد باستخدام اسم النموذج ومعرّف المستخدم

              renderItem={({ item }) => (
                <UserItem
                  oneUserItem={item}
                  chatRoom={chatRoom}
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
              <Text style={{ color: '#D0ECE8' }}>Ok</Text>

            </TouchableOpacity>
            <TouchableOpacity >
              <Text style={{ color: '#D0ECE8', fontWeight: 'bold' }}>Cancel</Text>

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
    height: 40,
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
