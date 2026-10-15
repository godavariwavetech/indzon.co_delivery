import palette from '../theme/colors';
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const TermsModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Terms and Conditions</Text>
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.updateText}>Last Updated: August 28, 2025</Text>

            <Text style={styles.heading}>1. Introduction and Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              Welcome to Amaraa Delivery ("the App"), a technology platform provided by [Your Company Name] ("Company," "we," "us," or "our"). By using the App, you agree to be bound by these Terms and Conditions.
            </Text>

            <Text style={styles.heading}>2. Relationship of the Parties</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>IMPORTANT:</Text> You acknowledge that you are an <Text style={styles.bold}>INDEPENDENT CONTRACTOR</Text> and not an employee of the Company. You are responsible for your own vehicle, insurance, and taxes. This Agreement does not create an employment relationship.
            </Text>

            <Text style={styles.heading}>3. Driver Requirements & Obligations</Text>
            <Text style={styles.paragraph}>
              You represent that you are at least 18 years of age, hold a valid driver's license, possess valid vehicle insurance, and will pass any required background checks. You agree to maintain your vehicle in a safe condition and conduct yourself professionally.
            </Text>

            <Text style={styles.heading}>4. Payments</Text>
            <Text style={styles.paragraph}>
              You will be paid a fare for each completed delivery, plus 100% of any customer tips. The Company may deduct a service fee, which will be communicated to you via the App.
            </Text>

            <Text style={styles.heading}>5. Limitation of Liability & Indemnification</Text>
            <Text style={styles.paragraph}>
              To the fullest extent permitted by law, the Company shall not be liable for any damages resulting from your use of the service. You agree to indemnify the Company from any claims arising from your actions.
            </Text>

             <Text style={styles.heading}>6. Termination</Text>
            <Text style={styles.paragraph}>
                You may terminate this Agreement by ceasing to use the App. The Company may deactivate your account for any violation of these Terms, poor performance, or fraudulent behavior.
            </Text>

          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: moderateScale(15),
    padding: moderateScale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    marginBottom: verticalScale(15),
    color: palette.text,
  },
  modalScrollView: {
    width: '100%',
    marginBottom: verticalScale(15),
  },
  contentContainer: {
    paddingBottom: 10,
  },
  updateText: {
    fontSize: scale(12),
    color: palette.textSecondary,
    marginBottom: verticalScale(15),
    fontStyle: 'italic',
    textAlign: 'center',
  },
  heading: {
    fontSize: scale(16),
    fontWeight: '700',
    color: palette.text,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(5),
  },
  paragraph: {
    fontSize: scale(14),
    lineHeight: verticalScale(20),
    color: palette.textSecondary,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: palette.primary,
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(30),
    elevation: 2,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: scale(14),
  },
});

export default TermsModal;