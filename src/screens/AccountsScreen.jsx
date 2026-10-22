import palette from '../theme/colors';
import {useCallback} from 'react';
import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../context/AuthContext';
import ApiService from '../services/apiservice';

const AccountsScreen = () => {
  const {user} = useContext(AuthContext);
  const navigation = useNavigation();
  const [adminPercentage] = React.useState(18);
  const [paymentSummary, setPaymentSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const adminFee =
    paymentSummary?.delivery_charges * 0.1 * (1 + adminPercentage / 100);
  const cashInHand = paymentSummary?.cod_amount;
  const onlineEarnings = paymentSummary?.delivery_charges;
  const finalPaymentAmount = onlineEarnings - cashInHand;

  const fetchReportingHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await ApiService.getReportingHistory(user?.id);
      if (response?.status !== 200 || (response?.data?.status && response.data.status !== 200)) throw new Error(response?.message || 'Failed to fetch accounts.');
      const summary = response?.data?.data?.[0];
      // Aggregate queries return a row of nulls even when no orders match.
      if (summary && Number(summary.total_orders) > 0) {
        const normalized = {...summary};
        ['total_amount', 'cod_amount', 'pay_online_amount', 'delivery_charges', 'total_deliveryboy_amount'].forEach(key => {
          if (normalized[key] != null) normalized[key] = Number(normalized[key]);
        });
        setPaymentSummary(normalized);
      } else setPaymentSummary({});
    } catch (error) {
      console.error('Error fetching reporting history:', error);

      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReportingHistory();
  }, [fetchReportingHistory]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReportingHistory();
    });
    return unsubscribe;
  }, [navigation, fetchReportingHistory]);


  const handleRefresh = () => {
    setRefreshing(true);
    fetchReportingHistory();
  };

  // console.log(object);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={30} color={palette.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accounts</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load data. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchReportingHistory}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !paymentSummary || Object.keys(paymentSummary).length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={60}
            color={palette.border}
          />
          <Text style={styles.emptyText}>
            No completed orders awaiting payment. Your reporting period will appear after your first completed delivery.
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[palette.primary]}
              tintColor={palette.primary}
            />
          }>
            
          <View style={styles.dateRangeContainer}>
            <MaterialCommunityIcons
              name="calendar-month"
              size={24}
              color={palette.primary}
            />
            <View style={styles.dateRangeContent}>
              <Text style={styles.dateRangeLabel}>Reporting Period</Text>
              <Text style={styles.dateRangeText}>
                {paymentSummary?.date_range?.replace(' - ', ' to ') || 'Dates unavailable'}
              </Text>
            </View>
          </View>
          <View style={styles.cardShadow}>

          <View style={styles.consolidatedContainer}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Payment Summary</Text>
              <View style={styles.summaryTotal}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Orders:</Text>
                  <Text style={styles.totalValue}>
                    {paymentSummary?.total_orders || 0}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalValue}>
                    ₹{paymentSummary?.total_amount?.toFixed(0) || 0}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              {/* Cash in Hand */}
              {/* <View style={styles.paymentRow}>
                <MaterialCommunityIcons name="wallet" size={20} color="#4CAF50" />
                <Text style={styles.methodText}>Cash in Hand</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.detailText}>-</Text>
                  <Text style={[styles.detailText, { color: '#3236FF' }]}>
                    ₹{paymentSummary.cod_amount}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} /> */}

              {/* COD Payments */}
              <View style={styles.paymentRow}>
                <MaterialCommunityIcons name="cash" size={20} color={palette.success} />
                <Text style={styles.methodText}>COD Orders</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.detailText}>
                    {paymentSummary?.cod_count} orders
                  </Text>
                  <Text style={styles.detailText}>
                    ₹{paymentSummary?.cod_amount?.toFixed(0)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.paymentRow}>
                <MaterialCommunityIcons
                  name="credit-card"
                  size={20}
                  color={palette.primary}
                />
                <Text style={styles.methodText}>Online Orders</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.detailText}>
                    {paymentSummary?.pay_online_count} orders
                  </Text>
                  <Text style={styles.detailText}>
                    ₹{paymentSummary?.pay_online_amount?.toFixed(0)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.paymentRow}>
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={20}
                  color={palette.warning}
                />
                <Text style={styles.methodText}>Amount Per Order</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.detailText}>
                    {paymentSummary.total_orders} orders
                  </Text>
                  <Text style={styles.detailText}>
                    ₹{paymentSummary?.deliveryboy_order_amount}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Admin Fee */}
              {/* <View style={styles.paymentRow}>
                <MaterialCommunityIcons name="account-cog" size={20} color="#E91E63" />
                <Text style={styles.methodText}>Admin Fee (10% + {adminPercentage}% GST)</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.detailText}>₹{adminFee?.toFixed(2)}</Text>
                </View>
              </View> */}

              <View style={styles.divider} />

              {/* Final Delivery Charges */}
              {/* <View style={styles.paymentRow}>
                <MaterialCommunityIcons name="truck-check" size={20} color="#4CAF50" />
                <Text style={styles.methodText}>Final Delivery Charges</Text>
                <View style={styles.paymentDetails}>
                  <Text style={[styles.detailText, { color: '#999', textDecorationLine: 'line-through' }]}>
                    ₹{paymentSummary.delivery_charges}
                  </Text>
                  <Text style={[styles.detailText, { color: '#3236FF', marginLeft: 8 }]}>
                    ₹{(paymentSummary.delivery_charges - (0)).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} /> */}

              <View style={styles.paymentRow}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={20}
                  color={palette.success}
                />
                <Text style={styles.methodText}>Cash in Hand</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.detailText}>
                    {paymentSummary.cod_count} orders
                  </Text>
                  <Text style={[styles.detailText, {color: palette.primary}]}>
                    ₹{paymentSummary.cod_amount?.toFixed(0)}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />

              <View style={[styles.paymentRow, styles.finalPayment]}>
                <Text style={[styles.methodText, {fontWeight: 'bold'}]}>
                  Net Pay
                </Text>
                <View style={styles.paymentDetails}>
                  <Text
                    style={[
                      styles.detailText,
                      styles.finalAmount,
                      {color: paymentSummary?.total_deliveryboy_amount >= 0 ? palette.primary : palette.danger},
                    ]}>
                    ₹ {paymentSummary?.total_deliveryboy_amount >= 0 ? '+' : '-'}
                    {paymentSummary?.total_deliveryboy_amount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          </View>

        </ScrollView>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary,
    padding: 15,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.surface,
    marginLeft: 15,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    padding: 12,
    borderRadius: 8,
    width: '48%',
    justifyContent: 'space-between',
    elevation: 2,
  },
  timeText: {
    color: palette.text,
    fontSize: 14,
  },
  highlightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  highlightCard: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  highlightValue: {
    fontSize: 28,
    color: palette.surface,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  highlightLabel: {
    color: palette.surface,
    fontSize: 18,
    marginBottom: 4,
    fontWeight: '700',
  },
  highlightSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    elevation: 3,
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: palette.textSecondary,
    textAlign: 'center',
    fontSize: 12,
  },
  feeNote: {
    color: palette.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: palette.text,
    paddingHorizontal: 15,
  },
  statsHorizontalContainer: {
    paddingBottom: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statSmallCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: 160,
    alignItems: 'center',
    marginRight: 10,
    elevation: 3,
  },
  listContainer: {
    padding: 15,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  listMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  listSubText: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  listLabel: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  listValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  totalItem: {
    backgroundColor: palette.primary,
    paddingVertical: 20,
  },
  totalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalAmount: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  cardShadow: {
  borderRadius: 12,
  backgroundColor: palette.surface, // required for Android shadow
  marginHorizontal: 15,
  marginBottom: 15,
  // iOS shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  // Android elevation
  elevation: 5,
},
  consolidatedContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
  overflow: 'hidden', // ✅ hides the harsh corner shadows

    
  },

  
  summaryHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 12,
  },
  summaryTotal: {
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: palette.textSecondary,
    fontSize: 17,
    fontWeight: '700',
  },
  totalValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '500',
  },
  paymentMethods: {
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  methodText: {
    flex: 1,
    color: palette.textSecondary,
    fontSize: 14,
  },
  paymentDetails: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  detailText: {
    color: palette.text,
    fontSize: 14,
    minWidth: 80,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: palette.background,
    marginVertical: 8,
  },
  finalPayment: {
    backgroundColor: palette.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  finalAmount: {
    fontWeight: '600',
    fontSize: 16,
  },
  settleButton: {
    backgroundColor: palette.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  settleButtonText: {
    color: palette.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: palette.danger,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    elevation: 4,
  },
  dateRangeContent: {
    marginLeft: 12,
  },
  dateRangeLabel: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateRangeText: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    backgroundColor: palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

AccountsScreen.options = ({navigation}) => ({
  headerLeft: props => (
    <HeaderBackButton
      {...props}
      onPress={() => navigation.goBack()}
      tintColor="#000"
    />
  ),
});

export default AccountsScreen;
