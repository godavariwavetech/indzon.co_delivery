import palette from '../theme/colors';
import React, {useContext} from "react";
import {AuthContext} from '../context/AuthContext';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
import { useNavigation, DrawerActions } from "@react-navigation/native";

const CustomDrawer = (props) => {
  const navigation = useNavigation();
  const {user, logout} = useContext(AuthContext);
  
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <MaterialIcons name="menu" size={30} color="white" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require("../assets/person.png")} // Replace with actual profile image
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user?.delivery_boy_name}</Text>
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.primary,
    paddingHorizontal: wp("5%"), // Added padding for better alignment
  },
  profileSection: {
    alignItems: "center", // Centers content horizontally
    paddingVertical: hp("5%"),
    borderBottomWidth: 1,
    borderBottomColor: palette.surface,
  },
  profileImage: {
    width: wp("18%"),
    height: wp("18%"),
    borderRadius: wp("9%"),
    marginBottom: hp("1%"),
  },
  profileName: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: palette.surface,
    textAlign: "center", // Ensures text is centered properly
    marginTop: hp("1%"), // Adds space between image and text
  },
  logoutButton: {
    paddingVertical: hp("2%"),
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: palette.surface,
  },
  logoutText: {
    fontSize: wp("4.5%"),
    color: palette.surface,
    fontWeight: "bold",
  },
  backButton: {
    position: 'absolute',
    top: hp('2%'),
    left: wp('4%'),
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: moderateScale(5),
    borderRadius: moderateScale(10),
  },
});
