import React from 'react'
import { Text, View } from 'react-native'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';


const PublicTab = (props) => {
  return (
    <TabBar
    {...props}
    renderLabel={({ route, focused, color }) => (
      <View style={{ flexDirection: 'row', alignItems: 'center' ,borderColor:'grey',borderWidth:0.5,borderRadius:5 ,height:25,width:100,display:'flex',justifyContent:'space-evenly'}}>
        {/* أيقونة العلامة التبويب */}
        {route.key === 'first' && <AntDesign name="earth" size={15} color='grey' />} 
        {route.key === 'second' && <Icon name="check-circle" size={15} color='grey' />} 
        {route.key === 'three' && <AntDesign name="hearto" size={15} color='grey' />} 

        <Text style={{ color:'grey', fontWeight: focused ? 'bold' : 'normal', }}>
          {route.title}
        </Text>
      </View>
    )}
    indicatorStyle={{ backgroundColor: 'blue' }} // تخصيص لون العلامة السفلية للعلامة التبويب النشطة
    style={{ backgroundColor: 'transperant' }} // Set the background color for the TabView

  />
);
  
}

export default PublicTab
