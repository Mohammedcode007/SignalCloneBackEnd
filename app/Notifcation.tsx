import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, FlatList } from 'react-native'
import NotifcationItem from '../components/NotifcationItem/NotifcationItem'
import { Auth, DataStore } from 'aws-amplify'
import { FriendRequest, User } from '../src/models'
import { useDispatch } from 'react-redux'
import { addTonotify } from '../redux/mainSlice'

const Notifcation = () => {
    const [fetchID, setfetchID] = useState([])
    const [userDetails, setuserDetails] = useState([])
    const [friendRequestLength, setFriendRequestLength] = useState(0); // State for storing friend request length
console.log(friendRequestLength,"friendRequestLength");
const dispatch = useDispatch();
useEffect(()=>{
    if(friendRequestLength > 0){
        dispatch(addTonotify(friendRequestLength));
    
    }
},[friendRequestLength])


    useEffect(() => {
        const fetchData = async () => {
            const authUser = await Auth.currentAuthenticatedUser();
            const dbUser = await DataStore.query(User, authUser.attributes.sub);
    
            if (dbUser) {
                const friendRequests = await DataStore.query(FriendRequest);
                const filteredFriendRequests = friendRequests.filter((i) => {
                    return i?.recipientID === dbUser?.id;
                });
    
                const senderIDs = filteredFriendRequests.map(i => i?.senderID);
                
                const userDetailsPromises = senderIDs.map(async (senderID) => {
                    return await DataStore.query(User, senderID);
                });
    
                const userDetails = await Promise.all(userDetailsPromises);
    
                setuserDetails(userDetails);
                setfetchID(filteredFriendRequests);

                // Update friendRequestLength state with the new length
                setFriendRequestLength(filteredFriendRequests.length);
            }
        };

        const subscription = DataStore.observe(FriendRequest).subscribe(() => {
            fetchData();
        });

        fetchData();

        return () => {
            subscription.unsubscribe();
        };
    
    }, []);
    
    return (
        <SafeAreaView style={{ flex: 1, paddingTop: '10%' }}>
             {/* Display the friend request length */}
            <FlatList
                data={userDetails}
                keyExtractor={(item) => item?.id}
                renderItem={({ item }) => <NotifcationItem request={item} />}
            />
        </SafeAreaView>
    )
}

export default Notifcation
