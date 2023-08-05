import React,{useState,useEffect} from 'react';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser, User } from '../../src/models';
import { useSelector } from 'react-redux';

const ActiveRooms = () => {
    const {rooms} = useSelector((state) => state.mainReducer);
    const [data,setdata] = useState([])
    
    useEffect(()=>{
        const uniqueDataObj = rooms.reduce((acc, curr) => {
            if (!acc[curr.name]) {
              acc[curr.name] = curr;
            }
            return acc;
          }, {});
          
          // استخراج القيم الفريدة (العناصر الأولى فقط) باستخدام Object.values()
          const uniqueData = Object.values(uniqueDataObj);
          
          setdata(uniqueData)
          
    },[rooms])
    
    const chatRoomData = chatRoomDummy;
    const navigation = useNavigation();
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    // console.log(chatRoom, "555555555555555555555555");
  
    const route = useRoute();
    const fetchChatRoom = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        
  
        const chatRooms1 = await DataStore.query(ChatRoomUser);
        const chatRooms15 = await DataStore.query(ChatRoom);

     
         const list= chatRooms15.filter((i)=>{return(i?.name !== null)})
         setChatRoom(list)

        
  
      } catch (error) {
        console.log('Error fetching chatRoomDetails:', error);
      }
    };
  
    useEffect(() => {
      fetchChatRoom();
    }, []);

    const addUserToChatRoom = async (dbUser, item) => {
      if(dbUser ){
        await DataStore.save(new ChatRoomUser({
                  user: dbUser,
                  chatRoom: item
                }));
      }
  
    };
    const handleItemPress =async (item) => {
      // Navigate to another screen with the selected item
      const authUser = await Auth.currentAuthenticatedUser();
      const loggedInUserId = authUser.attributes.sub;
      const dbUser = await DataStore.query(User, loggedInUserId);
  
    //   if (!dbUser) {
    //     Alert.alert("There was an error creating the group");
    //     return;
    //   }

    //   if (dbUser) {
    //     await addUserToChatRoom(dbUser, item);
    //   }
  
      navigation.navigate('ChatRoomScreen', { id: item.id});
    };
  
    return (
      <View style={styles.page}>
        {data &&  <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemPress(item)}>
              <ChatRoomItem chatRoomDataItem={item} />
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        /> }
       
      </View>
    );
}
const styles = StyleSheet.create({
    page: {
      flex: 1,
    },
  });

export default ActiveRooms
