import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  Linking,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {moderateScale} from 'react-native-size-matters';
import ApiService from '../services/apiservice';
import {AuthContext} from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

// --- UI Theme & Colors ---
const theme = {
  colors: {
    primary: '#85360B', // Gold
    background: '#F8F9FA',
    card: '#FFFFFF',
    textPrimary: '#2C3E50', // Dark Slate Blue
    textSecondary: '#7F8C8D', // Greyish Blue
    border: '#EAEAEA',
    success: '#2ECC71',
    lightBlue: '#3498DB',
  },
  spacing: {
    m: moderateScale(16),
    s: moderateScale(8),
  },
  typography: {
    title: moderateScale(20),
    header: moderateScale(18),
    body: moderateScale(14),
    caption: moderateScale(12),
  },
};

const formatDate = dateString => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

// --- Main Component ---
const OrderTrackingScreen = ({route}) => {
  const {orderDetails} = route.params;
  const {user} = useContext(AuthContext);
  const navigation = useNavigation();

  const [orderStatus, setOrderStatus] = useState(orderDetails.order_status);
  const [orderItems, setOrderItems] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const otpInputs = useRef([]);

  const insets = useSafeAreaInsets()

  useEffect(() => {
    fetchOrders();
  }, []);

  console.log(orderDetails, '>>>>>>>>>>>>>>>>>>>VVVV');

  const fetchOrders = async () => {
    try {
      const response = await ApiService.getOrderDetails(
        orderDetails.id || orderDetails.order_id,
      );
      if (response?.status === 200) {
        setOrderItems(response.data);
      } else {
        Alert.alert(
          'Error',
          response?.message || 'Failed to load order items.',
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const openGoogleMaps = (lat, lng) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = `${scheme}0,0?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  const makePhoneCall = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // --- API Handlers ---
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpInputs.current[index + 1].focus();
  };

  const handleOtpSubmit = () => {
    const enteredOtp = otp.join('');
    // OTP is now only for the customer
    const targetOtp = orderDetails.customer_otp;

    if (enteredOtp.length === 4 && enteredOtp === targetOtp) {
      completedOrder();
      setOtp(['', '', '', '']);
    } else {
      Alert.alert('Error', 'The entered OTP is incorrect.');
    }
  };

  const accepteSubmmited = () => {
    setShowConfirmModal(true);
  };

  const confirmAcceptOrder = async () => {
    const payload = {
      deliveryarr: [user],
      id: user.id,
      order_status: 8,
      order_id: orderDetails.order_id,
    };

    try {
      const response = await ApiService.acceptorders(payload);
      if (response?.status === 200) {
        setOrderStatus(8);
        route.params.handleAccept(orderDetails.order_id);
        Alert.alert('Success', 'Order accepted successfully.');
      } else {
        Alert.alert('Error', response?.message || 'Failed to accept order.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setShowConfirmModal(false);
    }
  };

  const submitVendorReceived = async () => {
    const payload = {
      id: orderDetails.order_id,
      customer_id: orderDetails?.customer_id,
    };
    try {
      const response = await ApiService.vendorReceived(payload);
      if (response?.status === 200) {
        setOrderStatus(2);
        setShowOtpModal(false);
      } else {
        Alert.alert('Error', response?.message || 'Failed to update status.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const completedOrder = async () => {
    const payload = {
      order_id: orderDetails.order_id,
      delivery_id: user.id,
      delivery_otp: otp.join(''),
      customer_id: orderDetails?.customer_id,
    };
    try {
      const response = await ApiService.completedorder(payload);
      if (response?.status === 200) {
        setOrderStatus(3);
        setShowOtpModal(false);
        // Delay navigation to allow user to see completed status
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        Alert.alert('Error', response?.message || 'Failed to complete order.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const handleCompletePress = () => {
    setShowOtpModal(true);
  };

  const handlePickup = () => {
    Alert.alert(
      'Confirm Pickup',
      'Are you sure you have picked up the order from the vendor?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: submitVendorReceived},
      ],
    );
  };

  // --- Helper Components ---
  const InfoCard = ({title, icon, children}) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Icon
          name={icon}
          size={moderateScale(20)}
          color={theme.colors.primary}
        />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );

  const DetailRow = ({icon, label, value, onCall, onMap, mapHint}) => (
    <TouchableOpacity
      style={styles.detailRow}
      onPress={onCall || onMap}
      disabled={!onCall && !onMap}>
      <Icon
        name={icon}
        size={moderateScale(18)}
        color={theme.colors.textSecondary}
        style={styles.detailIcon}
      />
      <View style={{flex: 1}}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
        {mapHint && (
          <Text style={styles.mapIndicationText}>(Tap to navigate)</Text>
        )}
      </View>
      {(onCall || onMap) && (
        <Icon
          name="chevron-forward-outline"
          size={moderateScale(18)}
          color={theme.colors.primary}
        />
      )}
    </TouchableOpacity>
  );

  const ProgressTracker = () => {
    const isAccepted =
      orderStatus === 8 || orderStatus === 2 || orderStatus === 3;
    const isDelivered = orderStatus === 3;

    return (

      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <Icon
            name="checkmark-circle"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.progressLabel, {color: theme.colors.primary}]}>
            New Order
          </Text>
        </View>
        <View
          style={[styles.progressLine, isAccepted && styles.progressLineActive]}
        />
        <View style={styles.progressStep}>
          <Icon
            name="bicycle"
            size={24}
            color={isAccepted ? theme.colors.primary : theme.colors.border}
          />
          <Text
            style={[
              styles.progressLabel,
              isAccepted && {color: theme.colors.primary},
            ]}>
            Accepted
          </Text>
        </View>
        <View
          style={[
            styles.progressLine,
            isDelivered && styles.progressLineActive,
          ]}
        />
        <View style={styles.progressStep}>
          <Icon
            name="location-sharp"
            size={24}
            color={isDelivered ? theme.colors.primary : theme.colors.border}
          />
          <Text
            style={[
              styles.progressLabel,
              isDelivered && {color: theme.colors.primary},
            ]}>
            Delivered
          </Text>
        </View>
      </View>
    );
  };

  const getAction = () => {
    switch (orderStatus) {
      case 1:
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={accepteSubmmited}>
            <Text style={styles.actionButtonText}>Accept Order</Text>
          </TouchableOpacity>
        );
      case 8:
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.vendorButton]}
            onPress={handlePickup}>
            <Text style={styles.actionButtonText}>Pickup Order</Text>
          </TouchableOpacity>
        );
      case 2:
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleOtpSubmit}>
            <Text style={styles.actionButtonText}>Deliver Order</Text>
          </TouchableOpacity>
        );
      case 3:
        return (
          <View style={[styles.actionButton, styles.successMessage]}>
            <Icon
              name="checkmark-circle-outline"
              size={20}
              color={theme.colors.success}
            />
            <Text style={styles.successMessageText}>
              Order Completed Successfully
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (!orderDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  // --- Render ---
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Order Info Header --- */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order ID: {orderDetails.order_ids}</Text>
          <Text style={styles.orderDate}>
            {orderDetails?.order_date} at {orderDetails?.order_time}
          </Text>
        </View>

        <ProgressTracker />

        {/* --- Payment & Earnings Card --- */}
        <InfoCard title="Payment & Earnings" icon="wallet-outline">
          {/* MODIFICATION START: Added "&& orderStatus !== 3" to hide on completed orders */}
          {orderDetails.payment_type === 'COD' && orderStatus !== 3 && (
            <View style={styles.highlightedEarning}>
              <Text style={styles.highlightedEarningLabel}>
                Amount to Collect
              </Text>
              <Text style={styles.highlightedEarningValue}>
                ₹{orderDetails.grand_total || orderDetails.total_amount}
              </Text>
            </View>
          )}
          {/* MODIFICATION END */}

          <DetailRow
            icon="card-outline"
            label="Payment Mode"
            value={orderDetails.payment_type || 'N/A'}
          />
          <DetailRow
            icon="cash-outline"
            label="Your Earnings"
            value={`₹${orderDetails.delivery_charges || '0.00'}`}
          />
          <DetailRow
            icon="receipt-outline"
            label="Order Grand Total"
            value={`₹${orderDetails.grand_total || orderDetails.total_amount}`}
          />
        </InfoCard>

        {/* --- Restaurant & Customer Details (Hidden on completion) --- */}
        {orderStatus !== 3 && (
          <>
            <InfoCard title="Customer Details" icon="person-outline">
              {orderDetails.customer_name && (
                <DetailRow
                  icon="person-circle-outline"
                  label="Name"
                  value={orderDetails.customer_name}
                />
              )}
              <DetailRow
                icon="call-outline"
                label="Phone"
                value={orderDetails.customer_mobile_number}
                onCall={() =>
                  makePhoneCall(orderDetails.customer_mobile_number)
                }
              />
              <DetailRow
                icon="map-outline"
                label="Address"
                value={orderDetails.delivery_address}
                onMap={() =>
                  openGoogleMaps(
                    orderDetails.order_latitude,
                    orderDetails.order_longitude,
                  )
                }
                mapHint={true}
              />
            </InfoCard>

            <InfoCard title="Restaurant Details" icon="storefront-outline">
              <DetailRow
                icon="business-outline"
                label="Name"
                value={orderDetails.shop_name}
              />
              <DetailRow
                icon="call-outline"
                label="Phone"
                value={
                  orderDetails.shop_phone_number ||
                  orderDetails.franchise_mobile_number
                }
                onCall={() =>
                  makePhoneCall(
                    orderDetails.shop_phone_number ||
                      orderDetails.franchise_mobile_number,
                  )
                }
              />
              <DetailRow
                icon="location-outline"
                label="Address"
                value={orderDetails.shop_address || 'Address not available'}
                onMap={() =>
                  openGoogleMaps(
                    orderDetails.shop_latitude,
                    orderDetails.shop_longitude,
                  )
                }
                mapHint={true}
              />
            </InfoCard>
          </>
        )}

        {/* --- Order Items --- */}
        <InfoCard title="Order Items" icon="fast-food-outline">
          {orderItems?.orderitemdata.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image source={{uri: item.item_image}} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemQty}>
                  Quantity: {item.sub_item_count}
                </Text>
              </View>
            </View>
          ))}
        </InfoCard>
      </ScrollView>

      <View style={[styles.footer,{bottom:insets.bottom}]}>{getAction()}</View>

      {/* --- OTP Modal --- */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowOtpModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Enter OTP</Text>
                <Text style={styles.modalSubtitle}>
                  Please enter the OTP from the customer to complete the
                  delivery.
                </Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={value => handleOtpChange(index, value)}
                      maxLength={1}
                      keyboardType="numeric"
                      ref={ref => (otpInputs.current[index] = ref)}
                      onKeyPress={({nativeEvent}) => {
                        if (
                          nativeEvent.key === 'Backspace' &&
                          !digit &&
                          index > 0
                        ) {
                          otpInputs.current[index - 1].focus();
                        }
                      }}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  onPress={handleOtpSubmit}
                  style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- Confirmation Modal --- */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle2}>Accept this order?</Text>
            <Text style={styles.modalMessage}>
              Once accepted, this order will be assigned to you.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={confirmAcceptOrder}>
                <Text style={styles.confirmText}>Yes, Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
  },
  headerTitle: {
    marginLeft: theme.spacing.m,
    fontSize: theme.typography.title,
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    padding: theme.spacing.m,
    paddingBottom: hp(12),
  },
  orderHeader: {
    marginBottom: theme.spacing.m,
    alignItems: 'center',
  },
  orderId: {
    fontSize: theme.typography.header,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  orderDate: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  cardTitle: {
    fontSize: theme.typography.header,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.s,
  },
  cardContent: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  detailIcon: {
    marginRight: theme.spacing.m,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  mapIndicationText: {
    fontSize: theme.typography.caption,
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  highlightedEarning: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  highlightedEarningLabel: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
  },
  highlightedEarningValue: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
progressContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing.m,
  backgroundColor: '#fff', 
  borderRadius: 12,
  marginBottom: theme.spacing.m,
  elevation: 6,


},

  

  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressLabel: {
    marginTop: 4,
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
  },
  progressLineActive: {
    backgroundColor: theme.colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: theme.spacing.m,
    backgroundColor: theme.colors.border,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  itemQty: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    paddingVertical: hp(1.8),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  acceptButton: {backgroundColor: theme.colors.success},
  vendorButton: {backgroundColor: theme.colors.lightBlue},
  completeButton: {backgroundColor: theme.colors.primary},
  successMessage: {
    backgroundColor: '#F0FFF4', // Light green background
  },
  successMessageText: {
    color: theme.colors.success,
    fontSize: theme.typography.body,
    fontWeight: '700',
    marginLeft: theme.spacing.s,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: theme.spacing.m * 1.5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.typography.title,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
  },
  modalSubtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.m * 1.5,
  },
  otpInput: {
    width: width * 0.12,
    height: width * 0.12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: 'center',
    fontSize: moderateScale(18),
    marginHorizontal: width * 0.015,
    borderRadius: 10,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: theme.typography.body,
    fontWeight: 'bold',
  },

  // --- Confirmation Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 12,
    padding: 25,
    elevation: 6,
    alignItems: 'center',
  },
  modalTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  confirmBtn: {
    backgroundColor: '#27ae60',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default OrderTrackingScreen;
