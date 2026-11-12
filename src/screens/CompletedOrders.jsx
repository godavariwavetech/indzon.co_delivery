import palette from '../theme/colors';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, TextInput, ActivityIndicator,Alert,Linking,PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePickerModal, {parseDayMonthYear, formatDayMonthYear} from '../components/DatePickerModal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Separator from '../components/Separator';
import { AuthContext } from "../context/AuthContext";
import ApiService from '../services/apiservice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
// import Geolocation from '@react-native-community/geolocation';


const DatePickerField = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = selectedDate => {
    setShowPicker(false);
    onChange(formatDayMonthYear(selectedDate));
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
          pointerEvents="none"
        />
        < >
          <Ionicons name="calendar-outline" size={25} color="black" />
        </>
      </View>
      <DatePickerModal
        visible={showPicker}
        value={parseDayMonthYear(value)}
        onConfirm={handleConfirm}
        onCancel={() => setShowPicker(false)}
        maximumDate={new Date()}
      />
    </TouchableOpacity>
  );
};


const getPaymentIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'credit card':
    case 'debit card':
      return 'credit-card-outline';
    case 'upi':
      return 'qrcode-scan';
    case 'cash on delivery':
    case 'cod':
      return 'cash';
    case 'net banking':
      return 'bank-outline';
      case 'pay online':
      return 'cellphone';
    default:
      return 'help-circle-outline'; // Default unknown icon
  }
};

const CompletedOrdersScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [fromDate, setFromDate] = useState(new Date().toLocaleDateString("en-GB").split("/").join("-")); // Default to current date
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-GB").split("/").join("-")); // Default to current date
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driverLocation, setDriverLocation] = useState({ latitude: null, longitude: null });




  const fetchCompletedOrders = useCallback(async () => {
    setLoading(true);

    const formatDate = (dateString) => {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month}-${day}`; // Converts "01-03-2025" -> "2025-03-01"
    };
    const startDate = formatDate(fromDate);
    const endDate = formatDate(toDate);

    try {
      const response = await ApiService.completedorders({ f_date: startDate, t_date: endDate, emp_id: user.id });
      if (response.status === 200) {
        setCompletedOrders(response.data.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch completed orders.');
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch completed orders.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, user.id]);

  useEffect(() => {
    fetchCompletedOrders();
  }, [fetchCompletedOrders]);

  useFocusEffect(useCallback(() => { fetchCompletedOrders(); }, [fetchCompletedOrders]));

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="bars" size={25} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Orders</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.dateContainer}>
          <DatePickerField label="From Date" value={fromDate} onChange={setFromDate} />
          <DatePickerField label="To Date" value={toDate} onChange={setToDate} />
          <TouchableOpacity style={styles.searchButton} onPress={fetchCompletedOrders}>
            <Text style={styles.searchText}>Search</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} />
        ) : completedOrders.length === 0 ? (
          <Text style={styles.noOrdersText}>No orders found</Text>
        ) : (
          <FlatList
            refreshing={loading}
            onRefresh={fetchCompletedOrders}
            data={completedOrders}
            keyExtractor={(item,index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              // Parse the delivery_boy_array to extract delivery person details
              let deliveryBoy = [];
              try {
                deliveryBoy = JSON.parse(item.delivery_boy_array);
              } catch (e) {
                console.error("Error parsing delivery_boy_array", e);
              }

              return (
                <TouchableOpacity style={styles.card} onPress={() =>
                  navigation.navigate('Ordertracking', {
                    orderDetails: item,
                    // handleAccept,
                    // handleComplete,
                    driverLocation:driverLocation,
                    status:'afterComplete'  // this is for only to convert the dateformat
                  })
                }>
                  <View style={styles.rowBetween}>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text style={styles.dishCode}>
                          <MaterialCommunityIcons
                            name={getPaymentIcon(item.payment_type)}
                            size={20}
                            color="black"
                            style={{ marginRight: 8 }}
                          />
                          {item.payment_type}
                        </Text>
                        <Text style={styles.time}>Items: {item?.item_count}</Text>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.status,{color:'#000',fontWeight:'400'}]}>Order ID: {item.order_ids}</Text>
                      <Text style={styles.price}>₹{item?.grand_total}</Text>
                    </View>
                  </View>

                  <Separator />

                  <View style={styles.column}>
                    <View style={styles.row}>
                      <Ionicons name="location-outline" size={wp(6)} color={palette.primary} />
                      <Text style={styles.location}>{item.shop_name}</Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="location-arrow" size={wp(5)} color={palette.primary} />
                      <Text style={styles.location}>{item.delivery_address}</Text>
                    </View>
                  </View>

                  {/* {deliveryBoy.length > 0 && (
                    <>
                      <Separator />
                      <Text style={styles.deliveryBoyTitle}>Assigned Delivery Person:</Text>
                      {deliveryBoy.map((boy) => (
                        <View key={boy.id} style={styles.deliveryBoyContainer}>
                          <Icon name="user" size={18} color="black" />
                          <Text style={styles.deliveryBoyText}>{boy.delivery_boy_name} ({boy.delivery_boy_mobile_number})</Text>
                        </View>
                      ))}
                    </>
                  )} */}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(2),
    elevation: 4,
    backgroundColor: palette.primary
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: '600',
    marginLeft: wp(5),
    color: palette.surface
  },
  container: {
    flex: 1,
    padding: wp(4),
  },
  noOrdersText: {
    fontSize: wp(4.5),
    textAlign: 'center',
    marginTop: hp(5),
    color: 'gray',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: palette.surface,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,

  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  column: {
    flexDirection: "column",
  },
  dishCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.text,
    width: 100
  },
  time: {
    fontSize: 14,
    color: "gray",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    color: "blue",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.primary,
  },
  separator: {
    height: 1,
    backgroundColor: palette.disabled,
    marginVertical: 10,
  },
  location: {
    fontSize: 14,
    color: palette.textSecondary,
    marginLeft: 5,
  },
  deliveryBoyTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  deliveryBoyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  deliveryBoyText: {
    fontSize: 14,
    marginLeft: 5,
  },
  dateContainer: {
    marginBottom: hp(2),
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
    backgroundColor: palette.background,
    paddingHorizontal: 15,
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
  },
  searchText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CompletedOrdersScreen;

