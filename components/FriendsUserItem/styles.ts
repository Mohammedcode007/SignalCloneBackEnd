import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      // padding: 10,
      borderBottomColor:'grey',
      borderBottomWidth:0.5

    },
    selected: {
      backgroundColor: 'red', // Change to the desired selected color
    },
    hovered: {
      backgroundColor: 'yellow', // Change to the desired hover color
    },
    RightContainer: {
      flex:1,
  justifyContent:'center',
  width:'100%',

     
    },
    image: {
      height: 40,
      width: 40,
      borderRadius: 20,
      margin: 10,
     
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
      width:'100%',
      textAlign:'left'

    },
    Signature:{
        fontSize:16,
        marginBottom:3,
        width:'100%',
        textAlign:'left'

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