import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { launchImageLibrary } from "react-native-image-picker";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import commonstyles from '../commonstyles/commonstyles';
import { scale } from "react-native-size-matters";
import ApiService from "../services/apiservice";
import { AuthContext } from "../context/AuthContext";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile, fetchProfileData } = route.params || {};
  const { user } = useContext(AuthContext);

  // Initialize state with received data
  const [image, setImage] = useState(profile?.avatar || null);
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState(profile?.address || "");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loader, setLoader] = useState(false);

  // Function to pick image from gallery
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", includeBase64: true }, (response) => {
      if (!response.didCancel && !response.error && response.assets) {
        //setImage(response.assets[0].base64);
        const base64Image = `data:image/jpeg;base64,${response.assets[0].base64}`;
        setImage(base64Image);
      }
    });
  };

  // Input Validation Function
  const validateInputs = () => {
    if (!name || !phone || !address || !password) {
      Alert.alert("Error", "All fields are required!");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return false;
    }

    return true;
  };

  const handlePhoneChange = (text) => {
    setPhone(text);
    setPhoneError(text.length < 10 ? "Phone number must be at least 10 digits" : "");
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError(text.length < 6 ? "Password must be at least 6 characters" : "");
  };

  // Function to handle profile update
  const handleUpdateProfile = async () => {
    if (!validateInputs()) return; // Stop if validation fails

    try {
      setLoader(true);
      const formData = {
        id: user?.id,   // Delivery Boy ID
        name,
        mobilenumber: phone,
        password,
        address,
        // avatar: image ? `data:image/jpeg;base64,${image}` : "",  // Optional image
        avatar: image || ''
      };
      console.log(formData, 'formData')

      const response = await ApiService.updateProfileData(formData);
      console.log(response, 'edit response>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')


      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully!");
        fetchProfileData();
        navigation.goBack();
      } else {
        Alert.alert("Error", response.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      <View style={styles.container}>
        {/* Profile Image Section */}
        <View style={styles.imageContainer}>
          <TouchableOpacity>

          </TouchableOpacity>
          <Image source={image ? { uri: image } : require("../assets/personPlaceholder.jpg")} style={styles.profileImage} />
          <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
            <MaterialIcons name="photo-camera" size={hp("2.5%")} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={hp("2.5%")} color="gray" style={styles.icon} />
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="phone" size={hp("2.5%")} color="gray" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="Phone"
              keyboardType="phone-pad"
              maxLength={10} // Prevents input beyond 10 digits
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={hp("2.5%")} color="gray" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Password"
              secureTextEntry
            />
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          <View style={styles.inputWrapper}>
            <MaterialIcons name="home" size={hp("2.5%")} color="gray" style={styles.icon} />
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />
          </View>
        </View>

        {/* Update Profile Button */}
        <TouchableOpacity style={[{ position: "absolute", bottom: hp("3%") }, commonstyles.button, { backgroundColor: "#85360B" }]} onPress={handleUpdateProfile}>
          {
            loader ? <ActivityIndicator size="small" color="#fff" /> : (
              <Text style={commonstyles.buttontext}>Update Profile</Text>
            )
          }
        </TouchableOpacity>
      </View>
    </>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: hp("1%"),
    backgroundColor: "#85360B",
    padding: scale(20),
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
    color: "white",
    marginLeft: wp("3%"),
  },
  imageContainer: {
    marginTop: hp("3%"),
    alignItems: "center",
    position: "relative",
  },
  profileImage: {
    width: hp("12%"),
    height: hp("12%"),
    borderRadius: hp("6%"),
    borderWidth: 2,
    borderColor: "#ddd",
  },
  errorText: {
    color: "red",
    fontSize: hp("1.8%"),
    marginLeft: wp("2%"),
    marginBottom: 10
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#85360B",
    borderRadius: hp("4%"),
    padding: hp("1%"),
  },
  inputContainer: {
    width: "100%",
    marginTop: hp("3%"),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: hp("3%"),
    paddingHorizontal: wp("4%"),
    marginBottom: hp("2%"),
    elevation: 0,
  },
  icon: {
    marginRight: wp("3%"),
  },
  input: {
    flex: 1,
    fontSize: hp("2%"),
    color: "#000",
  },
});
