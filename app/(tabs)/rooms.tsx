import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import Rooms from '../../components/Rooms/Rooms';
import ActiveRooms from '../../components/ActiveRooms/ActiveRooms';
import { ChatRoom } from '../../src/models';
import SignUpScreen from '../../components/Fav/Fav';
import PublicTab from '../../components/tabComponent/PublicTab';
import FavoriteRooms from '../../components/FavoriteRooms/FavoriteRooms';


const rooms = () => {
      const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [ACtivechatRoom, setACtivechatRoom] = React.useState<ChatRoom | null>(null);
  const [favorite,setfavorite] = React.useState([])

  const AllRooms = () => (
    <Rooms />
  );
  
  const Active = () => (
    <ActiveRooms />
  );
  
  const Favorite = () => (
    <FavoriteRooms />
  );
  
  const renderScene = SceneMap({
    first: AllRooms,
    second: Active,
    three:Favorite
  });
  const [routes] = React.useState([
    { key: 'first', title: 'PUBLIC' },
    { key: 'second', title: 'ACTIVE' },
        { key: 'three', title: 'FAV' },

  ]);
  return (
     <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={PublicTab} // استدعاء دالة تخصيص علامات التبويب

      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  )
}

export default rooms
