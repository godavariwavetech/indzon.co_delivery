import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import commonstyles from '../../src/commonstyles/commonstyles';
const { width, height } = Dimensions.get("window");
import { useNavigation } from "@react-navigation/native";
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const OTPVerificationScreen = ({ route }) => {
    const { phoneNumber, orderDetails, handleAccept } = route.params; // Get orderDetails
    const navigation = useNavigation();
    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputRefs = useRef([]);
  
    const handleOtpChange = (text, index) => {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
  
      if (text.length === 1 && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus(); 
      }
    };
  
    const handleKeyPress = (e, index) => {
      if (e.nativeEvent.key === "Backspace" && index > 0 && otp[index] === "") {
        inputRefs.current[index - 1].focus(); 
      }
    };
  
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="keyboard-arrow-left" size={28} color="black" />
        </TouchableOpacity>
  
        <View style={styles.content}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            A code has been sent to <Text style={styles.phoneNumber}>91+ {phoneNumber}</Text>
          </Text>
  
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpBox}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                textAlign="center"
              />
            ))}
          </View>
  
          <Text style={styles.resendText}>
            Don’t receive a code? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </View>
  
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => {
            orderDetails.status = "Progress"; // Update order status
            handleAccept(); // Call accept function
            navigation.replace("Orders", { orderDetails }); // Pass updated orderDetails back
          }}
        >
          <Text style={commonstyles.buttontext}>Verify Now</Text>
        </TouchableOpacity>
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: width * 0.08,
    justifyContent: "center", // Ensures content is vertically centered
  },
  backButton: {
    position: "absolute",
   top: hp("2%"),
       left: wp("4%"),
    borderWidth: 1, // Border width
    borderColor: "#000",
    borderRadius:7,
    padding: moderateScale(5),
  },
  content: {
    flex: 1, // Takes up available space
    alignItems: "center",
    justifyContent: "center", // Centers the content in the middle of the screen
  },
  title: {
    // fontSize: width * 0.06,
    fontSize:20,
    fontWeight: 500,
    color: "#000",
    marginBottom: height * 0.015,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#93969F",
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  phoneNumber: {
    fontWeight: "bold",
    color: "#93969F",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: height * 0.03,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#85360B",
    borderRadius: 10,
    width: width * 0.14,
    height: height * 0.07,
    fontSize: width * 0.05,
    color: "#000",
    textAlign: "center",
    backgroundColor:"#fff"
  },
  resendText: {
    fontSize: width * 0.04,
    color: "#000",
  },
  resendLink: {
    color: "#85360B",
    fontWeight: 600,
  },
  verifyButton: {
    backgroundColor: "#85360B",
    width: "100%",
    paddingVertical: height * 0.018,
    borderRadius: 50,
    alignItems: "center",
    position: "absolute",
    bottom: height * 0.04, // Ensure it sticks at the bottom
    alignSelf: "center",
  },
  verifyText: {
    color: "#FFF",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
});

export default OTPVerificationScreen;
