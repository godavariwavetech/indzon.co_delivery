import palette from '../theme/colors';
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
   StatusBar,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ApiService from '../services/apiservice';
import { Alert } from 'react-native';
import { AuthContext } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// --- ⬇️ 1. Import the new modal component ---
import TermsModal from '../components/TermsModal';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ mobileNumber: '', password: '' });
  const [touched, setTouched] = useState({ mobileNumber: false, password: false });
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(true);
  
  // This state now only controls visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  const validatePhoneNumber = (number) => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!number) return 'Phone number is required';
    if (number.length !== 10) return 'Phone number must be 10 digits';
    if (!indianPhoneRegex.test(number)) return 'Invalid number. Must start with 6, 7, 8, or 9';
    return '';
  };

  const validatePassword = (pass) => {
    if (!pass) return 'Password is required';
    return '';
  };

  const handleMobileChange = (text) => {
    setMobileNumber(text);
    if (touched.mobileNumber) {
      setErrors((prevErrors) => ({ ...prevErrors, mobileNumber: validatePhoneNumber(text) }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (touched.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: validatePassword(text) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: field === 'mobileNumber' ? validatePhoneNumber(mobileNumber) : validatePassword(password),
    }));
  };

  const isButtonEnabled =
    mobileNumber.length === 10 &&
    password.length > 0 &&
    !errors.mobileNumber &&
    !errors.password &&
    isAgreed;

  const handleLogin = async () => {
    if (isButtonEnabled) {
      setLoading(true);
      try {
        const response = await ApiService.login(mobileNumber, password);
        if (response.status === 200 && response.data.length > 0) {
          await login(response.data[0]);

        } else if (response.status === 300) {
          setAlertMessage('Please wait until verification is complete from Admin');
          setAlertVisible(true);
          setPassword('');
          setMobileNumber('');
        }
        else {
          setAlertMessage('Invalid credentials');
          setAlertVisible(true);
        }
      } catch (error) {
        console.error('Login Error:', error);
        Alert.alert('Login Failed', error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.container}>
      <StatusBar backgroundColor={palette.surface} barStyle="dark-content" />
            <Image
        source={require('../assets/indzon-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.mobileNumber && touched.mobileNumber && styles.inputError]}
                placeholder="Mobile Number"
                placeholderTextColor="gray"
                keyboardType="phone-pad"
                value={mobileNumber}
                maxLength={10}
                onChangeText={handleMobileChange}
                onBlur={() => handleBlur('mobileNumber')}
              />
              {touched.mobileNumber && errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}

        <View style={styles.passwordContainer}>
              <TextInput
            style={[
              styles.input2,
              { flex: 1 },
              errors.password && touched.password && styles.inputError
            ]}
                placeholder="Password"
                placeholderTextColor="gray"
            secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => handleBlur('password')}
              />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="gray"
              style={{ paddingHorizontal: 8 }}
            />
          </TouchableOpacity>
        </View>
        {touched.password && errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.forgotPasswordContainer}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.agreementContainer}>
        <TouchableOpacity onPress={() => setIsAgreed(!isAgreed)} style={styles.checkbox}>
          <Icon
            name={isAgreed ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={isAgreed ? palette.primary : 'gray'}
          />
        </TouchableOpacity>
        <Text style={styles.agreementText}>
          I agree to the{' '}
          <Text style={styles.linkText} onPress={() => setIsModalVisible(true)}>
            Terms & Conditions
          </Text>
        </Text>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, !isButtonEnabled && styles.disabledButton]}
              onPress={handleLogin}
              disabled={!isButtonEnabled || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={palette.surface} />
              ) : (
                <Text style={styles.loginText}>Enter</Text>
              )}
            </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
        <Text style={{ color: palette.primary, marginTop: verticalScale(20) }}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {/* --- ⬇️ 2. Use the new component here --- */}
      <TermsModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(20),
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: verticalScale(20),
    borderRadius: 10,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: verticalScale(45),
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    backgroundColor: palette.background,
    marginBottom: verticalScale(10),
    fontSize: scale(14),
    color: '#000',
  },
  input2: {
    backgroundColor: palette.background,
    fontSize: scale(14),
    color: '#000',
  },
  inputError: {
    borderColor: palette.danger,
    backgroundColor: palette.dangerSoft,
  },
  errorText: {
    color: palette.danger,
    fontSize: scale(12),
    marginBottom: verticalScale(5),
    paddingLeft: moderateScale(5),
  },
  loginButton: {
    width: '100%',
    backgroundColor: palette.primary,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    marginTop: verticalScale(15),
  },
  disabledButton: {
    backgroundColor: palette.disabled,
  },
  loginText: {
    color: palette.surface,
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: moderateScale(10),
    backgroundColor: palette.background,
    marginBottom: verticalScale(10),
    height: verticalScale(45),
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: verticalScale(15),
  },
  forgotPasswordText: {
    color: palette.primary,
    fontSize: scale(12),
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
  },
  checkbox: {
    marginRight: moderateScale(8),
  },
  agreementText: {
    fontSize: scale(13),
    color: palette.text,
  },
  linkText: {
    color: palette.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
