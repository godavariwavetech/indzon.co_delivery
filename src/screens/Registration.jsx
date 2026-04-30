import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Modal,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/apiservice';
import { AuthContext } from "../context/AuthContext";
import { getFCMToken, getTokenValue } from '../NotificationService';

const Registration = () => {
  const { user } = useContext(AuthContext);
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    address: '',
    location: '',
    aadharNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    bankHolderName: '',
    bankDetails: '',
    drivingLicenceNumber: '',
    bikeNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [images, setImages] = useState({
    aadharImage: { uri: null, base64: null },
    panImage: { uri: null, base64: null },
    bankBookImage: { uri: null, base64: null },
    licenceImage: { uri: null, base64: null },
    bikeImage: { uri: null, base64: null },
    selfie: { uri: null, base64: null },
  });


  const [showLocationModal, setShowLocationModal] = useState(false);
  const [deliveryBoylocationId, setDeliveryBoyLocationId] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Added for password visibility toggle
  const [loader, setLoader] = useState(false)


  const navigation = useNavigation();

  const uploadToken = async () => {
    console.log(">>>>>>>>>>>>>>>>>VCALLIN")
    const token = await getTokenValue();
    // console.log("TOKEN>>>>>>>>>>>>>>>>>",token,ApiService)
    const value = await ApiService.uploadFcmToken(token, user?.id, user?.delivery_boy_location_id);
    setDeliveryBoyLocationId(user?.delivery_boy_location_id)

    console.log("value", value)
  }
  useEffect(() => {
    uploadToken();
    fetchLocations();
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      // setLoading(true);
      // setRefreshing(true);
      const response = await ApiService.getLocations();
      console.log(response, 'LOCATIONS');
      if (response?.status === 200) {
        setLocations(response.data);
      } else {
        Alert.alert("Error", response?.message || "Failed to load orders.");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
    } else if (!/^[0-9]{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
    }

    if (!formData.panNumber.trim()) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN number format';
    }

    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = 'Bank account number is required';
    }

    if (!formData.bankHolderName.trim()) {
      newErrors.bankHolderName = 'Account holder name is required';
    }

    if (!formData.bankDetails.trim()) {
      newErrors.bankDetails = 'Bank details are required';
    }

    if (!formData.drivingLicenceNumber.trim()) {
      newErrors.drivingLicenceNumber = 'Driving licence number is required';
    }

    if (!formData.bikeNumber.trim()) {
      newErrors.bikeNumber = 'Bike number is required';
    }

    // Image validations
    if (!images.aadharImage.base64) {
      newErrors.aadharImage = 'Aadhar image is required';
    }

    if (!images.panImage.base64) {
      newErrors.panImage = 'PAN image is required';
    }

    if (!images.bankBookImage.base64) {
      newErrors.bankBookImage = 'Bank book image is required';
    }

    if (!images.licenceImage.base64) {
      newErrors.licenceImage = 'Driving licence image is required';
    }

    if (!images.bikeImage.base64) {
      newErrors.bikeImage = 'Bike image is required';
    }

    if (!images.selfie.base64) {
      newErrors.selfie = 'Your image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const pickImage = (field) => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
      selectionLimit: 1,
      includeExtra: false,
    }, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', 'Failed to pick image');
        return;
      }

      if (response.assets && response.assets[0]) {
        setImages(prev => ({
          ...prev,
          [field]: {
            uri: response.assets[0].uri,
            base64: `data:${response.assets[0].type};base64,${response.assets[0].base64}`
            // base64: `data:${response.assets[0].type}';base64,'${response.assets[0].base64}`
            // base64: `data:${response.assets[0].type}';base64,`

          }
        }));
      }
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    console.log("HELLO");
    const formSubmissionData = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      address: formData.address,
      // location: formData.location,
      bankAccountNumber: formData.bankAccountNumber,
      bankHolderName: formData.bankHolderName,
      aadharNumber: formData.aadharNumber,
      panNumber: formData.panNumber,
      drivingLicenceNumber: formData.drivingLicenceNumber,
      bankBookImage: images.bankBookImage.base64,
      bikeNumber: formData.bikeNumber,
      aadharImage: images.aadharImage.base64,
      panImage: images.panImage.base64,
      licenceImage: images.licenceImage.base64,
      bikeImage: images.bikeImage.base64,
      selfie: images.selfie.base64,
      delivery_boy_location_id: locationId
    };

    console.log(formSubmissionData, 'registration2');
    deliveryBoyRegistration(formSubmissionData);
  };

  const deliveryBoyRegistration = useCallback(async (formSubmissionData) => {
    try {
      setLoader(true)
      const resp = await ApiService.registration(formSubmissionData);
      console.log(resp, 'APIresp>>>>>>>...');
      if (resp?.status === 200) {
        console.log(resp.data, 'resp.data');
        Alert.alert('Registration Successfull');
        navigation.goBack();
      } else {
        Alert.alert("Error", resp?.message || "Failed to submit.");
      }
    } catch (error) {
      console.log("Error", error.message || "Something went wrong.")
    } finally {
      setLoader(false)
    }
  })

  // Handle location selection
  const handleChange = (field, value) => {
    if (field === 'location') {
      // Value is the location object
      setFormData(prev => ({
        ...prev,
        location: value.location_name, // Store location_name for display
      }));
      setLocationId(value.id); // Store location ID
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    console.log(locationId, 'locationId')
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => {
        handleChange('location', item);
        setShowLocationModal(false);
        // setLocationId(item.id)
      }}
    >
      <Text style={[
        styles.locationItemText,
        formData.location === item && styles.selectedLocationText
      ]}>
        {item?.location_name}
      </Text>
      {formData.location === item && (
        <Icon name="check" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#85360B" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { navigation.goBack() }}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('name', value)}
                value={formData.name}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('phoneNumber', value)}
                value={formData.phoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('password', value)}
                value={formData.password}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <View style={[styles.inputWrapper, styles.multilineWrapper]}>
              <Icon name="home" size={24} color="#666" style={[styles.inputIcon, styles.multilineIcon]} />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                onChangeText={(value) => handleChange('address', value)}
                value={formData.address}
                placeholder="Enter your address"
                placeholderTextColor="#999"
                multiline
              />
            </View>
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* Location Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowLocationModal(true)}
            >
              <View style={[styles.inputWrapper, { borderWidth: 0 }]}>
                <Icon name="location-on" size={24} color="#666" style={styles.inputIcon} />
                <Text style={[
                  styles.locationButtonText,
                  !formData.location && styles.placeholderText
                ]}>
                  {formData.location || 'Select Location'}
                </Text>
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Bank Details Section */}
          <View style={styles.sectionHeader}>
            <Icon name="account-balance" size={24} color="#333" />
            <Text style={styles.sectionTitle}>Bank Details</Text>
          </View>

          {/* Bank Account Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Account Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="credit-card" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('bankAccountNumber', value)}
                value={formData.bankAccountNumber}
                placeholder="Enter bank account number"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            {errors.bankAccountNumber && <Text style={styles.errorText}>{errors.bankAccountNumber}</Text>}
          </View>

          {/* Bank Holder Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Account Holder Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('bankHolderName', value)}
                value={formData.bankHolderName}
                placeholder="Enter account holder name"
                placeholderTextColor="#999"
              />
            </View>
            {errors.bankHolderName && <Text style={styles.errorText}>{errors.bankHolderName}</Text>}
          </View>

          {/* Bank Details */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bank Name & Branch</Text>
            <View style={[styles.inputWrapper, styles.multilineWrapper]}>
              <Icon name="account-balance" size={24} color="#666" style={[styles.inputIcon, styles.multilineIcon]} />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                onChangeText={(value) => handleChange('bankDetails', value)}
                value={formData.bankDetails}
                placeholder="Enter bank name and branch details"
                placeholderTextColor="#999"
                multiline
              />
            </View>
            {errors.bankDetails && <Text style={styles.errorText}>{errors.bankDetails}</Text>}
          </View>

          {/* Aadhar Number and Image */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Aadhar Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="badge" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('aadharNumber', value)}
                value={formData.aadharNumber}
                placeholder="Enter Aadhar number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={12}
              />
            </View>
            {errors.aadharNumber && <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.aadharNumber}</Text>}
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => pickImage('aadharImage')}
            >
              {images.aadharImage.uri ? (
                <Image source={{ uri: images.aadharImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContent}>
                  <Icon name="upload-file" size={40} color="#666" />
                  <Text style={styles.placeholderText}>Upload Aadhar Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.aadharImage && <Text style={styles.errorText}>{errors.aadharImage}</Text>}
          </View>

          {/* PAN Number and Image */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>PAN Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="credit-card" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('panNumber', value.toUpperCase())}
                value={formData.panNumber}
                placeholder="Enter PAN number"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>
            {errors.panNumber && <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.panNumber}</Text>}
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => pickImage('panImage')}
            >
              {images.panImage.uri ? (
                <Image source={{ uri: images.panImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContent}>
                  <Icon name="upload-file" size={40} color="#666" />
                  <Text style={styles.placeholderText}>Upload PAN Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.panImage && <Text style={styles.errorText}>{errors.panImage}</Text>}
          </View>

          {/* Bank Book Image */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bank Book Image</Text>
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => pickImage('bankBookImage')}
            >
              {images.bankBookImage.uri ? (
                <Image source={{ uri: images.bankBookImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContent}>
                  <Icon name="upload-file" size={40} color="#666" />
                  <Text style={styles.placeholderText}>Upload Bank Book Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.bankBookImage && <Text style={styles.errorText}>{errors.bankBookImage}</Text>}
          </View>

          {/* Driving Licence Number and Image */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Driving Licence Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="directions-car" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('drivingLicenceNumber', value)}
                value={formData.drivingLicenceNumber}
                placeholder="Enter driving licence number"
                placeholderTextColor="#999"
              />
            </View>
            {errors.drivingLicenceNumber && (
              <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.drivingLicenceNumber}</Text>
            )}
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => pickImage('licenceImage')}
            >
              {images.licenceImage.uri ? (
                <Image source={{ uri: images.licenceImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContent}>
                  <Icon name="upload-file" size={40} color="#666" />
                  <Text style={styles.placeholderText}>Upload Licence Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.licenceImage && <Text style={styles.errorText}>{errors.licenceImage}</Text>}
          </View>

          {/* Bike Number and Image */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bike Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="two-wheeler" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleChange('bikeNumber', value)}
                value={formData.bikeNumber}
                placeholder="Enter bike number"
                placeholderTextColor="#999"
              />
            </View>
            {errors.bikeNumber && <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.bikeNumber}</Text>}
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => pickImage('bikeImage')}
            >
              {images.bikeImage.uri ? (
                <Image source={{ uri: images.bikeImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContent}>
                  <Icon name="upload-file" size={40} color="#666" />
                  <Text style={styles.placeholderText}>Upload Bike Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.bikeImage && <Text style={styles.errorText}>{errors.bikeImage}</Text>}
          </View>

          {/* Selfie */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Image</Text>
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => pickImage('selfie')}
            >
              {images.selfie.uri ? (
                <Image source={{ uri: images.selfie.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContent}>
                  {/* <Icon name="camera-alt" size={40} color="#666" /> */}
                  <Icon name="upload-file" size={40} color="#666" />
                  <Text style={styles.placeholderText}>Upload Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.selfie && <Text style={styles.errorText}>{errors.selfie}</Text>}
          </View>

          <TouchableOpacity onPress={handleSubmit}  style={styles.submitButton}>
            {
                loader ? <ActivityIndicator size='small' color={'#fff'} /> : (
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                <Icon name="check-circle" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>Submit</Text>
              </View>
                )
            }
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={locations}
              renderItem={renderLocationItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.locationList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#85360B',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  multilineWrapper: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 10,
  },
  multilineIcon: {
    marginTop: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  locationButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    marginTop: 10,
    overflow: 'hidden',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  submitButton: {
    // backgroundColor: '#007AFF',
    backgroundColor: '#85360B',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  locationList: {
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLocationText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  eyeIcon: {
    padding: 10,
  },
});

export default Registration; 