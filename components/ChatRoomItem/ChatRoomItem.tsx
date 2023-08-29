import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';
import { ChatRoomUser, User, ChatRoom, Message } from '../../src/models';
import { Auth, DataStore } from 'aws-amplify';
import moment from "moment";
import { COLORS } from '../../utils/COLORS';
import { FontAwesome } from '@expo/vector-icons';
import { Favorite } from '../../src/models';

interface ChatRoomItemProps {
  chatRoomDataItem: {
    users: any[]; // Update this with the actual type of 'user' arraa
    newMessages: any;
    lastMessage: any;
    id: any;

    // Add other properties of 'chatRoomDataItem' if any
  };
  index: void
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ chatRoomDataItem, index }: ChatRoomItemProps) => {
  // const user = chatRoomDataItem?.users[1];
  const [users, setUsers] = useState<User[]>([]); // all users in this chatroom
  const [user, setUser] = useState<User | null>(null); // the display user
  const [lastMessage, setLastMessage] = useState<Message | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [fav, setfav] = useState(false);
  const addTofAVorite = async () => {
    setfav(!fav);
    const addtofav = async () => {
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      if (dbUser) {
        await DataStore.save(
          new Favorite({
            userID: dbUser?.id,
            chatroomID: chatRoomDataItem?.id
          })
        );
      }


    }
    const deletfav = async () => {
      const favList = await DataStore.query(Favorite)
      if (favList) {
        const filterfav = favList?.filter((i) => i.chatroomID === chatRoomDataItem?.id);
        await DataStore.delete(Favorite, filterfav[0].id);

      }

    }
    if (fav === true) {
      deletfav()

    } else if (fav === false) {
      // deletfav()
            addtofav()

    }

  }

  useEffect(() => {
    const getFav = async () => {
      const favList = await DataStore.query(Favorite)
      
      if (favList) {
        const filterfav = favList?.filter((i) => i.chatroomID === chatRoomDataItem?.id);
        if (filterfav.length > 0) {
          
          setfav(true);
        }
      }


    }
    if (chatRoomDataItem) {
      getFav()

    }

  }, [])

 

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsersId = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoomId === chatRoomDataItem?.id)
        .map((chatRoomUser) => chatRoomUser.userId);
      // console.log(fetchedUsersId,"fetchedUsersfetchedUsers");


      const UserDetails = await Promise.all(fetchedUsersId.map(async (fetchedUser) => await DataStore.query(User, fetchedUser)));
      // console.log(UserDetails, "555555555555555555555555");
      setAllUsers(UserDetails);

      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        UserDetails.find((user) => user.id !== authUser.attributes.sub) || null
      );
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!chatRoomDataItem?.chatRoomLastMessageId) {
      return;
    }
    DataStore.query(Message, chatRoomDataItem?.chatRoomLastMessageId).then(
      setLastMessage
    );
  }, []);

  const time = moment(lastMessage?.createdAt).from(moment());
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Random background color for each item
  const circleBackgroundColor = getRandomColor();
  const firstChar = chatRoomDataItem?.name ? chatRoomDataItem?.name.charAt(0).toUpperCase() : '';







  return (

    <View style={styles.container}>
      {
        chatRoomDataItem?.imageUri ? (
          <Image style={styles.image} source={{ uri: chatRoomDataItem?.imageUri || user?.imageUri }} />

        ) : (
          <View style={[styles.circle, { backgroundColor: circleBackgroundColor }]}>
            <Text style={styles.textimg}>{firstChar}</Text>

          </View>
        )
      }
      {chatRoomDataItem?.newMessages > 0 ? <View style={styles.badgeContainer}><Text style={styles.badgeText}>{chatRoomDataItem?.newMessages}</Text></View> : null}
      <View style={styles.RightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{chatRoomDataItem?.name || user?.name}</Text>
          {
            !chatRoomDataItem?.isRoom ? (
              <Text style={styles.text}>{time}</Text>

            ) : (
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => addTofAVorite()}>
                  <FontAwesome name="star" style={{ marginHorizontal: 10 }} size={24} color={fav === true ? "#FFD700" : "lightgrey"} />

                </TouchableOpacity>

                <View style={[styles.circlenum, { backgroundColor: 'grey' }]}>
                  <Text style={styles.textimg}>{index + 1}</Text>

                </View>
              </View>

            )
          }
        </View>
        {
          !chatRoomDataItem?.isRoom ? (
            <Text numberOfLines={1} style={styles.text}>{lastMessage?.content}</Text>

          ) : (
            allUsers?.length && chatRoomDataItem?.isRoom ? (
              <Text numberOfLines={1} style={styles.text}>{`(${allUsers?.length} / 50)`}</Text>

            ) : (
              <Text numberOfLines={1} style={styles.text}>{`(0 / 50)`}</Text>

            )
          )
        }
      </View>
    </View>
  );
};





export default ChatRoomItem
