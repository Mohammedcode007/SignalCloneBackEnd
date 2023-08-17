import { Auth, DataStore } from 'aws-amplify'
import React, { useEffect } from 'react'
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { FriendRequest, Friendship, User } from '../../src/models'

const NotifcationItem = ({ request }) => {


    // console.log(request, "request");
    const ACCEPTED = async (userId) => {
        if (userId) {
            try {
                const friendRequests = await (await DataStore.query(FriendRequest)).filter((i) => {
                    return (
                        i?.senderID === userId
                    )
                })
                console.log(friendRequests);

                if (friendRequests.length > 0) {
                    const friendRequestToUpdate = friendRequests[0]
                    console.log(friendRequestToUpdate);

                    // Update the status to 'accepted'
                    friendRequestToUpdate.status = 'accepted';

                    // Save the updated friend request back to the DataStore
                    const accept = await DataStore.save(
                        FriendRequest.copyOf(friendRequestToUpdate, (updated) => {
                            updated.status = "ACCEPTED";
                        })
                    );

                    if (accept) {

                        const authUser = await Auth.currentAuthenticatedUser();
                        const dbUser = await DataStore.query(User, authUser.attributes.sub);
                        const friend = await DataStore.query(User, accept?.senderID);

                        if (friend) {
                            const frindship = await DataStore.save(new Friendship({
                                myID: dbUser?.id,
                                userID: friend?.id
                            }));

                            if (friend) {
                                await DataStore.delete(accept);

                            }
                        }
                        // await DataStore.delete(accept);

                    }
                    console.log(accept, "accept");

                    console.log('Friend request updated successfully.');
                }
            } catch (error) {
                console.error('Error updating friend request:', error);
            }
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.containericon} >
                <Image style={styles.image} source={require('../../assets/images/manlogo.png')} />
                
                <Text style={styles.text}>{request?.name}</Text>
            </View>
            <View style={styles.containericon}>
                <TouchableOpacity onPress={() => ACCEPTED(request?.id)}>
                    <Image style={styles.imageChoose} source={require('../../assets/images/correct.png')} />

                </TouchableOpacity>

                <TouchableOpacity>
                    <Image style={styles.imageChoose} source={require('../../assets/images/wrong.png')} />

                </TouchableOpacity>

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10

    },
    containericon: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',

        justifyContent: 'center',
    },
   
    text: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 10
    },
    imageChoose: {
        width: 15,
        height: 15,
        marginHorizontal: 10
    }


});

export default NotifcationItem
