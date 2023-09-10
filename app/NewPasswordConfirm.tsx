import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Auth } from 'aws-amplify';
import { useNavigation, useRoute } from '@react-navigation/native';

const NewPasswordConfirm = () => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isValidCode, setIsValidCode] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();

  const username = route?.params?.username;

  const handlePasswordChange = async () => {
    if (confirmationCode.length !== 6) {
      setIsValidCode(false);
      return;
    }
    if (newPassword.length < 8) {
      setIsValidPassword(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setIsValidPassword(false);
      setIsValidConfirmPassword(false);
      return;
    }

    setIsValidCode(true);
    setIsValidPassword(true);
    setIsValidConfirmPassword(true);

    try {
      await Auth.forgotPasswordSubmit(username, confirmationCode, newPassword);
      console.log('Password changed successfully');
      navigation.navigate('SignIn ');

      // Navigate to a success page or another screen
    } catch (error) {
      console.log('Error changing password:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.description}>Enter the 6-letter confirmation code and your new password.</Text>
      <TextInput
        style={[styles.input, !isValidCode && styles.inputError]}
        placeholder="Confirmation Code"
        value={confirmationCode}
        onChangeText={(text) => setConfirmationCode(text)}
        maxLength={6}
      />
      {!isValidCode && <Text style={styles.errorText}>Please enter a valid 6-letter code.</Text>}
      <TextInput
        style={[styles.input, !isValidPassword && styles.inputError]}
        placeholder="New Password"
        value={newPassword}
        onChangeText={(text) => setNewPassword(text)}
        secureTextEntry
      />
      {!isValidPassword && (
        <Text style={styles.errorText}>Password must be at least 8 characters.</Text>
      )}
      <TextInput
        style={[styles.input, !isValidConfirmPassword && styles.inputError]}
        placeholder="Confirm New Password"
        value={confirmNewPassword}
        onChangeText={(text) => setConfirmNewPassword(text)}
        secureTextEntry
      />
      {!isValidConfirmPassword && <Text style={styles.errorText}>Passwords do not match.</Text>}
      <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default NewPasswordConfirm;
