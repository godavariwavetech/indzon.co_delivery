import React, {useState, useEffect, useContext, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  PermissionsAndroid,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';
import {scale} from 'react-native-size-matters';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import ApiService from '../services/apiservice';
import ToggleSwitch from '../components/ToggleSwitch';
import {AuthContext} from '../context/AuthContext';
import OrderCard from '../components/orderCard'; // Corrected import name
import {getTokenValue} from '../NotificationService';
import Geolocation from 'react-native-geolocation-service';

const OrdersScreen = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);

  const [newOrders, setNewOrders] = useState([]);
  const [ongoingOrders, setOngoingOrders] = useState([]);

  const [toggle, setToggle] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [deliveryBoylocationId, setDeliveryBoyLocationId] = useState(null);
  const [driverLocation, setDriverLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const uploadToken = async () => {
    const token = await getTokenValue();
    console.log(token,">>>>>>>>>>>")
    await ApiService.uploadFcmToken(
      token,
      user?.id,
      user?.delivery_boy_location_id,
    );
    setDeliveryBoyLocationId(user?.delivery_boy_location_id);
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs your location.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      let intervalId = null;
      const getLocation = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
          Alert.alert(
            'Location Permission Denied',
            'Please enable location permission in your settings.',
            [
              {text: 'Open Settings', onPress: () => Linking.openSettings()},
              {text: 'Cancel', style: 'cancel'},
            ],
          );
          return false;
        }
        return true;
      };
      const fetchLocation = () => {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setDriverLocation({latitude, longitude});
          },
          error =>
            console.log(
              '❌ Error getting location:',
              error.code,
              error.message,
            ),
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      };
      const startLocationTracking = async () => {
        if (toggle === 1) {
          const permissionGranted = await getLocation();
          if (!permissionGranted) return;
          fetchLocation();
          intervalId = setInterval(fetchLocation, 10000);
        }
      };
      startLocationTracking();
      return () => {
        if (intervalId !== null) clearInterval(intervalId);
      };
    }, [toggle, user, deliveryBoylocationId]),
  );

  // Function to sync toggle state with server
  const syncToggleWithServer = async () => {
    try {
      fetchOrders(true);
      const profileData = await ApiService.getProfileData(user);
      const serverStatus =
        profileData?.data?.data?.[0]?.delivery_boy_active_status;
      const newToggleState = serverStatus === 0 ? 1 : 0;

      console.log(
        'Orders - Server status:',
        serverStatus,
        'Current toggle:',
        toggle,
        'New toggle:',
        newToggleState,
      );

      if (newToggleState !== toggle) {
        console.log(
          'Orders - Updating toggle from server:',
          toggle,
          '->',
          newToggleState,
        );
        setToggle(newToggleState);
      }
    } catch (error) {
      console.error('Orders - Error syncing with server:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // Initial sync
    syncToggleWithServer();

    // Set up interval for polling every 2 seconds
    const intervalId = setInterval(syncToggleWithServer, 2000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id, toggle]);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      uploadToken();
    }
  }, [user]);

  console.log(orders, '>>>>>>>>>>>>>>>>>>>>>>>>>>orders');

  useEffect(() => {
    const ongoingOrders = orders?.filter(
      order => order.order_status === 2 || order.order_status === 8,
    );
    setAcceptedOrders(ongoingOrders);
  }, [orders]);

  const fetchOrders = useCallback(
    async (showLoad = false) => {
      try {
        !showLoad && setLoading(true);
        !showLoad && setRefreshing(true);

        const response = await ApiService.getOrders(user);
        if (response?.status === 200) {
          setOrders(response.data);

          const newOrdersData = response?.new_orders || [];
          const ongoingOrdersData = response?.active_orders || [];

          setNewOrders(newOrdersData);
          setOngoingOrders(ongoingOrdersData);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );


  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const handleAccept = async orderId => {
    // Optimistically update UI
    setOrders(prevOrders =>
      prevOrders?.map(order =>
        order.order_ids === orderId ? {...order, order_status: 8} : order,
      ),
    );
    // Call API to accept order in the background
    const payload = {
      deliveryarr: [user],
      id: user.id,
      order_status: 8,
      order_id: orderId,
    };

    // console.log(payload,"++++++++++++++++++++>>>>>>>>PAUAYAYAYA");
    // return

    try {
      await ApiService.acceptorders(payload);
    } catch (error) {
      // Revert UI change on API failure
      Alert.alert('Error', 'Failed to accept the order. Please try again.');
      setOrders(prevOrders =>
        prevOrders?.map(order =>
          order.order_ids === orderId ? {...order, order_status: 1} : order,
        ),
      );
    }
  };

  const handleComplete = orderId => {
    setOrders(prevOrders =>
      prevOrders?.filter(order => order.order_ids !== orderId),
    );
    fetchOrders();
  };

  const handleCardPress = item => {
    if (item.order_status === 1 && acceptedOrders?.length >= 3) {
      Alert.alert(
        'Order Limit Reached',
        'You can only have 3 ongoing orders. Please complete one to accept a new one.',
      );
      return;
    }
    navigation.navigate('Ordertracking', {
      orderDetails: item,
      handleAccept: () =>
        handleAccept(item.id || item.order_id || item.order_ids),
      handleComplete,
      driverLocation: driverLocation,
    });
  };

  // const filteredOrders = orders?.filter(order =>
  //   activeTab === 'new'
  //     ? order.order_status === 1
  //     : order.order_status === 2 || order.order_status === 8,
  // );

  const filteredOrders = activeTab === 'new' ? newOrders : ongoingOrders;

  return (
    <>
      <StatusBar backgroundColor="#85360B" barStyle="light-content" />
      <View style={styles.header}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="bars" size={scale(24)} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {user?.delivery_boy_name
              ? user?.delivery_boy_name.charAt(0).toUpperCase() +
                user.delivery_boy_name.slice(1)
              : 'Welcome'}
          </Text>
        </View>
        {
        // acceptedOrders?.length === 0 && 
        (
          <ToggleSwitch toggle={toggle} setToggle={setToggle} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{flex: 1, backgroundColor: '#F8F9FA'}}>
        <View style={{backgroundColor: '#F8F9FA', flex: 1}}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'new' ? styles.activeTab : null,
              ]}
              onPress={() => setActiveTab('new')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'new' ? styles.activeTabText : null,
                ]}>
                New Orders({newOrders?.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'accepted' ? styles.activeTab : null,
              ]}
              onPress={() => setActiveTab('accepted')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'accepted' ? styles.activeTabText : null,
                ]}>
                Ongoing Orders ({ongoingOrders?.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            {toggle === 0 && acceptedOrders?.length === 0 ? (
              <View style={styles.offlineContainer}>
                <Icon name="wifi" size={scale(50)} color="gray" />
                <Text style={styles.offlineText}>You are offline</Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={{flexGrow: 1}}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchOrders}
                  />
                }>
                {filteredOrders?.length === 0 && !loading ? (
                  <View style={styles.noOrdersContainer}>
                    <Icon name="inbox" size={scale(50)} color="gray" />
                    <Text style={styles.noOrdersText}>No Orders Available</Text>
                  </View>
                ) : (
                  // --- MODIFICATION START: Pass props to OrderCard ---
                  filteredOrders?.map(item => (
                    <OrderCard
                      key={item.order_ids}
                      order={item}
                      onPress={() => handleCardPress(item)}
                      onAccept={() =>
                        handleAccept(item.id || item.order_id || item.order_ids)
                      }
                    />
                  ))
                  // --- MODIFICATION END ---
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: wp(2), backgroundColor: '#f8f9fa'}, // Adjusted padding
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: wp(3),
    backgroundColor: '#85360B',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    marginLeft: wp(3),
    color: 'white',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(70),
  },
  offlineText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: 'gray',
    marginTop: verticalScale(10),
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(70),
  },
  noOrdersText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: 'gray',
    marginTop: verticalScale(10),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp(1),
    backgroundColor: '#fff',
    borderRadius: moderateScale(8),
    padding: moderateScale(4),
    marginHorizontal: wp(3),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
     borderWidth: 0.5,
  borderColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(6),
  },
  activeTab: {
    backgroundColor: '#85360B',
  },
  tabText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
});

export default OrdersScreen;
