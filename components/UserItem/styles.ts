import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      // padding: 10,
      borderBottomColor:'grey',
      borderBottomWidth:0.5

    },
    RightContainer: {
      flex:1,
  justifyContent:'center',
     
    },
    image: {
      height: 50,
      width: 50,
      borderRadius: 25,
      marginHorizontal: 5,
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
  });