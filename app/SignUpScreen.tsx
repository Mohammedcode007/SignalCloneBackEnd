import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Auth } from 'aws-amplify';

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidUsername, setIsValidUsername] = useState(true);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const handleSignUp = async () => {
    const isUsernameValid = username !== '';
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = confirmPassword !== '';

    setIsValidUsername(isUsernameValid);
    setIsValidEmail(isEmailValid);
    setIsValidPassword(isPasswordValid);
    setIsValidConfirmPassword(isConfirmPasswordValid);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      if (!isUsernameValid) setIsValidUsername(false);
      if (!isEmailValid) setIsValidEmail(false);
      if (!isPasswordValid) setIsValidPassword(false);
      if (!isConfirmPasswordValid) setIsValidConfirmPassword(false);
      return;
    }

    if (password !== confirmPassword) {
      setIsValidPassword(false);
      setIsValidConfirmPassword(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await Auth.signUp({
        username: username,
        password: password,
        attributes: {
          email: email,
          name: name,
        },
      });
      console.log(response, 'response');
      navigation.navigate('ConfirmOTP', { username: username }); // قد تختلف الشكل الدقيق حسب تسمياتك وتصميمك

    } catch (e) {
      console.log(e, 'error');
      Alert.alert('Oops', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8; // تحقق من أن طول كلمة المرور لا يقل عن 8 أحرف
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/images/signupimage.jpg')} style={styles.logo} />
      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, !isValidUsername && styles.inputError]}
          placeholder="Enter your username"
          onChangeText={(text) => { setUsername(text); setName(text); setIsValidUsername(true); }}
        />
        {!isValidUsername && (
          <Text style={styles.errorText}>Username is required.</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, !isValidEmail && styles.inputError]}
          placeholder="Enter your email"
          onChangeText={(text) => setEmail(text)}
        />
        {!isValidEmail && (
          <Text style={styles.errorText}>Please enter a valid email address.</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.input, !isValidPassword && styles.inputError]}
            placeholder="Enter your password"
            secureTextEntry={!passwordVisible}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            {/* ... الكود السابق */}
          </TouchableOpacity>
        </View>
        {!isValidPassword && (
          <Text style={styles.errorText}>Password must be at least 8 characters.</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={[styles.input, !isValidConfirmPassword && styles.inputError]}
          placeholder="Confirm your password"
          secureTextEntry={true}
          onChangeText={(text) => setConfirmPassword(text)}
        />
        {!isValidConfirmPassword && (
          <Text style={styles.errorText}>Please confirm your password.</Text>
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  logo: {
    width: '100%',
    height: '30%', // Make the image full height
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    overflow: 'hidden',
  },
  eyeIcon: {
    padding: 10,
    
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
  linkText: {
    marginTop: 10,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
