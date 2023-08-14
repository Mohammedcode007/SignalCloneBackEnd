import React,{useState} from 'react';
import { Modal, Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import UserItem from '../UserItem/UserItem';
import UserItemRoom from '../UserItemRoom/UserItemRoom';
import { Entypo } from '@expo/vector-icons';

const CustomModal = ({ isVisible, closeModal, title, content }) => {
  console.log(content, "content");


  
  return (
    <Modal style={{flex:1}} visible={isVisible} onRequestClose={closeModal} transparent>
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1} // Prevents unwanted presses from passing through
        onPress={closeModal} // Close the modal when the overlay is pressed
      >
        <View style={styles.modalContent}>
          <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity >
          <Entypo name="plus" size={24} color="black" />

          </TouchableOpacity>
          </View>
         

          <FlatList
            data={content}
            keyExtractor={(item, index) => `user-${index}`} // تحديد مفتاح فريد باستخدام اسم النموذج ومعرّف المستخدم

            renderItem={({ item }) => (
              <UserItemRoom
                oneUserItem={item}
              // onLongPress={() => confirmDelete(item)}
              />
            )}
          />
          {/* <Text>{content}</Text> */}
        </View>
      </TouchableOpacity>
   
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
flexDirection:'row',
margin:'5%'

  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CustomModal;
