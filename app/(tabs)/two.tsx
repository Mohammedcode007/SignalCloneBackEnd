import '@azure/core-asynciterator-polyfill'

import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';

import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import UserItem from '../../components/UserItem/UserItem';
import { DataStore } from "@aws-amplify/datastore";
import { User } from "../../src/models";

export default function TabTwoScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, []);
  // useEffect(() => {
  //   // query users
  //   const fetchUsers = async () => {
  //     try {
  //       const fetchedUsers = await DataStore.query(User);
  //       setUsers(fetchedUsers);
  //     } catch (error) {
  //       console.error("Error fetching users:", error.message || error);
  //     }
  //   };
  //   fetchUsers();
  // }, []);


  // const chatRoomData = User;
  const navigation = useNavigation();

  const handleItemPress = (item) => {
    // Navigate to another screen with the selected item
    // navigation.navigate('ChatRoomScreen', { chatRoomDataItem: item });
  };

  if (users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }
  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>
            <UserItem oneUserItem={item} />
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});