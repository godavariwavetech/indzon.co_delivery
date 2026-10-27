import palette from '../theme/colors';

import React, { useContext,useEffect } from 'react';
import { View, Text, Button, Alert, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: palette.primary, paddingHorizontal: 12, height: 56 }}>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}>
                    <MaterialIcons name="arrow-back" size={24} color={palette.surface} />
                </TouchableOpacity>
                <Text style={{ color: palette.surface, fontSize: 20, fontWeight: 'bold' }}>Delete Account</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 20, fontSize: 16 }}>Delete your account permanently</Text>
            <Button title="Delete Account" color={palette.primary} onPress={handleDeleteAccount} />
            </View>
        </View>
    );
};

export default DeleteAccountScreen;
