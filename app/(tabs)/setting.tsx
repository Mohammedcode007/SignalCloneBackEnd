import { EvilIcons } from '@expo/vector-icons';
import React ,{useState}from 'react';
import { View, Text, Image, StyleSheet, ScrollView, FlatList, TextInput, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/themeActions';
import { COLORS } from '../../utils/COLORS';
import CountryPickerComponent from '../../utils/CountryPicker';

const setting = () => {
    const { darkMode } = useSelector(state => state.theme);
    const dispatch = useDispatch();

    const [age, setAge] = useState('25'); // حالة محلية لتخزين قيمة العمر

    const handleCountrySelect = (country) => {
        console.log('Selected country:', country);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require('../../assets/images/Cover.jpg')} style={styles.cover} />
                <View style={styles.curve}></View>
            </View>
            <View style={styles.photoContainer}>
                <Image source={require('../../assets/images/profilePhoto.jpg')} style={styles.profileImage} />
                <EvilIcons name="pencil" size={24} color="black" style={styles.icon}/>
            </View>
            <View style={ {backgroundColor: darkMode ? COLORS.darkBackground:COLORS.background,width:'100%'}}>
            {/* ... Rest of your code ... */}
            <View style={[styles.containerRow,{marginHorizontal:20}]}>
                <Text style={[styles.text,{color: darkMode ? COLORS.lightText: COLORS.text}]}>Dark Mode</Text>
                <Switch
                    value={darkMode}
                    onValueChange={() => dispatch(toggleTheme())}
                    />
            </View>
            {/* ... Rest of your code ... */}
        </View>
           <View style={styles.containerCoulmn}>
                    <Text style={styles.text}>Age</Text>
                    <TextInput
                        style={styles.ageInput}
                        value={age}
                        onChangeText={setAge} // تحديث حالة المحلية عندما يتم تعديل النص
                        keyboardType="numeric" // لوحة مفاتيح رقمية
                    />
                </View>
                <View style={styles.containerSelect}>
            <CountryPickerComponent onSelectCountry={handleCountrySelect} />
        </View>
               

                <View style={styles.containerCoulmn}>
                    <Text style={styles.text}>Status</Text>
                    <TextInput
                        style={styles.ageInput}
                        value={age}
                        onChangeText={setAge} // تحديث حالة المحلية عندما يتم تعديل النص
                        keyboardType="numeric" // لوحة مفاتيح رقمية
                    />
                </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: "white",
    },
    header: {
        height: '33%',
        backgroundColor: 'lightgray',
        overflow: 'hidden',
        position: 'relative',
        borderTopLeftRadius: 50,
        borderBottomRightRadius: 100,
    },
    pen:{
        position:'absolute'
    },
    curve: {
        position: 'absolute',
        bottom: 0,
        left: "33%",
        right: "33%",
        height: 80,
        backgroundColor: 'white',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 100,
    },
    cover: {
        width: '100%',
        height: '100%',
    },
    darkBackground: {
        backgroundColor: '#121212', // Change this to your desired dark mode background color
    },
    containerSelect: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    icon:{
        position:'absolute'
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: '#242760',
        borderWidth: 1,
        position:'relative'
    },
    photoContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        bottom:70,
    },
    profileInfo: {
        marginTop: '20%',
        alignItems: 'center',
        backgroundColor: "white",
    },
    username: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#242760',
    },
    jop: {
        fontSize: 12,
        color: '#242760',
    },
    number: {
        fontSize: 12,
        color: '#242760',
    },
    text: {
        fontSize: 12,
        color: 'black',
        marginBottom:10,
    },
    country: {
        fontSize: 12,
        color: '#242760',
    },
 
    containerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
    },
    photocontainer: {
        height: 150,
        marginTop: 10,
    },
    photoListContainer: {
        paddingHorizontal: 10,
    },
    scrollContainer: {
        flex: 1,
        marginTop: 10,
    },
    scrollList: {
        marginHorizontal: 10,
    },
    image: {
        width: 120,
        height: 120,
        margin: 2,
    },
    containerCoulmn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        margin:20,
        width:'90%',
    },
    ageInput: {
        fontSize: 12,
        color: '#242760',
        borderWidth: 1,
        borderColor: '#242760',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        width:'100%',

    },
});



export default setting
