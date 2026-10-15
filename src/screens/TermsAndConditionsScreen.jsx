import palette from '../theme/colors';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";

const TermsAndConditionsScreen = ({ navigation }) => {

  return (
    <SafeAreaView style={styles.safeArea}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                  <Icon name="bars" size={scale(24)} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms and Conditions</Text>
              </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.updateText}>Last Updated: August 28, 2025</Text>

        <Text style={styles.heading}>1. Introduction and Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          Welcome to Amaraa Delivery ("the App"), a technology platform provided by [Your Company Name] ("Company," "we," "us," or "our"). This App provides a platform to connect independent delivery professionals ("Driver," "you," "your") with restaurants and other businesses ("Partners") to facilitate the pickup and delivery of orders to customers ("Customers"). By downloading, installing, accessing, or using the Amaraa Delivery App, you agree to be bound by these Terms and Conditions ("Terms") and our Privacy Policy. If you do not agree to these Terms, you must not use the App.
        </Text>

        <Text style={styles.heading}>2. Relationship of the Parties</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>IMPORTANT:</Text> You expressly acknowledge and agree that you are an <Text style={styles.bold}>INDEPENDENT CONTRACTOR</Text> and not an employee, agent, partner, or joint venturer of the Company. This Agreement does not create an employment relationship. As an independent contractor:
          {'\n\n'}- You have the right to control the manner and means by which you perform delivery services.
          {'\n'}- You are responsible for providing your own equipment, including your vehicle, smartphone, and any other necessary tools.
          {'\n'}- You are responsible for all costs associated with your business, including fuel, vehicle maintenance, insurance, and mobile data.
          {'\n'}- The Company will not provide you with any employee benefits, such as health insurance, paid time off, or workers' compensation.
          {'\n'}- You are solely responsible for paying all applicable income, social security, and other taxes arising from the compensation paid to you.
        </Text>

        <Text style={styles.heading}>3. Driver Requirements & Obligations</Text>
        <Text style={styles.paragraph}>
          To use the Amaraa Delivery App, you represent and warrant that you:
          {'\n\n'}- Are at least 18 years of age.
          {'\n'}- Hold a valid driver's license for the type of vehicle you operate.
          {'\n'}- Possess valid vehicle registration and a policy of motor vehicle liability insurance that meets or exceeds the minimum legal requirements.
          {'\n'}- Own a smartphone capable of running the App and have an active data plan.
          {'\n'}- Will successfully pass any background checks required by the Company.
          {'\n'}- Will maintain your vehicle in a safe, clean, and roadworthy condition.
          {'\n'}- Will conduct yourself professionally and courteously when interacting with Partners and Customers.
        </Text>

        <Text style={styles.heading}>4. Payments</Text>
        <Text style={styles.paragraph}>
          You will be paid a fare for each completed delivery. The fare structure will be communicated to you through the App. You will receive 100% of any tips given by the Customer. Earnings will be disbursed on a regular schedule to the bank account you provide. You agree that the Company may deduct a service fee from your earnings for your use of the platform.
        </Text>

        <Text style={styles.heading}>5. Limitation of Liability & Indemnification</Text>
        <Text style={styles.paragraph}>
          To the fullest extent permitted by law, the Company shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service. You agree to indemnify and hold harmless the Company from any claims, damages, or losses arising from your actions or your breach of these Terms.
        </Text>

        <Text style={styles.heading}>6. Termination</Text>
        <Text style={styles.paragraph}>
          You may terminate this Agreement at any time by ceasing to use the App. The Company may deactivate or terminate your account for any violation of these Terms, poor performance, or fraudulent behavior.
        </Text>

        <Text style={styles.heading}>7. General Provisions</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. Your continued use of the App after changes constitutes your acceptance. These Terms shall be governed by the laws of Andhra Pradesh. For questions, contact us at melocalndd@gmail.com.
        </Text>

        <View style={styles.placeholder} />
      </ScrollView>
{/* 
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>I Read and Accept</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: palette.text,
  },
  subtitle: {
    fontSize: 16,
    color: palette.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  updateText: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textSecondary,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.surface,
  },
  acceptButton: {
    backgroundColor: palette.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: palette.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholder: {
    height: 40, // Adds some space at the very bottom of the scroll view
  },
});

export default TermsAndConditionsScreen;