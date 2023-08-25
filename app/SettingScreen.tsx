import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import CustomModal from '../components/CustomModal/CustomModal';
import { useRoute } from '@react-navigation/native';
import { DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomAdminship, ChatRoomBanship, ChatRoomMembership, ChatRoomOwnership, ChatRoomUser, User } from '../src/models';
import { useDispatch } from 'react-redux';

const SettingScreen = () => {

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allOwner, setallOwner] = useState<User[]>([]);
  const [allAdmin, setallAdmin] = useState<User[]>([]);
  const [allMembers, setallMembers] = useState<User[]>([]);
  const [allBans, setallBans] = useState<User[]>([]);
  const [isMember, setisMember] = useState(false);

  isMember
  const route = useRoute();
  const dispatch = useDispatch();


  useEffect(() => {
    fetchChatRoom();
    fetchUsers();
    fetchOwner()
    fetchAdmin()
    fetchMember()
    fetchBan()
  }, []);

  const fetchChatRoom = async () => {
    if (!route.params?.id) {
      console.warn("No chatroom id provided");
      return;
    }
    const chatRoom = await DataStore.query(ChatRoom, route.params.id);
    if (!chatRoom) {
      console.error("Couldn't find a chat room with this id");
    } else {
      setChatRoom(chatRoom);
    }
  };

  const fetchUsers = async () => {
    const fetchedUsersId = (await DataStore.query(Creator))
      .filter((chatRoomUser) => chatRoomUser.chatRoomId === route.params?.id)
      .map((chatRoomUser) => chatRoomUser.userId);
    // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


    const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
    // setUsers(UserDetails);
    setAllUsers(UserDetails);
  };
  const fetchOwner = async () => {

    const fetchedUsersId = (await DataStore.query(ChatRoomOwnership))
      .filter((chatRoomUser) => chatRoomUser.chatroomID === route.params?.id)
      .map((chatRoomUser) => chatRoomUser.userID);
    // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


    const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
    // setUsers(UserDetails);
    setallOwner(UserDetails);
  };

  const fetchAdmin = async () => {

    const fetchedUsersId = (await DataStore.query(ChatRoomAdminship))
      .filter((chatRoomUser) => chatRoomUser.chatroomID === route.params?.id)
      .map((chatRoomUser) => chatRoomUser.userID);
    // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


    const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
    // setUsers(UserDetails);
    setallAdmin(UserDetails);
  };

  const fetchMember = async () => {

    const fetchedUsersId = (await DataStore.query(ChatRoomMembership))
      .filter((chatRoomUser) => chatRoomUser.chatroomID === route.params?.id)
      .map((chatRoomUser) => chatRoomUser.userID);
    // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


    const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
    // setUsers(UserDetails);
    setallMembers(UserDetails);
  };


  const fetchBan = async () => {

    const fetchedUsersId = (await DataStore.query(ChatRoomBanship))
      .filter((chatRoomUser) => chatRoomUser.chatroomID === route.params?.id)
      .map((chatRoomUser) => chatRoomUser.userID);
    // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


    const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
    // setUsers(UserDetails);
    setallBans(UserDetails);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.page}>
      <View style={[styles.containerRow, { marginHorizontal: 20 }]}>
        <Text style={[styles.text]}>Lock Member</Text>
        <Switch
          value={isMember}
        onValueChange={() => setisMember(true)}
        />
      </View>
      <TouchableOpacity
        style={styles.container}
        onPress={() => openModal('Owner', allOwner)}
      >
        <Text>Owner</Text>
        <Text>{allOwner?.length}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.container}
        onPress={() => openModal('Admin', allAdmin)}
      >
        <Text>Admin</Text>
        <Text>{allAdmin?.length}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.container}
        onPress={() => openModal('Members', allMembers)}
      >
        <Text>Members</Text>
        <Text>{allMembers?.length}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.container}
        onPress={() => openModal('Ban', allMembers)}
      >
        <Text>Bans</Text>
        <Text>{allMembers?.length}</Text>
      </TouchableOpacity>
      {/* Repeat for other items */}

      <CustomModal
        isVisible={modalVisible}
        closeModal={closeModal}
        title={modalTitle}
        content={modalContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    elevation: 5,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  text: {
    fontSize: 12,
    color: '#242760',
  },

  containerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 20,
  },
});

export default SettingScreen;
