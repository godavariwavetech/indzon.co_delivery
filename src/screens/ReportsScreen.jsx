import {useFocusEffect} from '@react-navigation/native';
import palette from '../theme/colors';
import {useCallback} from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import ApiService from '../services/apiservice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons  from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReportsScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];
      const response = await ApiService.getReports(user?.id, formattedStart, formattedEnd);
      if (response?.status !== 200) throw new Error(response?.message || 'Failed to fetch reports.');
      setReports(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, user?.id]);

  useFocusEffect(useCallback(() => { fetchReports(); }, [fetchReports]));


  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatDateRange = (dateString) => {
    if (!dateString) return 'N/A';
    
    const [start, end] = dateString.split(' - ');
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    
    try {
      const startDate = new Date(start).toLocaleDateString('en-IN', options);
      const endDate = new Date(end).toLocaleDateString('en-IN', options);
      return `${startDate} - ${endDate}`;
    } catch {
      return dateString.replace(' - ', ' to ');
    }
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <MaterialCommunityIcons name="calendar-range" size={20} color={palette.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.paymentDate}>
            {formatDate(item.payment_dates.split(' - ')[0])} - {formatDate(item.payment_dates.split(' - ')[1])}
          </Text>
          <Text style={styles.subText}>
            Processed on: {formatDate(item.payment_date_time)}
          </Text>
        </View>
        {/* <View style={[styles.statusIndicator, 
          { backgroundColor: item.d_in === 0 ? '#FFA726' : '#3236FF' }]}>
          <Text style={styles.statusText}>
            {item.d_in === 0 ? 'Pending' : 'Completed'}
          </Text>
        </View> */}
      </View>

      <View style={styles.reportDetails}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Orders</Text>
            <Text style={styles.detailValue}>{item.total_orders}</Text>
          </View>
          {/* <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order IDs</Text>
            <View style={styles.orderIdsContainer}>
              {JSON.parse(item.order_ids.replace(/"/g, '')).map((id) => (
                <Text key={id} style={styles.orderId}>#{id}</Text>
              ))}
            </View>
          </View> */}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Per Order</Text>
            <Text style={styles.detailValue}>{item.amount_per_order}</Text>
          </View>


          
        </View>

        {/* Payment Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>COD Orders</Text>
            <Text style={styles.detailValue}>{item.cod_orders}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>COD Amount</Text>
            <Text style={styles.detailValue}>₹{item.cod_amount}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Online Orders</Text>
            <Text style={styles.detailValue}>{item.payonline_orders}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Online Amount</Text>
            <Text style={styles.detailValue}>₹{item.payonline_amount}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.section}>
          {/* <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { fontSize: 16 }]}>Total Amount</Text>
            <Text style={[styles.detailValue, { fontSize: 16 }]}>₹{item.total_amount}</Text>
          </View> */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: palette.primary }]}>Net Payment</Text>
            <Text style={[styles.detailValue, { color: palette.primary, fontWeight: '700' }]}>
              ₹{item.total_payment_amount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={30} color={palette.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.dateInputContainer}>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(startDate)}
            </Text>
            <MaterialCommunityIcons name="calendar" size={20} color={palette.textSecondary} />
          </TouchableOpacity>
          
          <Text style={styles.dateSeparator}>to</Text>
          
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(endDate)}
            </Text>
            <MaterialCommunityIcons name="calendar" size={20} color={palette.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={fetchReports}
        >
          <Text style={styles.filterButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load reports. Please try again.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchReports}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[palette.primary]}
              tintColor={palette.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={60} color={palette.border} />
              <Text style={styles.emptyText}>No reports available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginLeft: 12,
  },
  statusIndicator: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  reportDetails: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  viewButtonText: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
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
  errorText: {
    color: palette.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
  listContent: {
    paddingVertical: 16,
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
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    color: palette.text,
    fontSize: 14,
  },
  dateSeparator: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: palette.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
  },
  section: {
    marginVertical: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  sectionTitle: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  orderIdsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  orderId: {
    backgroundColor: palette.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: palette.surface,
    fontSize: 12,
  },
});

export default ReportsScreen; 