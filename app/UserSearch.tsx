import { DataStore } from 'aws-amplify';
import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { User } from '../src/models';
import UserItemRoom from '../components/UserItemRoom/UserItemRoom';
import UserItem from '../components/UserItem/UserItem';

const UserSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [user, setUser] = useState<User[]>([]); // Specify the type explicitly
  const [users, setUsers] = useState<User[]>([]); // Specify the type explicitly
  const [showImage, setShowImage] = useState(false); // Track the visibility of the image
  const [error, setError] = useState(false); // Track if there's an error

  const handleSearch = async () => {
    if (searchText.trim() === '') {
      setError(true); // Show error message if search text is empty
      return;
    }

    setError(false); // Reset error state
    const users = await DataStore.query(User);
    if (users) {
      setUser(users);
      const matchingUsers = users.filter((i) => {
        return i.name?.toLowerCase() === searchText?.toLowerCase();
      });
      setUsers(matchingUsers);
      setShowImage(matchingUsers.length === 0); // Update showImage based on whether there are matching users
      console.log(matchingUsers);
    } else {
      setUsers([]); // Reset the list to be empty when no results are found
      setShowImage(true); // Show the image when no results are found
      console.log('No matching users found.');
    }

    console.log('Searching for:', searchText);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a username..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <TouchableOpacity onPress={handleSearch} style={styles.button}>
        <Text style={styles.text}>Search</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>Please enter a username to search.</Text>}
      <View style={{ width: '100%',marginTop:10}}>
        {users?.length === 0 && showImage ? (
          <View style={{ width: '100%', margin: 10 }}>
            <Image style={{ width: '90%', height: '80%' }} source={require('../assets/images/nosearchresult.jpg')} />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item, index) => `user-${index}`}
            renderItem={({ item }) => (
              <UserItem
                oneUserItem={item}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white'
  },
  input: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  button: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#007AFF', // Adjust the background color as needed
    paddingVertical: 10,
  },
  text: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold'
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  }
});

export default UserSearch;
