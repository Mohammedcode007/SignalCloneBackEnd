import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme,Text,View,Image, useWindowDimensions } from 'react-native';
import { EvilIcons,Feather ,AntDesign  } from '@expo/vector-icons'; 
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';

import Colors from '../../constants/Colors';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <HomeHeader />,
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({ pressed }) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? 'light'].text}
          //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
  
      
    </Tabs>
  );
}


const HomeHeader = () => {
  const { signOut } = useAuthenticator();

  const {width} = useWindowDimensions()
  return (
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
      <Image source={{uri:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/jeff.jpeg'}}
      style={{width:30,height:30,borderRadius:30}}
      />
      <Text style={{flex:1,textAlign:'center',fontWeight:'bold'}}>Home</Text>
      <EvilIcons name="camera" size={24} color="black" style={{marginRight:15}} />
      <Feather name="edit-2" size={20} color="black" />
      <Pressable onPress={signOut}>
      <AntDesign name="logout" size={17} color="black" style={{marginHorizontal:15}} />

      </Pressable>

    </View>
  )
};


