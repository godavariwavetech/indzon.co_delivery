import palette from '../theme/colors';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
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


import {getTokenValue, onTokenRefresh} from '../NotificationService';
import Geolocation from 'react-native-geolocation-service';

const OrdersScreen = ({navigation}) => {
  const {user} = useContext(AuthContext);

  const [newOrders, setNewOrders] = useState([]);
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const acceptedOrders = ongoingOrders;
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const [toggle, setToggle] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [driverLocation, setDriverLocation] = useState({
    latitude: null,
    longitude: null,
  });


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
    return (await Geolocation.requestAuthorization('whenInUse')) === 'granted';
  };

  useFocusEffect(
    useCallback(() => {
      let intervalId = null;
      let focused = true;
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
          if (!permissionGranted || !focused) return;
          fetchLocation();
          intervalId = setInterval(fetchLocation, 10000);
        }
      };
      startLocationTracking();
      return () => {
        focused = false;
        if (intervalId !== null) clearInterval(intervalId);
      };
    }, [toggle]),
  );

  const fetchOrders = useCallback(
    async (showLoad = false) => {
      try {
        !showLoad && setLoading(true);
        !showLoad && setRefreshing(true);

        const response = await ApiService.getOrders(user);

        if (response?.status === 200) {
          const activeOrders = response.active_orders || [];
          setNewOrders(response.new_orders || []);
          setOngoingOrders(activeOrders);
          setAvailabilityMessage(
            activeOrders.length >= 3
              ? 'You have 3 ongoing orders. Complete one to see new delivery requests.'
              : response.cod_exceeded && Number(response.pending_cod) > 0
                ? 'Your COD limit has been reached. Settle your pending COD amount to receive new orders.'
                : '',
          );
        } else {
          throw new Error(response?.message || 'Failed to fetch orders.');
        }
      } catch (error) {
        if (!showLoad) Alert.alert('Error', error.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );


  useFocusEffect(useCallback(() => {
    let active = true;
    const sync = async (silent = true) => {
      await fetchOrders(silent);
      try {
        const response = await ApiService.getProfileData(user);
        const status = response?.data?.data?.[0]?.delivery_boy_active_status;
        if (active && status != null) setToggle(Number(status) === 0 ? 1 : 0);
      } catch (error) {
        console.error('Failed to sync driver status:', error.message);
      }
    };
    sync(false);
    const timer = setInterval(sync, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [fetchOrders, user]));

  useEffect(() => {
    if (!user?.id) return;
    getTokenValue().then(token => token && ApiService.uploadFcmToken(
      token, user.id, user.delivery_boy_location_id,
    )).catch(error => console.error('Push registration failed:', error.message));
    return onTokenRefresh(token => {
      ApiService.uploadFcmToken(token, user.id, user.delivery_boy_location_id)
        .catch(error => console.error('Push token refresh failed:', error.message));
    });
  }, [user?.id, user?.delivery_boy_location_id]);

  const handleAccept = async orderId => {
    if (acceptedOrders.length >= 3) {
      Alert.alert('Order Limit Reached', 'You can only have 3 ongoing orders.');
      return;
    }
    try {
      const response = await ApiService.acceptorders({
        deliveryarr: [user], id: user.id, order_status: 8, order_id: orderId,
      });
      if (response?.status !== 200) throw new Error(response?.message || 'Failed to accept order.');
      await fetchOrders(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to accept order.');
    }
  };

  const handleComplete = () => fetchOrders(true);

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
      handleAccept: () => fetchOrders(true),
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
      <StatusBar backgroundColor={palette.primary} barStyle="light-content" />
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
        style={{flex: 1, backgroundColor: palette.background}}>
        <View style={{backgroundColor: palette.background, flex: 1}}>
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
            {loading && <ActivityIndicator size="large" color={palette.primary} />}
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
                    <Text style={styles.noOrdersText}>
                      {activeTab === 'new' && availabilityMessage
                        ? availabilityMessage
                        : 'No Orders Available'}
                    </Text>
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
  container: {flex: 1, paddingHorizontal: wp(2), backgroundColor: palette.background}, // Adjusted padding
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: wp(3),
    backgroundColor: palette.primary,
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
    backgroundColor: palette.surface,
    borderRadius: moderateScale(8),
    padding: moderateScale(4),
    marginHorizontal: wp(3),
    elevation: 2,
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
    backgroundColor: palette.primarySoft,
  },
  tabText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: palette.text,
  },
  activeTabText: {
    color: palette.primary,
  },
});

export default OrdersScreen;
