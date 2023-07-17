import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatRoomItem from '../../components/ChatRoomItem';
import chatRoomDummy from "../../assets/dummy-data/ChatRooms"

export default function TabOneScreen() {
  const chatRoomData = chatRoomDummy;
  const navigation = useNavigation();

  const handleItemPress = (item) => {
    // Navigate to another screen with the selected item
    navigation.navigate('ChatRoomScreen', { chatRoomDataItem: item });
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRoomData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>
            <ChatRoomItem chatRoomDataItem={item} />
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
});
