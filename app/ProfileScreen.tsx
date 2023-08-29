import { EvilIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, FlatList } from 'react-native';
import { User } from '../src/models';
import { Auth, DataStore } from 'aws-amplify';
import CountryPicker from 'react-native-country-picker-modal';

const ProfileScreen = () => {
    const route = useRoute();
    const [user, setUser] = useState<User | null>(null); // the display user
    const [pageViews, setPageViews] = useState(0);
    const [selectedCountry, setSelectedCountry] = useState(user?.country); // اختيار قيمة اولية للدولة ولتكن Egypt
    const handleCountrySelect = (country) => {
        setSelectedCountry(country?.cca2)
    };
    console.log(user, "kkkkkkkkkkk");

    useEffect(() => {
        if (route?.params?.id) {
            console.log(route?.params?.id, "route?.params?.id");

            const getDetails = async () => {
                const authUser = await Auth.currentAuthenticatedUser();
                const dbUser = await DataStore.query(User, route?.params?.id);
                if (dbUser) {
                    setUser(dbUser);
                    setSelectedCountry(dbUser?.country)

                    // Update the views field using copyOf
                    // const updatedUser = DataStore.copyOf(dbUser, updated => {
                    //     updated.views += 1; // Increment views by 1
                    // });

                    const updatedUser = DataStore.save(
                        User?.copyOf(dbUser, (updated) => {
                            updated.views = dbUser?.views + 1;
                        })
                    );
                    // Save the updated user to DataStore
                    await DataStore.save(updatedUser);
                }
            }
            getDetails()
        }
    }, [route?.params?.id])
    const images = [
        require('../assets/images/profilePhoto.jpg'),
        require('../assets/images/profilePhoto.jpg'),
        require('../assets/images/profilePhoto.jpg'),
        require('../assets/images/profilePhoto.jpg'),
        require('../assets/images/profilePhoto.jpg'),
        require('../assets/images/profilePhoto.jpg'),
    ];

    const renderItem = ({ item }) => (
        <View style={styles.image}>
            <Image source={item.uri} style={styles.image} />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {
                    user?.imageCover ? (
                        <Image source={{ uri: user?.imageCover }} style={styles.cover} />

                    ) : (<Image source={require('../assets/images/Cover.jpg')} style={styles.cover} />
                    )
                }
                <View style={styles.curve}></View>
            </View>
            <View style={styles.photoContainer}>
                {
                    user?.imageUri ? (
                        <Image source={{ uri: user?.imageUri }} style={styles.profileImage} />

                    ) : (<Image source={require('../assets/images/manlogo.png')} style={styles.profileImage} />

                    )
                }
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.username}>{user?.name}</Text>
                <Text style={styles.jop}>{user?.interests}</Text>
                <Text style={styles.country}>{user?.country}</Text>
            </View>
            <View style={styles.containerRow}>
                <View style={styles.containerCoulmn}>
                    <Text style={styles.number}>{user?.views}</Text>
                    <Text style={styles.text}>Views</Text>
                </View>
                <View style={styles.containerCoulmn}>
                    <Text style={styles.number}>457</Text>
                    <Text style={styles.text}>Likes</Text>
                </View>
                <View style={styles.containerCoulmn}>
                    <Text style={styles.number}>{user?.age}</Text>
                    <Text style={styles.text}>Age</Text>
                </View>
                <View style={styles.containerCoulmn}>
                    <Text style={styles.number}>{user?.gendar}</Text>
                    <Text style={styles.text}>Gender</Text>
                </View>
                <View style={styles.containerCoulmn}>
                    <View style={styles.containerSelect}>
                        {selectedCountry && (
                            <View style={styles.selectedCountryContainer}>
                                <Image
                                    source={{ uri: `https://www.countryflags.io/${selectedCountry}/flat/64.png` }}
                                    style={styles.countryFlag}
                                />
                            </View>
                        )}

                        <CountryPicker
                            withFilter
                            withFlagButton={true}
                            onSelect={handleCountrySelect}
                            countryCode={selectedCountry}
                            translation="eng"
                            flagStyles={{
                                borderRadius: 10, // Apply border radius to the flag icon
                                borderWidth: 2, // Apply border width to the flag icon
                                borderColor: 'blue',
                                bottom: 0 // Set border color for the flag icon
                            }}
                        />
                    </View>
                    <Text style={styles.text}>country</Text>
                </View>
            </View>
            <View style={{ width: '100%', alignItems: 'center', display: "flex", justifyContent: 'center', marginTop: 10 }}>
                <Text style={styles.text}>Photos</Text>
                <View style={{ borderBottomColor: 'grey', borderBottomWidth: 1, width: '90%' }}></View>
                <FlatList
                    data={images} // Display only the first three images
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.photocontainer}
                    horizontal={true} // Set horizontal layout
                    contentContainerStyle={styles.photoListContainer}
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
    pen: {
        position: 'absolute'
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
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: '#242760',
        borderWidth: 1,
    },
    photoContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '25%',
    },
    selectedCountryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryFlag: {
        width: 25,
        height: 15,
    },
    countryName: {
        fontSize: 16,
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
    containerSelect: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#F5FCFF',
    },
    number: {
        fontSize: 12,
        color: '#242760',
    },
    text: {
        fontSize: 12,
        color: 'black',
    },
    country: {
        fontSize: 12,
        color: '#242760',
    },
    containerCoulmn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerRow: {
        display: 'flex',
        justifyContent: 'space-around',
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
});

export default ProfileScreen;
