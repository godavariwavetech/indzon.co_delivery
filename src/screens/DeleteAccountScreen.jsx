import palette from '../theme/colors';
// screens/DeleteAccountScreen.js
import React, { useContext,useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { AuthContext } from "../context/AuthContext";
import ApiService from '../services/apiservice';


const DeleteAccountScreen = ({ navigation }) => {
    const { user, login } = useContext(AuthContext);

    useEffect(()=>{
        console.log(user?.id, 'user');
    },[user?.id])

    const handleDelete = async () => {
        console.log('deleted');
        try {
            // setLoader(true)
            const resp = await ApiService.deleteAccount(user?.id);
            console.log(resp, 'delete response')
            console.log(resp?.status === 200)
            if (resp?.status === 200) {
                const result = await ApiService.login();
                await login(result.data[0]);
                Alert.alert('Data reset successfully');
                navigation.navigate('Home');
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
            'Are you sure you want to reset your profile and deliveries? This resets the local data.',
            [
                { text: 'Cancel', style: 'cancel', },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        handleDelete()
                        // TODO: Add your API call here
                        // Example: await api.delete('/user/account');
                        // Alert.alert('Demo reset successfully');
                        // navigation.navigate('Home');
                    },
                },
            ],
        );
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 20, fontSize: 16 }}>Reset your profile and deliveries</Text>
            <Button title="Reset Data" color={palette.primary} onPress={handleDeleteAccount} />
        </View>
    );
};

export default DeleteAccountScreen;
