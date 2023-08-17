import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser, ChatRoomAdminship, ChatRoomMembership, ChatRoomOwnership, FriendRequest } from "../../src/models";
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialIcons } from "@expo/vector-icons";

interface UserItemProps {
  oneUserItem: {
    imageUri: any;
    name: any;
    id: any;
    // Add other properties of 'chatRoomDataItem' if any

  };
  isSelected: void;
  onPress: () => void;
  isAdmin: false;
  onLongPress: () => void;
  chatRoom: any;

}

const UserItem: React.FC<UserItemProps> = ({ oneUserItem, isSelected, onPress, isAdmin, onLongPress, chatRoom }: UserItemProps) => {
  const navigation = useNavigation();

  const [adminColor, setadminColor] = useState([])
  const [memberColor, setmemberColor] = useState([])
  const [ownerColor, setownerColor] = useState([])

  // const createChatRoom = async () => {
  //   try {
  //     const newChatRoom = await DataStore.save(new ChatRoom({ newMessages: 0 }));

  //     const authUser = await Auth.currentAuthenticatedUser();

  //     const loggedInUserId = authUser.attributes.sub;
  //     const loggedInUser = await DataStore.query(User, loggedInUserId);
  //     const selectedUser = await DataStore.query(User, oneUserItem.id);

  //     if (loggedInUser && selectedUser) {
  //       await DataStore.save(new ChatRoomUser({
  //         user: loggedInUser,
  //         chatRoom: newChatRoom
  //       }));

  //       await DataStore.save(new ChatRoomUser({
  //         user: selectedUser,
  //         chatRoom: newChatRoom
  //       }));
  //     }
  //     navigation.navigate('ChatRoomScreen', { id: newChatRoom?.id });

  //     // Rest of the code..
  //   } catch (error) {
  //     console.error('Error creating chatroom:', error);
  //   }
  // };






  useEffect(() => {

    const chekcolor = async () => {
      if (chatRoom && oneUserItem) {
        const isAdmin = (
          await DataStore.query(ChatRoomAdminship)
        ).filter((u) => u?.userID === oneUserItem?.id && u?.chatroomID === chatRoom?.id).map((i) => i?.userID);

        const isMember = (
          await DataStore.query(ChatRoomMembership)
        ).filter((u) => u?.userID === oneUserItem?.id && u?.chatroomID === chatRoom?.id).map((i) => i?.userID);

        const isOwner = (
          await DataStore.query(ChatRoomOwnership)
        ).filter((u) => u?.userID === oneUserItem?.id && u?.chatroomID === chatRoom?.id).map((i) => i?.userID);



        // Update adminColor state with the new values
        setadminColor((prevAdminColor) => prevAdminColor.concat(isAdmin));
        setmemberColor((prevAdminColor) => prevAdminColor.concat(isMember));
        setownerColor((prevAdminColor) => prevAdminColor.concat(isOwner));

        // Update memberColor state with the new values

      }
    };

    chekcolor()

  }, [])

  const [checkIcon, setcheckIcon] = useState()


  const createRequest = async (userId) => {
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
    if (dbUser) {
      const check = await (await DataStore.query(FriendRequest)).filter((i) => {
        return (
          i?.senderID === dbUser?.id && i?.recipientID === userId
        )
      })

      if (check.length > 0) {
        console.log(check.length, "vvvvv");

      } else {
        const res = await DataStore.save(new FriendRequest({
          senderID: dbUser?.id,
          recipientID: userId,
          status: 'PENDING'
        }));
        setcheckIcon(res)

      }
      console.log(check);
    }

  }
  return (
    <Pressable onLongPress={onLongPress}
      onPress={onPress}>
      <View style={styles.container}>
        <View style={{ flex: 1, display: 'flex', flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
          <Image style={styles.image} source={{ uri: oneUserItem?.imageUri }} />
          <View style={styles.RightContainer}>
            <View >

              <Text style={[styles.name,
              { color: adminColor.includes(oneUserItem?.id) ? 'blue' : ownerColor.includes(oneUserItem?.id) ? 'red' : memberColor.includes(oneUserItem?.id) ? 'green' : 'black' }
              ]}>

                {oneUserItem?.name}</Text>
              {/* {adminColor.includes(oneUserItem?.id) ? <Text>admin</Text> : null} */}
              {adminColor.includes(oneUserItem?.id) && <Text style={{ color: 'blue' }}>admin</Text>}
              {ownerColor.includes(oneUserItem?.id) && <Text style={{ color: 'red' }}>owner</Text>}
              {memberColor.includes(oneUserItem?.id) && <Text style={{ color: 'green' }}>member</Text>}

            </View>
          </View>
          <TouchableOpacity onPress={() => createRequest(oneUserItem?.id)}>
            {
              checkIcon ? (
                <Image style={{ width: 20, height: 20, marginHorizontal: 20 }} source={require('../../assets/images/user-check.png')} />

              ) : (<Image style={{ width: 20, height: 20, marginHorizontal: 20 }} source={require('../../assets/images/user-plus.png')} />
              )
            }

          </TouchableOpacity>
          <MaterialIcons name="message" size={24} color="black" />
        </View>

      </View>

      {isSelected !== undefined && (
        <Feather
          name={isSelected ? "check-circle" : "circle"}
          size={20}
          color="#4f4f4f"
        />
      )}
    </Pressable>

  );
};





export default UserItem
