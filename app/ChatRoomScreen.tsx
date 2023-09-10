import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
// import chatRoomData from '../assets/dummy-data/Chats';
import Message from '../components/Message/Message';
import MessageInput from '../components/MessageInput/MessageInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DataStore } from "@aws-amplify/datastore";
import { ChatRoom, ChatRoomUser, Message as MessageModel, User } from "../src/models";
import { Auth, SortDirection } from 'aws-amplify';
import ChatRoomHeader from '../components/ChatRoomHeader/ChatRoomHeader';
import { useDispatch, useSelector } from 'react-redux';
import { addToActive, removeFromActive, setexitMessageContent } from '../redux/mainSlice';

const ChatRoomScreen = () => {

  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [messageReplyTo, setMessageReplyTo] = useState<MessageModel | null>(
    null
  );
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [entryTime, setEntryTime] = useState<Date | null>(null);
  const [entryTimeSet, setEntryTimeSet] = useState(false);
  const [targetTime, settargetTime] = useState();
  const route = useRoute();



  useEffect(() => {
    if (route.params?.id) {
      setEntryTime(new Date());
      setEntryTimeSet(true);
    }


  }, [route.params?.id]);


  const dispatch = useDispatch();

  useEffect(() => {

    fetchChatRoom();
  }, []);

  useEffect(() => {
    if (chatRoom?.isRoom === true) {

      fetchRecentMessages()
    } else (
      fetchMessages()

    )
  }, [chatRoom]);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel).subscribe((msg) => {
      // console.log(msg.model, msg.opType, msg.element);
      if (msg.model === MessageModel && msg.opType === "INSERT") {
        setMessages((existingMessage) => [msg.element, ...existingMessage]);
      }
    });

    return () => subscription.unsubscribe();
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
      dispatch(addToActive(chatRoom));

    }
  };

  const fetchRecentMessages = async () => {
    if (!chatRoom || !entryTime) {
      return;
    }
    const chatroomuser = await DataStore.query(ChatRoomUser)

    const ChatRoomIdFilter = chatroomuser.filter((item) => {
      return (
        item?.chatRoomId === chatRoom?.id
      )
    })


    const authUser = await Auth.currentAuthenticatedUser();
    const loggedInUserId = authUser.attributes.sub;
    const dbUser = await DataStore.query(User, loggedInUserId);
    const userIdFilter = ChatRoomIdFilter?.filter((item) => {
      return item?.userId === dbUser?.id;
    })[0];



    // استعلام الرسائل التي تم استلامها بعد دخول المستخدم للغرفة
    const fetchedMessages = await DataStore.query(
      MessageModel,
      (message) =>
        message?.chatroomID.eq(chatRoom?.id),
      {
        sort: (message) => message?.createdAt(SortDirection.DESCENDING),
      }
    );


    const filterMessagesAfterTime = (messages, userIdFilter) => {

      return messages.filter((message) => message?.createdAt > userIdFilter.createdAt);
    };






    if (userIdFilter) {
      const filteredMessages = filterMessagesAfterTime(fetchedMessages, userIdFilter);
      setMessages(filteredMessages);

    }
    // استدعاء الدالة وتمرير قائمة الرسائل والوقت المستهدف



  };


  const fetchMessages = async () => {
    if (!chatRoom) {
      return;
    }
    const authUser = await Auth.currentAuthenticatedUser();
    const myId = authUser.attributes.sub;

    const fetchedMessages = await DataStore.query(
      MessageModel,
      (message) => message?.chatroomID.eq(chatRoom?.id),
      {
        sort: (message) => message?.createdAt(SortDirection.DESCENDING),
      } // Use dot notation and eq operator
    );
    console.log(fetchedMessages, "fetchedMessages");
    setMessages(fetchedMessages);
  };


  const fetchLatestMessage = async () => {
    try {
      const authUser = await Auth.currentAuthenticatedUser();
      const myId = authUser.attributes.sub;
      if (myId) {
        const filterMesageTime = messages?.filter((i) => {
          return (
            i?.userID === myId
          )
        })
        if(filterMesageTime[0].createdAt){
          const currentTime = new Date();
          const messageTime = new Date(filterMesageTime[0].createdAt);
  
          const timeDifferenceInMillis = currentTime - messageTime;
          const timeDifferenceInMinutes = timeDifferenceInMillis / 60000;
          
         
  
          console.log(timeDifferenceInMinutes,"timeDifferenceInMinutes");
  
          if (timeDifferenceInMinutes > 5) {
            console.log(timeDifferenceInMinutes,"timeDifferenceInMinutes");
            
            const kickuser = async () => {
              try {
                // Find the specific ChatRoomUser instance to delete
                const chatRoomUserToDelete = await (
                  await DataStore.query(ChatRoomUser)
                ).filter(
                  (cru) => cru.chatRoomId === filterMesageTime[0].chatroomID && cru?.userId === filterMesageTime[0].userID
                );
  
                if (chatRoomUserToDelete.length > 0) {
  
                  await DataStore.delete(ChatRoomUser, chatRoomUserToDelete[0]?.id);
                  const authUser = await Auth.currentAuthenticatedUser();
                  const dbUser = await DataStore.query(User, authUser.attributes.sub);
  
                  // أنشئ محتوى رسالة الخروج
                  if (dbUser) {
  
                    const exitMessage = await DataStore.save(
                      new MessageModel({
                        content: `${dbUser?.name}  kicked by server`,
                        userID: '80ecd97c-2071-70f7-79e6-4036fb2d5dbb',
                        chatroomID: filterMesageTime[0].chatroomID,
                      })
                    );
                    dispatch(removeFromActive(filterMesageTime[0].chatroomID));
                    dispatch(setexitMessageContent(exitMessage))
  
  
                  }
                  // navigation.navigate('(tabs)');
  
                  console.log("user kickied");
                } else {
                  console.log("لم يتم العثور على المستخدم في غرفة الدردشة");
                }
  
  
              } catch (error) {
                console.error("Error deleting user:", error);
              }
            };
            kickuser()
            console.log('More than 5 minutes have passed since the message was sent.');
            // اتخاذ إجراء عند تجاوز الخمس دقائق
          } else {
            console.log('Less than 5 minutes have passed since the message was sent.');
            // اتخاذ إجراء عند عدم تجاوز الخمس دقائق
          }
        }
        

      }


      if (messages.length > 0) {
        return messages[0]; // أحدث رسالة
      }

      return null; // لم يتم العثور على رسائل
    } catch (error) {
      console.log('Error fetching latest message:', error);
      return null;
    }
  };

  useEffect(() => {
    if (chatRoom?.isRoom) {
      console.log(chatRoom?.isRoom);
      
      // تنفيذ الكود الأول مرة عند تحميل الصفحة
      fetchLatestMessage();


      // تنفيذ الكود كل خمس دقائق
      const intervalId = setInterval(() => {
        fetchLatestMessage();
      }, 5 * 60 * 1000); // 5 دقائق * 60 ثانية * 1000 ملي ثانية

      // عندما يتم تفريغ الكومبوننت أو إلغاء الصفحة، قم بإلغاء الـ setInterval
      return () => {
        clearInterval(intervalId);
      };
    }

  }, [chatRoom,messages]); // يتم تنفيذه مرة واحدة عند تحميل الصفحة فقط

  if (!chatRoom) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={{ height: 80, width: '100%', marginTop: '10%' }}>
        <ChatRoomHeader id={route.params?.id} />
      </View>
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Message isRoom={chatRoom?.isRoom} message={item} setAsMessageReply={() => setMessageReplyTo(item)}
        />}
      />
      <MessageInput
        chatRoom={chatRoom}
        messageReplyTo={messageReplyTo}
        removeMessageReplyTo={() => setMessageReplyTo(null)}

      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "white"
  },
});

export default ChatRoomScreen;
