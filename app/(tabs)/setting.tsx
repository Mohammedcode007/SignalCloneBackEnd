import { AntDesign, EvilIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, FlatList, TextInput, Switch, TouchableOpacity, Platform, KeyboardAvoidingView, ActivityIndicator, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/themeActions';
import { COLORS } from '../../utils/COLORS';
import CountryPickerComponent from '../../utils/CountryPicker';
import { User } from '../../src/models';
import { Auth, DataStore, Storage } from 'aws-amplify';
import * as ImagePicker from 'expo-image-picker';
import { Audio, AVPlaybackStatus } from "expo-av";
import uuid from 'uuid-random';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CountryPicker from 'react-native-country-picker-modal';
import { Picker } from '@react-native-picker/picker';

const setting = () => {

    useEffect(() => {
        (async () => {
            if (Platform.OS !== "web") {
                const libraryResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
                const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
                await Audio.requestPermissionsAsync();

                if (libraryResponse.status !== "granted" || photoResponse.status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!");
                }
            }
        })();
    }, []);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const { darkMode } = useSelector(state => state.theme);
    const dispatch = useDispatch();
    const [image, setImage] = useState<string | null>(null);
    const [imageCover, setImageimageCover] = useState<string | null>(null);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageUrlCover, setIimageUrlCover] = useState<string | null>(null);

    const [user, setUser] = useState<User | null>(null);
    console.log(imageUrl, "imageUrl");
    console.log(isLoading, "isLoading");
    console.log(imageUrlCover, "imageUrlCover");

    const [status, setStatus] = useState('status'); // حالة محلية لتخزين قيمة العمر

    const [interests, setinterests] = useState('interests'); // حالة محلية لتخزين قيمة العمر

    const [age, setAge] = useState(); // حالة محلية لتخزين قيمة العمر
    const [selectedCountry, setSelectedCountry] = useState(''); // اختيار قيمة اولية للدولة ولتكن Egypt
    const [gender, setGender] = useState(''); // Initialize with an empty string

    const handleCountrySelect = (country) => {
        setSelectedCountry(country?.cca2)
    };


    const handelSave = async () => {
        
        
        if (user) {
            console.log(user,"user");

            const data = DataStore.save(
                User.copyOf(user, (updatedUser) => {
                    updatedUser.Signature = status;
                    updatedUser.age = parseInt(age); // Convert age to a number
                    updatedUser.interests = interests;
                    updatedUser.country = selectedCountry;
                    updatedUser.gendar = gender;




                })
            );
            console.log(data,"data");
            
        }
    }
    useEffect(() => {

        const getUser = async () => {
            const authUser = await Auth.currentAuthenticatedUser();
            const loggedInUserId = authUser.attributes.sub;
            const dbUser = await DataStore.query(User, loggedInUserId)
            if (dbUser) {
                setUser(dbUser)
            }
        }

        // const subscription = DataStore.observe(User).subscribe(() => {
        //     getUser();
        // });
        getUser()

        // return () => {
        //     subscription.unsubscribe();
        // };

    }, [])
    const updateimage = async () => {

        const authUser = await Auth.currentAuthenticatedUser();
        const loggedInUserId = authUser.attributes.sub;
        const dbUser = await DataStore.query(User, loggedInUserId)
        if (dbUser) {
            setUser(dbUser)
            const data = DataStore.save(
                User.copyOf(dbUser, (updatedUser) => {
                    updatedUser.imageUri = imageUrl;
                })
            );

            if (data) {
                console.log(data, "data");

                setTimeout(() => {
                    setIsLoading(false)

                }, 3000)
            }
        }

    };

    const updateimageCover = async () => {

        const authUser = await Auth.currentAuthenticatedUser();
        const loggedInUserId = authUser.attributes.sub;
        const dbUser = await DataStore.query(User, loggedInUserId)
        if (dbUser) {
            setUser(dbUser)
            const data = DataStore.save(
                User.copyOf(dbUser, (updatedUser) => {
                    updatedUser.imageCover = imageUrlCover;
                })
            );

            if (data) {
                console.log(data, "data");

                setTimeout(() => {
                    setIsLoading(false)

                }, 3000)
            }
        }

    };
    const resetFields = () => {

        setImage(null);



    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setImage(result.assets[0].uri);
        }
    };

    const pickImageCover = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setImageimageCover(result.assets[0].uri);
        }
    };
    const progressCallback = (progress) => {
        setProgress(progress.loaded / progress.total);
    };

    const getBlob = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    };
    const sendImage = async () => {
        if (!image) {
            return;
        }
        const blob = await getBlob(image);
        const { key } = await Storage.put(`${uuid()}.png`, blob, {
            progressCallback,
        });
        const imageUrl = await Storage.get(key); // الحصول على رابط URL للصورة
        setImageUrl(imageUrl); // تحديث الحالة المحلية بالرابط URL للصورة
        setIsLoading(true); // Set loading state to false when upload is complete


    };

    const sendImageCover = async () => {
        if (!imageCover) {
            return;
        }
        const blob = await getBlob(imageCover);
        const { key } = await Storage.put(`${uuid()}.png`, blob, {
            progressCallback,
        });
        const imageUrl = await Storage.get(key); // الحصول على رابط URL للصورة
        setIimageUrlCover(imageUrl); // تحديث الحالة المحلية بالرابط URL للصورة
        setIsLoading(true); // Set loading state to false when upload is complete


    };

    useEffect(() => {
        if (imageUrl) {

            updateimage();
        }
    }, [imageUrl])
    useEffect(() => {
        if (imageUrlCover) {

            updateimageCover();
        }
    }, [imageUrlCover])
    useEffect(() => {
        if (image) {

            sendImage()

        }
    }, [image])
    useEffect(() => {
        if (imageCover) {

            sendImageCover()

        }
    }, [imageCover])
    const handleGenderSelect = (selectedGender) => {
        setGender(selectedGender);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={150}
            style={{ flex: 1 }}
        >
            {/* Conditionally render the loading indicator */}

            <View style={styles.container}>
                <Modal
                    visible={isLoading}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                </Modal>
                <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                        {
                            user?.imageCover && <Image source={{ uri: user?.imageCover }} style={styles.cover} />

                        }
                        <TouchableOpacity style={styles.icon2} onPress={() => pickImageCover()}>

                            <AntDesign name="camera" size={24} color="grey" />
                        </TouchableOpacity>

                        <View style={styles.curve}></View>
                    </View>
                    <View style={styles.photoContainer}>
                        {
                            user?.imageUri && <Image source={{ uri: user?.imageUri }} style={styles.profileImage} />
                        }



                        <TouchableOpacity style={styles.icon} onPress={() => pickImage()}>
                            <AntDesign name="camera" size={24} color="grey" />

                        </TouchableOpacity>

                    </View>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ backgroundColor: darkMode ? COLORS.darkBackground : COLORS.background, width: '100%' }}>
                            {/* ... Rest of your code ... */}
                            <View style={[styles.containerRow, { marginHorizontal: 20 }]}>
                                <Text style={[styles.text, { color: darkMode ? COLORS.lightText : COLORS.text }]}>Dark Mode</Text>
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
                        <View style={styles.containerCoulmn}>
                            <Text style={styles.text}>interests</Text>
                            <TextInput
                                style={styles.ageInput}
                                value={interests}
                                onChangeText={setinterests}
                                multiline
                            // تحديث حالة المحلية عندما يتم تعديل النص
                            />
                        </View>

                        <View style={styles.containerCoulmn}>
                            <Text style={styles.text}>Gender</Text>
                            <Picker
                                selectedValue={gender}
                                style={styles.picker}
                                onValueChange={(itemValue) => handleGenderSelect(itemValue)}
                            >
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Male" value="male" />
                                <Picker.Item label="Female" value="female" />
                            </Picker>
                        </View>
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
                            />
                        </View>


                        <View style={styles.containerCoulmn}>
                            <Text style={styles.text}>Status</Text>
                            <TextInput
                                style={styles.ageInput}
                                value={status}
                                onChangeText={setStatus}
                                multiline
                            />
                        </View>


                        <View style={styles.containerCoulmn}>
                            <TouchableOpacity
                                style={styles.statusButton}
                                onPress={handelSave}
                            >
                                <Text style={styles.statusButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>


            </View>
        </KeyboardAvoidingView>

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
    selectedCountryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    darkBackground: {
        backgroundColor: '#121212', // Change this to your desired dark mode background color
    },
    containerSelect: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#F5FCFF',
    },
    countryFlag: {
        width: 30,
        height: 20,
        marginRight: 10,
    },
    countryName: {
        fontSize: 16,
        marginBottom: 0
    },
    icon: {
        position: 'absolute',
        right: "33%",
        bottom: "22%"
    },
    icon2: {
        position: 'absolute',
        left: "10%",
        top: "10%"
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: '#242760',
        borderWidth: 1,
        position: 'relative'
    },
    photoContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 70,
    },
    profileInfo: {
        marginTop: '20%',
        alignItems: 'center',
        backgroundColor: "white",
    },
    loadingIndicator: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a semi-transparent background
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
        marginBottom: 10,
        color: '#242760',

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
    picker: {
        borderWidth: 1,
        borderColor: '#242760',
        borderRadius: 6,
        width: '100%',
        paddingHorizontal: 8,
        paddingVertical: 4,
        color: '#242760',
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
        margin: 20,
        width: '90%',
    },
    ageInput: {
        fontSize: 12,
        color: '#242760',
        borderWidth: 1,
        borderColor: '#242760',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        width: '100%',

    },
    statusButton: {
        marginTop: 10,
        backgroundColor: '#242760',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    statusButtonText: {
        color: 'white',
        fontSize: 12,
    },
});



export default setting
