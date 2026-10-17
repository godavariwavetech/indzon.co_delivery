import palette from '../theme/colors';

import React, { useContext,useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { AuthContext } from "../context/AuthContext";
import ApiService from '../services/apiservice';


const DeleteAccountScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    useEffect(()=>{
    },[user?.id])

    const handleDelete = async () => {
        try {

            const resp = await ApiService.deleteAccount(user?.id);
            if (resp?.status === 200) {
                await logout();
                Alert.alert('Account deleted successfully');
            } else {
                Alert.alert("Error", resp?.message || "Failed to fetch Profile.");
            }
        } catch (error) {
            Alert.alert("Error", error.message || "Something went wrong.");
        }
    }

    const handleDeleteAccount = () => {

        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel', },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        handleDelete()




                    },
                },
            ],
        );
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 20, fontSize: 16 }}>Delete your account permanently</Text>
            <Button title="Delete Account" color={palette.primary} onPress={handleDeleteAccount} />
        </View>
    );
};

export default DeleteAccountScreen;
