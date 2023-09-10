import { useRoute, useNavigation } from '@react-navigation/native';
import { Auth } from 'aws-amplify';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Alert } from 'react-native';

const ConfirmOTP = () => {

  const route = useRoute();
  const navigation = useNavigation();
  const username = route?.params?.username;

  const [otp, setOTP] = useState('');
  const [isValidOTP, setIsValidOTP] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [timer, setTimer] = useState(30);
  const [isResendVisible, setIsResendVisible] = useState(false);

  useEffect(() => {
    if (isTimerActive) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      if (timer === 0) {
        setIsTimerActive(false);
        setIsResendVisible(true);
      }

      return () => clearInterval(interval);
    }
  }, [isTimerActive, timer]);

  const handleResendOTP = async () => {
    try {
      await Auth.resendSignUp(username);
      setTimer(30);
      setIsResendVisible(false);
      setIsTimerActive(true);
    } catch (error) {
      Alert.alert('Oops',error.message)
      console.log('Error resending OTP:', error);
    }
  };

  const handleConfirmOTP = async () => {
    if (otp.length !== 6) {
      setIsValidOTP(false);
      return;
    }

    setIsValidOTP(true);

    try {
      await Auth.confirmSignUp(username, otp);

      // إذا تم تأكيد OTP بنجاح، قم بنقل المستخدم إلى صفحة تسجيل الدخول
      navigation.navigate('SignIn');
    } catch (error) {
      Alert.alert('Oops',error.message)

      console.log('Error confirming OTP', error);
    }
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
      {!isTimerActive && (
        <TouchableOpacity style={styles.resendButton} onPress={handleResendOTP}>
          <Text style={styles.resendButtonText}>Resend Code</Text>
        </TouchableOpacity>
      )}
      {isTimerActive && (
        <Text style={styles.timerText}>Resend code in {timer} seconds</Text>
      )}
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
  resendButton: {
    marginTop: 10,
  },
  resendButtonText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  timerText: {
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ConfirmOTP;
