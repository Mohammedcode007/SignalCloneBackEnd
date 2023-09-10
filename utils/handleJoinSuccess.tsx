
import { DataStore } from "aws-amplify";
import { Message as MessageModel } from "../src/models";

export const handleJoinSuccess = async (dbUser, ItemcRoom,messageContentText) => {
    // قم بإنشاء محتوى الرسالة الذي ترغب في إرساله
    const messageContent = messageContentText;
  
    // قم بحفظ الرسالة في قاعدة البيانات
    const newMessage = await DataStore.save(
      new MessageModel({
        content: messageContent,
        userID: '80ecd97c-2071-70f7-79e6-4036fb2d5dbb', // استخدم معرف المستخدم الخاص بك هنا
        chatroomID: ItemcRoom.id, // استخدم معرف الغرفة الحالية هنا
      })
    );
  
    // يمكنك إعادة توجيه المستخدم إلى شاشة الدردشة هنا أو إجراء أي إجراء آخر
    // على سبيل المثال: navigation.navigate('ChatRoomScreen', { id: chatRoom.id });
  };