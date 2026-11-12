import palette from '../theme/colors';
import React, { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomAlert from '../components/CustomAlert';
import ApiService from '../services/apiservice';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const ForgotPassword = ({ navigation }) => {
  const { login } = useContext(AuthContext);

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const passwordInputRef = useRef(null);

  // VALIDATION
  const validateMobile = (num) => {
    if (!num) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(num)) return 'Enter valid 10-digit Indian mobile number';
    return '';
  };

  const validatePassword = (text) => {
    if (!text) return 'Password is required';
    if (text.length < 4) return 'Password must be at least 4 characters';
    return '';
  };

  const validateConfirmPassword = (text) => {
    if (!text) return 'Please confirm your password';
    if (text !== password) return 'Passwords do not match';
    return '';
  };

  const handleVerifyMobile = async () => {
    const error = validateMobile(mobileNumber);
    if (error) {
      setErrors({ mobileNumber: error });
      setTouched({ mobileNumber: true });
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.verifyMobileNumber(mobileNumber);
      if (response?.data?.length > 0  ) {
        setIsVerified(true);
        setTimeout(() => passwordInputRef.current?.focus(), 300);
      } else {
        setAlertMessage('Mobile number not found');
        setAlertVisible(true);
      }
    } catch (err) {
      setAlertMessage('Error verifying mobile number');
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword);

    if (passErr || confirmErr) {
      setErrors({ password: passErr, confirmPassword: confirmErr });
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.resetPassword(mobileNumber, password);
      if (response.status === 200) {
        Alert.alert('Success', 'Password reset successful');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to reset password');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitEnabled =
    isVerified &&
    !validatePassword(password) &&
    !validateConfirmPassword(confirmPassword);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={palette.surface} barStyle="dark-content" />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={26} color={palette.text} />
      </TouchableOpacity>
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
          maxLength={10}
          editable={!isVerified}
          value={mobileNumber}
          onChangeText={(text) => {
            setMobileNumber(text);
            if (touched.mobileNumber) {
              setErrors({ ...errors, mobileNumber: validateMobile(text) });
            }
          }}
          onBlur={() => {
            setTouched({ ...touched, mobileNumber: true });
            setErrors({ ...errors, mobileNumber: validateMobile(mobileNumber) });
          }}
        />
        {touched.mobileNumber && errors.mobileNumber && (
          <Text style={styles.errorText}>{errors.mobileNumber}</Text>
        )}

        {!isVerified ? (
          <TouchableOpacity style={styles.loginButton} onPress={handleVerifyMobile} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={palette.surface} />
            ) : (
              <Text style={styles.loginText}>Verify Number</Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            {/* Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordInputRef}
                style={[styles.input2, { flex: 1 }, errors.password && touched.password && styles.inputError]}
                placeholder="New Password"
                placeholderTextColor="gray"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (touched.password) {
                    setErrors({ ...errors, password: validatePassword(text) });
                  }
                }}
                onBlur={() => {
                  setTouched({ ...touched, password: true });
                  setErrors({ ...errors, password: validatePassword(password) });
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" style={{ paddingHorizontal: 8 }} />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password */}
            <TextInput
              style={[styles.input, errors.confirmPassword && touched.confirmPassword && styles.inputError]}
              placeholder="Re-enter Password"
              placeholderTextColor="gray"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (touched.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: validateConfirmPassword(text) });
                }
              }}
              onBlur={() => {
                setTouched({ ...touched, confirmPassword: true });
                setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
              }}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={[styles.loginButton, !isSubmitEnabled && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={!isSubmitEnabled || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={palette.surface} />
              ) : (
                <Text style={styles.loginText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
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
  backButton: {
    position: 'absolute',
    top: verticalScale(40),
    left: moderateScale(15),
    zIndex: 1,
    padding: moderateScale(5),
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: verticalScale(30),
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
    padding: moderateScale(5),
    borderRadius: moderateScale(5),
  },
  loginButton: {
    width: '100%',
    backgroundColor: palette.primary,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    marginBottom: verticalScale(10),
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
    paddingHorizontal: moderateScale(10),
    backgroundColor: palette.background,
    marginBottom: verticalScale(10),
    height: verticalScale(45),
  },
});

export default ForgotPassword;
