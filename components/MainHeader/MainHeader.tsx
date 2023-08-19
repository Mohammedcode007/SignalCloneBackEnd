import { AntDesign, EvilIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore } from "aws-amplify";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions } from "react-native";
import { ChatRoom, ChatRoomUser, FriendRequest, User } from "../../src/models";
import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { View, Modal, Pressable } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { addTonotify } from "../../redux/mainSlice";

const RoomsHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const { notify } = useSelector((state) => state.mainReducer);
  console.log(notify, "notify");


  const { signOut } = useAuthenticator();
  const handleSignOut = async () => {
    try {
      // Clear the DataStore cache and local storage
      await DataStore.clear();
    } catch (error) {
      console.error('Error clearing DataStore:', error);
    }
    // Call the signOut function
    signOut();
  };
  const { width } = useWindowDimensions()
  const navigation = useNavigation();

  const createChatRoom = async (roomName: any) => {
    try {

      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      if (!dbUser) {
        console.log(`User with ID ${dbUser?.id} not found.`);
        return;
      }
      console.log(roomName);

      // Create a new chat room using the DataStore
      const newChatRoom = await DataStore.save(new ChatRoom({
        isRoom: true,
        Creator: dbUser,
        name: roomName
      }));

      console.log('Chat room created:', newChatRoom);
      setRoomName("")
      setModalVisible(false)
      if (newChatRoom) {
        const savedata = await DataStore.save(new ChatRoomUser({
          user: dbUser,
          chatRoom: newChatRoom,

        }));
        if (savedata) {
          navigation.navigate('ChatRoomScreen', { id: newChatRoom.id });

        }

      }

      return newChatRoom;
    } catch (error) {
      console.error('Error creating chat room:', error);
      return null;
    }
  };

  const gotonotifcation = () => {
    navigation.navigate('Notifcation');

  }
  const [fetchID, setfetchID] = useState([])
  const [userDetails, setuserDetails] = useState([])
  const [friendRequestLength, setFriendRequestLength] = useState(0); // State for storing friend request length
  console.log(friendRequestLength, "friendRequestLength");
  const dispatch = useDispatch();
  useEffect(() => {
    if (friendRequestLength > 0) {
      dispatch(addTonotify(friendRequestLength));

    }
  }, [friendRequestLength])


  useEffect(() => {
    const fetchData = async () => {
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      if (dbUser) {
        const friendRequests = await DataStore.query(FriendRequest);
        const filteredFriendRequests = friendRequests.filter((i) => {
          return i?.recipientID === dbUser?.id;
        });

        const senderIDs = filteredFriendRequests.map(i => i?.senderID);

        const userDetailsPromises = senderIDs.map(async (senderID) => {
          return await DataStore.query(User, senderID);
        });

        const userDetails = await Promise.all(userDetailsPromises);

        setuserDetails(userDetails);
        setfetchID(filteredFriendRequests);

        // Update friendRequestLength state with the new length
        setFriendRequestLength(filteredFriendRequests.length);
      }
    };

    const subscription = DataStore.observe(FriendRequest).subscribe(() => {
      fetchData();
    });

    fetchData();

    return () => {
      subscription.unsubscribe();
    };

  }, []);
  const openProfile =async () => {
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
    // redirect to info page
    navigation.navigate("ProfileScreen",{id:dbUser?.id});
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <TouchableOpacity onPress={openProfile}>
      <Image source={{ uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/jeff.jpeg' }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      </TouchableOpacity>
      
      {/* <AntDesign name="setting" size={24} color="black" /> */}
      <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Rooms</Text>
      <Pressable onPress={() => setModalVisible(true)}>

        <AntDesign name="plus" size={24} color="black" style={{ marginRight: 15 }} />

      </Pressable>
      <EvilIcons name="search" size={24} color="black" style={{ marginRight: 15 }} />
      <TouchableOpacity onPress={gotonotifcation}>
        <Ionicons name="notifications" size={20} color="black" style={{ marginRight: 15 }} />
        {
          friendRequestLength > 0 ? (
            <View style={styles.circle}>
              <Text style={{ color: 'white', fontSize: 10 }}>{friendRequestLength}</Text>
            </View>) : null
        }

      </TouchableOpacity>
      <Pressable onPress={handleSignOut}>
        <AntDesign name="logout" size={17} color="black" style={{ marginHorizontal: 15 }} />

      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Create Room!</Text>
            <TextInput
              style={styles.input}
              placeholder="Name of room"
              value={roomName}
              onChangeText={setRoomName}
            />
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => createChatRoom(roomName)}>
                <Text style={styles.textStyle}>Create</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  )
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  circle: {
    backgroundColor: 'red',
    borderRadius: 8,
    height: 15,
    width: 15,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,

    justifyContent: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    margin: 20,
    elevation: 2,
  },
  input: {
    width: 200,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default RoomsHeader