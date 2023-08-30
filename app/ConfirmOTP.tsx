import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ConfirmOTP = () => {
  const [otp, setOTP] = useState('');
  const [isValidOTP, setIsValidOTP] = useState(true);

  const handleConfirmOTP = () => {
    if (otp.length !== 6) {
      setIsValidOTP(false);
      return;
    }

    // Add your OTP confirmation logic here

    // Reset validation
    setIsValidOTP(true);
    console.log('OTP confirmed successfully');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm OTP</Text>
      <Text style={styles.description}>
        Enter the 6-letter OTP you received to verify your account.
      </Text>
      <TextInput
        style={[styles.input, !isValidOTP && styles.inputError]}
        placeholder="Enter 6-letter OTP"
        onChangeText={(text) => {
          setOTP(text);
          setIsValidOTP(true);
        }}
        maxLength={6}
      />
      {!isValidOTP && (
        <Text style={styles.errorText}>Please enter a valid 6-letter OTP.</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleConfirmOTP}>
        <Text style={styles.buttonText}>Confirm OTP</Text>
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

export default ConfirmOTP;
