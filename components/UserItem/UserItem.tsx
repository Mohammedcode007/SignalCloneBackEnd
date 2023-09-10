import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Pressable, TouchableOpacity, Alert } from 'react-native';
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
  setDropdownVisibleuser:any;

}

const UserItem: React.FC<UserItemProps> = ({ oneUserItem,setDropdownVisibleuser, isSelected, onPress, isAdmin, onLongPress, chatRoom }: UserItemProps) => {
  const navigation = useNavigation();

  const [adminColor, setadminColor] = useState([])
  const [memberColor, setmemberColor] = useState([])
  const [ownerColor, setownerColor] = useState([])





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

      } else {
        const res = await DataStore.save(new FriendRequest({
          senderID: dbUser?.id,
          recipientID: userId,
          status: 'PENDING'
        }));
        setcheckIcon(res)

      }
    }

  }


  const addUserToChatRoom = async (user, chatroom) => {
    if (user) {
      await DataStore.save(new ChatRoomUser({
        user: user,
        chatRoom: chatroom
      }));
    }

  };

  const createChatRoom = async (oneUserItem) => {
    console.log("createChatRoom");
    
    try {
      // TODO if there is already a chat room between these 2 users
      // then redirect to the existing chat room
      // otherwise, create a new chatroom with these users.

      // connect authenticated user with the chat room


      const authUser = await Auth.currentAuthenticatedUser();
      const loggedInUserId = authUser.attributes.sub;
      const dbUser = await DataStore.query(User, loggedInUserId);

      if (!dbUser) {
        Alert.alert("There was an error creating the group");
        return;
      }
      // Create a chat room
      const newChatRoomData = {
        newMessages: 1,
        Admin: dbUser,
      };
      if (oneUserItem.length > 1) {
        console.log(oneUserItem.length,"oneUserItem.length");
        
        newChatRoomData.name = "New group";
        newChatRoomData.imageUri =
          "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/group.jpeg";

      }

      const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));


      if (dbUser) {
        await addUserToChatRoom(dbUser, newChatRoom);
      }

      // connect users user with the chat room
      await Promise.all(
        oneUserItem.map((user) => addUserToChatRoom(user, newChatRoom))
      );
      if (newChatRoom.id) {
        console.log(newChatRoom.id,"newChatRoom.id");
        
        navigation.navigate("ChatRoomScreen", { id: newChatRoom.id });

      }
    } catch (error) {
      console.log(error);


    }

  };

  const moveon = async (roomId) => {
    // setDropdownVisibleuser(false);
  
    try {
      await navigation.navigate("ChatRoomScreen", { id: roomId });
    } catch (error) {
      console.error("Error navigating to ChatRoomScreen:", error);
    }
  };
  
  const onUserPress = async () => {

    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);

    if (dbUser, oneUserItem) {
      console.log(oneUserItem,"oneUserItem");
      
      
      const chatroomuser = await (await DataStore.query(ChatRoomUser)).filter((item) => {
        return (
          item?.userId === dbUser?.id || item?.userId === oneUserItem?.id
        )
      })

      console.log(chatroomuser,"chatroomuser");


      const duplicatedChatRoomIds = chatroomuser.filter((item, index, self) => {
        // استخدام indexOf للتحقق إذا كانت هذه العنصر مكررة مسبقًا في المصفوفة
        return self.findIndex((el) => el.chatRoomId === item.chatRoomId) !== index;
      });
      console.log(duplicatedChatRoomIds,"duplicatedChatRoomIds");


      const chatRoomId = await Promise.all(
        duplicatedChatRoomIds.map(async (i) => {
          return i?.chatRoomId;
        })
      )

      if (chatRoomId) {
        const chatroomdetails = await Promise.all(chatRoomId.map(async (i) => {
          return (
            await DataStore.query(ChatRoom, i)
          )
        }))

        if (chatroomdetails) {
          const filterRoom = await chatroomdetails.filter((i) => {
            return (
              i?.isRoom === null
            )
          })
          if (filterRoom.length > 0) {
            console.log(filterRoom, "filterRoom");
            const roomId = filterRoom[0].id;
            console.log("Navigating to room:", roomId);
            moveon(roomId)
         

          } else {
            await createChatRoom([oneUserItem]);

          }

        }


      }

    }




  };



  return (
    <Pressable onLongPress={onLongPress}
      onPress={onPress}>
      <View style={styles.container}>
        <View style={{ flex: 1, display: 'flex', flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
{
  oneUserItem?.imageUri ? (
    <Image style={styles.image} source={{ uri: oneUserItem?.imageUri }} />

  ) : (
    <Image style={styles.image} source={require('../../assets/images/manlogo.png')} />

  )
}

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
          <TouchableOpacity onPress={onUserPress} style={{marginHorizontal:5}}>
          <MaterialIcons name="message" size={24} color="black" />

          </TouchableOpacity>
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
