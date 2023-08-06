import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 10,
      borderBottomWidth:0.5,
      borderBottomColor:'grey',
    },
    RightContainer: {
      flex:1,
  justifyContent:'center',
     
    },
    image: {
      height: 50,
      width: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    text: {
      color: 'grey'
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  
    },
    name: {
      fontWeight: 'bold',
      fontSize:18,
      marginBottom:3,
    },
    badgeContainer:{
  backgroundColor:'#3872E9',
  height:20,
  width:20,
  alignItems:'center',
  justifyContent:"center",
  borderRadius:10,
  borderWidth:2,
  borderColor:'white',
  position:'absolute',
  left:45,
  top:10
    },
    badgeText:{
      color:'white',
      fontSize:12,
  
    },
    textimg:{
      fontSize:15,
      color:'white'
    },
    circlenum:{
      height: 25,
      alignItems:'center',
      display:'flex',
      justifyContent:'center',
      width: 25,
      borderRadius: 25,
      marginRight: 10,
    },

    circle:{
      height: 50,
      alignItems:'center',
      display:'flex',
      justifyContent:'center',
      width: 50,
      borderRadius: 25,
      marginRight: 10,
    }
  });