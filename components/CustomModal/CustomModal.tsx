import React, { useState } from 'react';
import {
  Modal,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import UserItem from '../UserItem/UserItem';
import UserItemRoom from '../UserItemRoom/UserItemRoom';
import { Entypo } from '@expo/vector-icons';

const CustomModal = ({ isVisible, closeModal, title, content }) => {
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [newModalInputValue, setNewModalInputValue] = useState('');
  const openNewModal = () => {
    setNewModalVisible(true);
  };

  const closeNewModal = () => {
    setNewModalVisible(false);
  };
  const handleInputChange = (text) => {
    setNewModalInputValue(text);
  };


  
  const handleSave = () => {
    // Implement your save logic here using newModalInputValue
    closeNewModal(); // Close the new modal after saving
  };

  return (
    <Modal
      style={{ flex: 1 }}
      visible={isVisible}
      onRequestClose={closeModal}
      transparent
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={closeModal}
      >
        <View style={styles.modalContent}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={openNewModal}>
              <Entypo name="plus" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={content}
            keyExtractor={(item, index) => `user-${index}`}
            renderItem={({ item }) => (
              <UserItemRoom
                oneUserItem={item}
              />
            )}
          />
        </View>
      </TouchableOpacity>

      {newModalVisible && ( // Render the new modal when newModalVisible is true
        <Modal
        style={{ flex: 1 }}
        visible={newModalVisible}
        onRequestClose={closeNewModal}
        transparent
      >
        <View style={styles.newModalContainer}>
          <Text>New Modal Content:</Text>
          <TextInput
            style={styles.input}
            value={newModalInputValue}
            onChangeText={handleInputChange}
            placeholder="Enter something..."
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeNewModal} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )}
      
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    margin: '5%',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    flex: 1,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 7,
  },
  newModalContainer: {
    marginTop:'50%',
    marginLeft:'15%',
borderRadius:20,
    height:'20%',
    width:'75%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
  },
  
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },

  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },

  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomModal;
