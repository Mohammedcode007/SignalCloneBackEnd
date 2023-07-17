import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View, useColorScheme, useWindowDimensions, SafeAreaView } from 'react-native';
import ChatRoomScreen from './ChatRoomScreen';
import { EvilIcons, Feather } from '@expo/vector-icons';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';

import awsconfig from '../src/aws-exports';

Amplify.configure(awsconfig);
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <>
      {/* Keep the splash screen open until the assets have loaded. In the future, we should just support async font loading with a native version of font-display. */}
      {!loaded && <SplashScreen />}
      {/* {loaded &&
    
      <RootLayoutNav />
      
     } */}
      {loaded &&
      <Authenticator.Provider>
      <Authenticator loginMechanisms={['username']}>
      <RootLayoutNav />
      </Authenticator>
    </Authenticator.Provider>
     }
    </>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>

          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ChatRoomScreen" options={{
            headerShown: true,
            headerTitle: () => <ChatRoomHeader />,
          }} />

          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </>
  );
}


const ChatRoomHeader = () => {
  const { width } = useWindowDimensions()
  return (
    <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '70%' }}>
      <Image source={{ uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/jeff.jpeg' }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Home</Text>
      <EvilIcons name="camera" size={24} color="black" style={{ marginRight: 15 }} />
      <Feather name="edit-2" size={20} color="black" />
    </SafeAreaView>
  )
};