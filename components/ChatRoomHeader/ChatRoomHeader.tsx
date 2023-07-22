import React, { useEffect, useState } from 'react'
import { Image, Text, View, TouchableOpacity, useWindowDimensions, SafeAreaView } from 'react-native';
import { EvilIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoomUser, User } from '../../src/models';

const ChatRoomHeader = ({ id }) => {
    const { width } = useWindowDimensions()
    const navigation = useNavigation();

    // تنفيذ الرجوع عند الحاجة
    const handleGoBack = () => {
      navigation.goBack();
    };

    const [user, setUser] = useState<User | null>(null); // the display user

    useEffect(() => {
      const fetchUsers = async () => {
        const fetchedUsersId = (await DataStore.query(ChatRoomUser))
          .filter((chatRoomUser) => chatRoomUser.chatRoomId === id)
          .map((chatRoomUser) => chatRoomUser.userId);
  // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");
  

  const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
      // console.log(UserDetails, "555555555555555555555555");
        // setUsers(UserDetails);
  
        const authUser = await Auth.currentAuthenticatedUser();
        setUser(
          UserDetails.find((user) => user.id !== authUser.attributes.sub) || null
        );
      };
      fetchUsers();
    }, []);
    return (
      <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
        <TouchableOpacity onPress={handleGoBack}>
        <Feather name="skip-back" size={20} color="black" />

        </TouchableOpacity >

        <Image source={{ uri: user?.imageUri }}
          style={{ width: 30, height: 30, borderRadius: 30 }}
        />
        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{user?.name}</Text>
        <EvilIcons name="camera" size={24} color="black" style={{ marginRight: 15 }} />
        <Feather name="edit-2" size={20} color="black" />
      </SafeAreaView>
    )
  };
export default ChatRoomHeader
