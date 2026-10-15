import palette from '../theme/colors';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ApiService from '../services/apiservice';
import { useNavigation } from '@react-navigation/native';

const ContactUsScreen = () => {
  const navigation = useNavigation();
  const [contactInfo, setContactInfo] = useState({
    "email": "support@example.com",
    "whatsapp": "+1234567890",
    "phone": "+1234567890"
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false); // Track API failure

  // Function to fetch contact details
  const fetchContactInfo = async () => {
    try {
      setRefreshing(true);
      setError(false); // Reset error on retry
      const response = await ApiService.getContactUs();
      console.log(response,'contacts')
      if (response.status === 200) {
        console.log(response.data[0])
        setContactInfo(response.data[0])
      }
    } catch (error) {
      setError(true); // Mark API call as failed
      Alert.alert('Error', 'Failed to fetch contact details. Pull down to retry.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContactInfo(); // Fetch data on component mount
  }, []);

  const handleWhatsAppPress = () => Alert.alert('Support', `Simulated WhatsApp chat with ${contactInfo.contact_number}`);
  const handleCallPress = () => Alert.alert('Support', `Simulated call to ${contactInfo.contact_number}`);
  const handleEmailPress = () => Alert.alert('Support', `Simulated email to ${contactInfo.mail_id}`);

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={30} color={palette.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      {/* Content with Pull-to-Refresh */}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchContactInfo} />
        }
      >
        {/* Show error message if API failed */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load data. Pull down to retry.</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'column', gap: 15 }}>
            {/* <Text style={styles.infoText}>WhatsApp: {contactInfo.contact_number || 'N/A'}</Text>
             <Text style={styles.infoText}>Phone: {contactInfo.contact_number || 'N/A'}</Text>
             <Text style={styles.infoText}>Email: {contactInfo.mail_id || 'N/A'}</Text> */}

            {/* WhatsApp Button */}
            <TouchableOpacity style={styles.option} onPress={handleWhatsAppPress}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Ionicons name="logo-whatsapp" size={24} color={palette.primary} />
                <Text style={styles.optionText}>Message on WhatsApp</Text>
              </View>
            </TouchableOpacity>

            {/* Call Button */}
            <TouchableOpacity style={styles.option} onPress={handleCallPress}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Ionicons name="call-outline" size={24} color={palette.primary} />
                <Text style={styles.optionText}>Call Us</Text>
              </View>
            </TouchableOpacity>

            {/* Email Button */}
            <TouchableOpacity style={styles.option} onPress={handleEmailPress}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Ionicons name="mail-outline" size={24} color={palette.primary} />
                <Text style={styles.optionText}>Send an Email</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.surface,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary,
    padding: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.surface,
    marginLeft: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: palette.danger,
    fontWeight: 'bold',
  },
});

export default ContactUsScreen;
