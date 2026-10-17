import {useFocusEffect} from '@react-navigation/native';
import palette from '../theme/colors';
import {useCallback} from 'react';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import ApiService from '../services/apiservice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const DatePickerField = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate.toLocaleDateString("en-GB").split("/").join("-")); // Format: YYYY-MM-DD
    }
  };

  return (
    <TouchableOpacity style={styles.fieldContainer} onPress={() => setShowPicker(true)}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.dateInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="black"
          value={value}
          editable={false}
        />
        < >
          <Ionicons name="calendar-outline" size={25} color="black" />
        </>
      </View>
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()} // **Disable future dates**
        />
      )}
    </TouchableOpacity>
  );
};

const PaymentsScreen = () => {
  const navigation = useNavigation();
  const {user} = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [fromDate, setFromDate] = useState(new Date().toLocaleDateString("en-GB").split("/").join("-"));
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-GB").split("/").join("-"));  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!fromDate || !toDate) {
      alert('Please select both From Date and To Date.');
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.getPayments({ fromDate: fromDate.split('-').reverse().join('-'), toDate: toDate.split('-').reverse().join('-'), emp_id: user.id });
      if (response?.status && response.status !== 200) throw new Error(response.message || 'Failed to fetch payments.');
      const rows = Array.isArray(response) ? response : response?.data?.data || response?.data;
      setPayments(Array.isArray(rows) ? rows : []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch payments.');
      setPayments([]);
    }
    setLoading(false);
  }, [fromDate, toDate, user.id]);

  useFocusEffect(useCallback(() => { fetchPayments(); }, [fetchPayments]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="bars" size={25} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Payments</Text>
        <Ionicons name="time-outline" size={25} color="white" />
      </View>

      <View style={styles.content}>
        <DatePickerField label="From Date" value={fromDate} onChange={setFromDate} />
        <DatePickerField label="To Date" value={toDate} onChange={setToDate} />

        <TouchableOpacity style={styles.searchButton} onPress={fetchPayments}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 20 }} />
        ) : payments.length === 0 ? (
          <Text style={styles.noPaymentsText}>No Payments Found</Text>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={[styles.listContent, {paddingBottom: Math.max(insets.bottom, 16)}]}
            refreshing={loading}
            onRefresh={fetchPayments}
            data={payments}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.paymentItem}>
                <Text style={styles.paymentText}>Order ID: {item.order_id}</Text>
                <Text style={styles.paymentText}>Amount: ₹{item.amount}</Text>
                <Text style={styles.paymentText}>Date: {item.date}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.primary,
    padding: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.border,
    paddingHorizontal: 15,
    paddingVertical: 2,
    borderRadius: 5,
  },
  dateInput: {
    fontSize: 16,
    color: 'black',
    flex: 1,
  },
  searchButton: {
    backgroundColor: palette.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  searchText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  noPaymentsText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    marginTop: 20,
  },
  paymentItem: {
    backgroundColor: palette.successSoft,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 16,
    color: 'black',
  },
});

export default PaymentsScreen;
