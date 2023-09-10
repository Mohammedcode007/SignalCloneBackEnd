import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, View, useColorScheme, useWindowDimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import ChatRoomScreen from './ChatRoomScreen';
import { EvilIcons, Feather } from '@expo/vector-icons';
import { Amplify, Auth, DataStore, Hub } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { Provider } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import awsconfig from '../src/aws-exports';
import ChatRoomHeader from '../components/ChatRoomHeader/ChatRoomHeader';
import { ChatRoom, ChatRoomUser, Message, User } from '../src/models';
import store from '../store';
import { useNetInfo } from '@react-native-community/netinfo';
import * as Network from 'expo-network';
import SignUpScreen from './SignUpScreen';
import SignIn from './SignIn';
import ConfirmOTP from './ConfirmOTP';
import ResetPassword from './ResetPassword';
import NewPasswordConfirm from './NewPasswordConfirm';

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
  const [isLoading, setIsLoading] = useState(true); // إضافة هذه الحالة

  const [user, setUser] = useState(undefined);
  // console.log(user,"user");

  const checkuser = async () => {
    try {
      const authUser = await Auth.currentAuthenticatedUser({ bypassCache: true })
      console.log( "authUser");

      setUser(authUser)
    } catch (error) {
      setUser(null)

    }
    setIsLoading(false); // ضبط isLoading إلى false عند انتهاء فحص المستخدم


  }
  useEffect(() => {
    console.log("Setting up Hub listener...");
    
    const listener = (data) => {
      if (data.payload.event === "signIn" || data.payload.event === "signOut") {
        console.log(data.payload.event,"data");
  
        checkuser();
      }
    }
    
    Hub.listen('auth', listener);
    
    return () => {
      console.log("Removing Hub listener...");
      Hub.remove('auth', listener);
    };
  }, []);
  

  useEffect(() => {
    checkuser()
  }, [])



  if (isLoading) { // عرض مؤشر التحميل أثناء فحص المستخدم
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'absolute' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <>
      {/* Keep the splash screen open until the assets have loaded. In the future, we should just support async font loading with a native version of font-display. */}
      {!loaded && <SplashScreen />}
      {/* {loaded &&
    
      <RootLayoutNav />
      
     } */}
      {loaded && (


        user ? (
          <Authenticator.Provider>
            <Authenticator loginMechanisms={['username']}>
              <ActionSheetProvider>
                <Provider store={store}>
                  <RootLayoutNav />

                </Provider>
              </ActionSheetProvider>
            </Authenticator>
          </Authenticator.Provider>) : (
          <Provider store={store}>
            <AuthLayout />

          </Provider>
        )



      )}
    </>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  // Auth.currentAuthenticatedUser().then(console.log)
  const netInfo = useNetInfo();

  const [isConnected, setIsConnected] = useState(netInfo.isConnected);

  useEffect(() => {
    setIsConnected(netInfo.isConnected);

    const checkNetworkStatus = async () => {
      const networkStatus = await Network.getNetworkStateAsync();
      setIsConnected(networkStatus.isConnected);
    };

    checkNetworkStatus();
  }, [netInfo.isConnected]);

  useEffect(() => {
    if (isConnected === false) {

      console.log("net cut");
      const fetchroom = async () => {
        const authUser = await Auth.currentAuthenticatedUser();
        const dbUser = await DataStore.query(User, authUser.attributes.sub);

        if (dbUser) {
          const chatroomuser = await (await DataStore.query(ChatRoomUser)).filter((item) => {
            return (
              item?.userId === dbUser?.id
            )
          }).map((i) => {
            return (
              i?.chatRoomId
            )
          })

          console.log(chatroomuser);

          if (chatroomuser) {
            const chatroomdetails = await Promise.all(chatroomuser.map(async (i) => {
              return (
                await DataStore.query(ChatRoom, i)
              )
            }))
            if (chatroomdetails) {
              const filterRoom = await chatroomdetails.filter((i) => {
                return (
                  i?.isRoom === true
                )
              })
              const roomdelet = await (await DataStore.query(ChatRoomUser)).filter((item) => {
                return filterRoom?.map((i) => i?.id).includes(item?.chatRoomId);
              });





              if (roomdelet) {
                console.log(roomdelet, "roomdelet");

                const data = await Promise.all(roomdelet.map(async (i) => {
                  return await DataStore.delete(ChatRoomUser, i);
                }));

                console.log(data, "data");

              }

            }

          }


        }

        // قم بتنفيذ إجراء عند انقطاع الاتصال، مثلا: الخروج من الغرف
        // اقتراح: استخدم دالة logout أو إجراء مناسب للخروج من الغرف
        // handleLogoutFromRooms();
      }
      fetchroom()
    }
  }, [isConnected]);
  useEffect(() => {
    const listener = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;
      if (
        event === "outboxMutationProcessed" &&
        data.model === Message &&
        !["DELIVERED", "READ"].includes(data.element.status)
      ) {
        // set the message status to delivered
        DataStore.save(
          Message?.copyOf(data.element, (updated) => {
            updated.status = "DELIVERED";
          })
        );
      }
    });

    // Remove listener
    return () => listener();
  }, []);
  useEffect(() => {
    if (!user) {
      return;
    }

    const subscription = DataStore.observe(User, user.id).subscribe((msg) => {
      if (msg.model === User && msg.opType === "UPDATE") {
        setUser(msg.element);
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      await updateLastOnline();
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUser = async () => {
    const userData = await Auth.currentAuthenticatedUser();
    const user = await DataStore.query(User, userData.attributes.sub);
    if (user) {
      setUser(user);
    }
  };

  const updateLastOnline = async () => {
    if (!user) {
      return;
    }

    const response = await DataStore.save(
      User.copyOf(user, (updated) => {
        updated.lastOnlineAt = +new Date();
      })
    );
    setUser(response);
  };


  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>

          <Stack.Screen name="(tabs)" options={{
            headerShown: false
          }}
          />
          <Stack.Screen name="ChatRoomScreen" options={{
            headerShown: false,
            headerTitle: () => <ChatRoomHeader />,
          }} />
          <Stack.Screen name="ProfileScreen" options={{
            headerShown: true,

          }} />

          <Stack.Screen name="GroupInfoScreen" options={{
            headerShown: true,

          }} />
          <Stack.Screen name="Notifcation" options={{
            headerShown: true,

          }} />
          <Stack.Screen name="SettingScreen" options={{
            headerShown: true,

          }} />

          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </>
  );
}


function AuthLayout() {
  const colorScheme = useColorScheme();
  const Stack = createStackNavigator();


  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="ConfirmOTP" component={ConfirmOTP} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="NewPasswordConfirm" component={NewPasswordConfirm} />


    </Stack.Navigator>
  );
}
