import React from 'react';
import { Image, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser, ChatRoomOwnership, ChatRoomAdminship, ChatRoomMembership } from "../../src/models";
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";

interface UserItemRoomProps {
  oneUserItem: {
    imageUri: any;
    name: any;
    // Add other properties of 'chatRoomDataItem' if any

  };
  isSelected: void;
  onPress: () => void;
  isAdmin: false;
  onLongPress: () => void;

}

const UserItemRoom: React.FC<UserItemRoomProps> = ({ oneUserItem, isSelected, onPress, isAdmin, onLongPress }: UserItemRoomProps) => {
  const navigation = useNavigation();
console.log(oneUserItem,"oneUserItem");


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





  
  const deleteOwnershipForUser = async () => {
    // Fetch ownership records for the user
    const ownershipRecords = (await DataStore.query(ChatRoomOwnership)).filter((u)=>{
      return(u?.userID === oneUserItem?.id )
    })

    const adminhipRecords = (await DataStore.query(ChatRoomAdminship)).filter((u)=>{
      return(u?.userID === oneUserItem?.id )
    })

    const membersshipRecords = (await DataStore.query(ChatRoomMembership)).filter((u)=>{
      return(u?.userID === oneUserItem?.id )
    })
  
    // Delete each ownership record
    const deletionPromises = ownershipRecords.map(record =>{return(
      DataStore.delete(ChatRoomOwnership, record.id)
      

    )}
    );
    
    const deletionadminPromises = adminhipRecords.map(record =>{return(
      DataStore.delete(ChatRoomAdminship, record.id)

    )}
    );

    const deletionmemberPromises = membersshipRecords.map(record =>{return(
      DataStore.delete(ChatRoomMembership, record.id)

    )}
    );

  

    try {
      // Delete ownership records in parallel
      await Promise.all(deletionPromises);
      await Promise.all(deletionadminPromises);
      await Promise.all(deletionmemberPromises);

    } catch (error) {
      console.error('Error deleting ownership records:', error);
      throw error;
    }
  };
  
  


  return (
    
      <View style={styles.container}>
        {/* <Image style={styles.image} source={{ uri: oneUserItem?.imageUri }} /> */}
        <View style={styles.RightContainer}>
          <View >
            <Text style={styles.name}>{oneUserItem?.name}</Text>
            {/* {isAdmin && <Text>admin</Text>} */}

          </View>
        </View>
        <TouchableOpacity onPress={deleteOwnershipForUser}>
        <AntDesign name="delete" size={24} color="black" />

        </TouchableOpacity>

      </View>

   
  
  );
};





export default UserItemRoom
