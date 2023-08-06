import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme,Text,View,Image, useWindowDimensions,Alert, Modal, StyleSheet,TextInput, Animated} from 'react-native';
import { EvilIcons,Feather ,AntDesign, Entypo  } from '@expo/vector-icons'; 
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { Ionicons } from '@expo/vector-icons'; 

import Colors from '../../constants/Colors';
import { DataStore } from 'aws-amplify';
import { useState } from 'react';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <HomeHeader />,
          tabBarIcon: ({ color }) => <Entypo name="chat" size={24} color={color} />,
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({ pressed }) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? 'light'].text}
          //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
       <Tabs.Screen
        name="Friends"
        options={{
          headerTitle: () => <HomeHeader />,
          tabBarIcon: ({ color }) => <Entypo name="chat" size={24} color={color} />,
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({ pressed }) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? 'light'].text}
          //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
    <Tabs.Screen
        name="rooms"
        options={{
          headerTitle: () => <RoomsHeader />,
          tabBarIcon: ({ color }) => <FontAwesome name="group" size={24} color={color} />,
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({ pressed }) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? 'light'].text}
          //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
      
    </Tabs>
  );
}


const HomeHeader = () => {
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
  const {width} = useWindowDimensions()
  return (
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
      <Image source={{uri:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/jeff.jpeg'}}
      style={{width:30,height:30,borderRadius:30}}
      />
      <Text style={{flex:1,textAlign:'center',fontWeight:'bold'}}>Home</Text>
      <EvilIcons name="camera" size={24} color="black" style={{marginRight:15}} />
      <Feather name="edit-2" size={20} color="black" />
      <Pressable onPress={handleSignOut}>
      <AntDesign name="logout" size={17} color="black" style={{marginHorizontal:15}} />

      </Pressable>

    </View>
  )
};


const RoomsHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');


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
  const {width} = useWindowDimensions()
  return (
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
      <Image source={{uri:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/jeff.jpeg'}}
      style={{width:30,height:30,borderRadius:30}}
      />
      {/* <AntDesign name="setting" size={24} color="black" /> */}
      <Text style={{flex:1,textAlign:'center',fontWeight:'bold'}}>Rooms</Text>
      <Pressable    onPress={() => setModalVisible(true)}>

      <AntDesign name="plus" size={24} color="black" style={{marginRight:15}} />

      </Pressable>
      <EvilIcons name="search" size={24} color="black" style={{marginRight:15}} />
      <Ionicons name="notifications" size={20} color="black" style={{marginRight:15}} />
            <Pressable onPress={handleSignOut}>
      <AntDesign name="logout" size={17} color="black" style={{marginHorizontal:15}} />

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
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Create</Text>
            </Pressable>
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