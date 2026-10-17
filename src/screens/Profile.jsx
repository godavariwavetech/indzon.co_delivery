import {useFocusEffect} from '@react-navigation/native';
import palette from '../theme/colors';
import {useCallback} from 'react';
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import ApiService from "../services/apiservice";
import { AuthContext } from "../context/AuthContext";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [loader,setLoader] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: null,
  });
  const [logoutVisible, setLogoutVisible] = useState(false);
  const { user ,logout,login} = useContext(AuthContext);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoader(true)
      const response = await ApiService.getProfileData(user);
      if (response?.status === 200 && response.data.data.length > 0) {
        
        const deliveryBoy = response.data.data[0];
        setProfile({
          name: deliveryBoy.delivery_boy_name,
          phone: deliveryBoy.delivery_boy_mobile_number,
          address: deliveryBoy.delivery_boy_address,
          avatar: deliveryBoy.profile_img, // Use profile_img from API
        });
      } else {
        Alert.alert("Error", response?.message || "Failed to fetch Profile.");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoader(false)
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchProfileData(); }, [fetchProfileData]));

  const handleEdit = () => {
    navigation.navigate("EditProfile", { profile,fetchProfileData });
  };

  const handleLogout = () => {
    setLogoutVisible(true);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    logout()

  };

  if(loader){
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size={'large'} color={palette.primary} />
      </View>
    )
  }

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="bars" size={scale(24)} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.container}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <Image
            source={profile.avatar ? { uri: profile.avatar } : require("../assets/personPlaceholder.jpg")}
            style={styles.avatar}
          />
          <TouchableOpacity onPress={handleEdit} style={styles.editIcon}>
            <MaterialCommunityIcons name="pencil" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Fields */}
        <TextInput
          placeholder="Name"
          placeholderTextColor="black"
          value={profile.name}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone"
          placeholderTextColor="black"
          value={profile.phone}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Address"
          placeholderTextColor="black"
          value={profile.address}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, address: text })}
          style={styles.input}
        />

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>

        {/* Logout Confirmation Modal */}
        <Modal transparent visible={logoutVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={styles.modalText}>Are you sure you want to logout?</Text>
              <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setLogoutVisible(false)} style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmLogout} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    padding: scale(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(15),
    paddingLeft: wp(5),
    backgroundColor: palette.primary,
    marginBottom: hp(1),
    width: "100%",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: wp(3),
    color: "white",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: verticalScale(50),
    // marginBottom: 50
  },
  avatar: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: palette.primary,
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  input: {
    width: "100%",
    paddingVertical: moderateScale(10),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: palette.disabled,
    borderRadius: moderateScale(5),
    marginBottom: verticalScale(10),
    color: "#000",
  },
  button: {
    width: "100%",
    backgroundColor: palette.primary,
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(5),
    marginTop: verticalScale(10),
  },
  logoutButton: {
    backgroundColor: palette.danger,
  },
  buttonText: {
    color: palette.surface,
    fontSize: moderateScale(16),
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: palette.surface,
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    marginBottom: verticalScale(10),
  },
  modalText: {
    fontSize: moderateScale(14),
    marginBottom: verticalScale(20),
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: moderateScale(10),
    alignItems: "center",
    backgroundColor: palette.primary,
    marginHorizontal: scale(5),
    borderRadius: moderateScale(5),
  },
  cancelButton: {
    backgroundColor: palette.danger,
  },
  modalButtonText: {
    color: palette.surface,
    fontSize: moderateScale(16),
  },
});
