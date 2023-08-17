import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import { styles } from './styles';
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser, ChatRoomAdminship, ChatRoomMembership, ChatRoomOwnership, FriendRequest } from "../../src/models";
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';


interface FriendsUserItemProps {
    oneUserItem: {
        imageUri: any;
        name: any;
        id: any;
        Signature: any;
        lastOnlineAt: any;
        // Add other properties of 'chatRoomDataItem' if any

    };
    isSelected: void;
    onPress: () => void;
    isAdmin: false;
    onLongPress: () => void;
    chatRoom: any;

}

const FriendsUserItem: React.FC<FriendsUserItemProps> = ({ oneUserItem, isSelected, onPress, isAdmin, onLongPress, chatRoom }: FriendsUserItemProps) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused(); // Hook to determine if the screen is focused

    const [adminColor, setadminColor] = useState([])
    const [memberColor, setmemberColor] = useState([])
    const [ownerColor, setownerColor] = useState([])
    const [isOnline, setisOnline] = useState(null)

    console.log(isOnline);

  





    useEffect(() => {

        const chekcolor = async () => {
            if (chatRoom && oneUserItem) {
                const isAdmin = (
                    await DataStore.query(ChatRoomAdminship)
                ).filter((u) => u?.userID === oneUserItem?.id && u?.chatroomID === chatRoom?.id).map((i) => i?.userID);

                const isMember = (
                    await DataStore.query(ChatRoomMembership)
                ).filter((u) => u?.userID === oneUserItem?.id && u?.chatroomID === chatRoom?.id).map((i) => i?.userID);

                const isOwner = (
                    await DataStore.query(ChatRoomOwnership)
                ).filter((u) => u?.userID === oneUserItem?.id && u?.chatroomID === chatRoom?.id).map((i) => i?.userID);



                // Update adminColor state with the new values
                setadminColor((prevAdminColor) => prevAdminColor.concat(isAdmin));
                setmemberColor((prevAdminColor) => prevAdminColor.concat(isMember));
                setownerColor((prevAdminColor) => prevAdminColor.concat(isOwner));

                // Update memberColor state with the new values

            }
        };

        chekcolor()

    }, [])

    const [checkIcon, setcheckIcon] = useState()


    const createRequest = async (userId) => {
        const authUser = await Auth.currentAuthenticatedUser();
        const dbUser = await DataStore.query(User, authUser.attributes.sub);
        if (dbUser) {
            const check = await (await DataStore.query(FriendRequest)).filter((i) => {
                return (
                    i?.senderID === dbUser?.id && i?.recipientID === userId
                )
            })

            if (check.length > 0) {
                console.log(check.length, "vvvvv");

            } else {
                const res = await DataStore.save(new FriendRequest({
                    senderID: dbUser?.id,
                    recipientID: userId,
                    status: 'PENDING'
                }));
                setcheckIcon(res)

            }
            console.log(check);
        }

    }


    const [lastOnlineAt, setLastOnlineAt] = useState();
useEffect(()=>{
    setLastOnlineAt(oneUserItem?.lastOnlineAt)
},[oneUserItem])
    const [ckeckStatus, setckeckStatus] = useState('')
    console.log(ckeckStatus);

    useEffect(() => {
        if (isFocused) {
            const getLastOnlineText = () => {
                if (!oneUserItem?.lastOnlineAt) {
                    return null;
                }
                console.log(lastOnlineAt, "oneUserItem");


                // if lastOnlineAt is less than 5 minutes ago, show him as ONLINE
                const lastOnlineDiffMS = moment().diff(moment(lastOnlineAt));
                console.log(lastOnlineDiffMS);

                if (lastOnlineDiffMS < 60 * 1000) {
                    // less than 5 minutes
                    return setckeckStatus('online');
                } else {
                    return setckeckStatus('offline');
                }
            };
            getLastOnlineText()
            // ... Existing code ...
        }
    }, [isFocused, lastOnlineAt]);
    return (
        <Pressable onLongPress={onLongPress}
            onPress={onPress}>
            <View style={styles.container}>
                <View style={{ flex: 1, display: 'flex', flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
                    <Animatable.View
                        animation={ckeckStatus === "online" ? 'pulse' : ''}
                        iterationCount="infinite"
                        duration={1000}
                    >

                        <Image style={[styles.image, {
                            borderColor: ckeckStatus === "online" ? 'green' : '',
                            borderWidth: ckeckStatus === "online" ? 2 : 0
                        }]} source={{ uri: oneUserItem?.imageUri }} />
                    </Animatable.View>
                    {/* <Image style={styles.image} source={{ uri: oneUserItem?.imageUri }} /> */}
                    <View style={styles.RightContainer}>


                        <Text style={styles.name}> {oneUserItem?.name}</Text>
                        <Text style={styles.Signature} numberOfLines={1}>{oneUserItem?.Signature}</Text>

                    </View>

                </View>

            </View>

            {isSelected !== undefined && (
                <Feather
                    name={isSelected ? "check-circle" : "circle"}
                    size={20}
                    color="#4f4f4f"
                />
            )}
        </Pressable>

    );
};





export default FriendsUserItem
