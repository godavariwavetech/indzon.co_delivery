import palette from '../theme/colors';
import React, { useState }  from 'react';
import { View, Text, StyleSheet, TouchableOpacity ,Modal } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Separator from './Separator';

// The component now accepts onPress and onAccept props
const OrderCard = ({ order, onPress, onAccept }) => {
    const [submitting, setSubmitting] = useState(false);
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

  const confirmAccept = async () => {
    if (submitting) return;
    setShowConfirm(false);
    setSubmitting(true);
    try { await onAccept?.(); } finally { setSubmitting(false); }
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
          <Ionicons name="time-outline" size={16} color={palette.textSecondary} />
          <Text style={styles.timeText}>{order?.order_date} {order?.order_time}</Text>
        </View>

        <Separator />

        {/* Shop and Delivery Address */}
        <View style={styles.addressSection}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="store-alt" size={15} color={palette.primary} />
            <Text style={styles.infoText} numberOfLines={1}>{order.shop_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome5 name="location-arrow" size={15} color={palette.primary} />
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
          <TouchableOpacity style={styles.acceptButton} disabled={submitting} onPress={handleAcceptPress}>
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
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 12, // Reduced padding
    marginVertical: 6, // Reduced vertical margin
    marginHorizontal: 4, // Added horizontal margin for shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, // Reduced shadow radius
    elevation: 2,
    borderWidth: 1,
    borderColor: palette.border,
  },
  orderHeader: {
    alignItems: 'stretch',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: palette.text,
  },
  grandTotal: {
    marginTop: 6,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: 'bold',
    color: palette.text,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: palette.textSecondary,
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
    color: palette.text,
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
    color: palette.text,
    fontWeight: '500',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.success,
  },
  // --- STYLES FOR ACCEPT BUTTON ---
  acceptButton: {
    backgroundColor: palette.success, // Green color for accept
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  acceptButtonText: {
    color: palette.surface,
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
    backgroundColor: palette.surface,
    width: '80%',
    borderRadius: 12,
    padding: 25,
    elevation: 6,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: palette.textSecondary,
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
    backgroundColor: palette.border,
  },
  confirmBtn: {
    backgroundColor: palette.success,
  },
  cancelText: {
    color: palette.text,
    fontWeight: 'bold',
  },
  confirmText: {
    color: palette.surface,
    fontWeight: 'bold',
  },
});

export default OrderCard;
