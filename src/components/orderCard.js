import React, { useState }  from 'react';
import { View, Text, StyleSheet, TouchableOpacity ,Modal } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Separator from './Separator';

// The component now accepts onPress and onAccept props
const OrderCard = ({ order, onPress, onAccept }) => {
    const [showConfirm, setShowConfirm] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
     if (isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  
  const handleAcceptPress = () => {
    setShowConfirm(true);
  };

  const confirmAccept = () => {
    setShowConfirm(false);
    if (onAccept) onAccept();
  };

  return (
    // The whole card is wrapped in a TouchableOpacity for navigation
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View>
        {/* Order Header - ID, Total, and Time */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}># {order.order_ids}</Text>
          <Text style={styles.grandTotal}>₹{order.grand_total}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.timeText}>{order?.order_date} {order?.order_time}</Text>
        </View>

        <Separator />

        {/* Shop and Delivery Address */}
        <View style={styles.addressSection}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="store-alt" size={15} color="#E53935" />
            <Text style={styles.infoText} numberOfLines={1}>{order.shop_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome5 name="location-arrow" size={15} color="#85360B" />
            <Text style={styles.infoText} numberOfLines={2}>
              {order.delivery_address}
            </Text>
          </View>
        </View>

        {/* Driver's Earnings */}
        {order.delivery_charges && (
          <>
            <Separator />
            <View style={styles.earningContainer}>
              <Text style={styles.earningLabel}>Your Earnings</Text>
              <Text style={styles.earningValue}>
                ₹{order.delivery_charges}
              </Text>
            </View>
          </>
        )}

        {/* --- MODIFICATION START: Accept Button for New Orders --- */}
        {order.order_status === 1 && (
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptPress}>
            <Text style={styles.acceptButtonText}>Accept Order</Text>
          </TouchableOpacity>
        )}
        {/* --- MODIFICATION END --- */}
      </View>
       {/* ✅ Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Accept this order?</Text>
            <Text style={styles.modalMessage}>
              Once accepted, this order will be assigned to you.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={confirmAccept}>
                <Text style={styles.confirmText}>Yes, Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12, // Reduced padding
    marginVertical: 6, // Reduced vertical margin
    marginHorizontal: 4, // Added horizontal margin for shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, // Reduced shadow radius
    elevation: 4,
    borderWidth: 0.5,
  borderColor: 'rgba(0,0,0,0.05)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
  },
  addressSection: {
    marginVertical: 8, // Reduced margin
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4, // Reduced margin
  },
  infoText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    color: '#333',
  },
  earningContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
  },
  earningLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  // --- STYLES FOR ACCEPT BUTTON ---
  acceptButton: {
    backgroundColor: '#27ae60', // Green color for accept
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

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
  modalTitle: {
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
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrderCard;