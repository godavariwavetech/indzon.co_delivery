import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/apiservice';

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
  const [fromDate, setFromDate] = useState(new Date().toLocaleDateString("en-GB").split("/").join("-"));
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-GB").split("/").join("-"));  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both From Date and To Date.');
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.getPayments({ from_date: fromDate, to_date: toDate });
      setPayments(response || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
    setLoading(false);
  };

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
          <ActivityIndicator size="large" color="#85360B" style={{ marginTop: 20 }} />
        ) : payments.length === 0 ? (
          <Text style={styles.noPaymentsText}>No Payments Found</Text>
        ) : (
          <FlatList
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
    backgroundColor: '#85360B',
    padding: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
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
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#85360B',
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
    backgroundColor: '#e0ffe0',
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
