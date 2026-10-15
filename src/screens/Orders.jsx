import palette from '../theme/colors';
import {subscribeDemo} from '../services/demoService';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
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
  const [driverLocation, setDriverLocation] = useState({
    latitude: null,
    longitude: null,
  });

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
        if (__DEV__) {
          console.log('[Home] Orders API response:', JSON.stringify(response, null, 2));
        }
        if (response?.status === 200) {
          setOrders(response.data);

          const newOrdersData = response?.new_orders || [];
          const ongoingOrdersData = response?.active_orders || [];

          if (__DEV__) {
            console.log(
              '[Home] Screen data:',
              JSON.stringify(
                {newOrders: newOrdersData, ongoingOrders: ongoingOrdersData},
                null,
                2,
              ),
            );
          }

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

  useEffect(() => subscribeDemo(() => {
    fetchOrders(true);
    ApiService.getProfileData().then(response => {
      setToggle(response.data.data[0].delivery_boy_active_status === 0 ? 1 : 0);
    });
  }), [fetchOrders]);
  const handleAccept = async orderId => {
    try {
      await ApiService.acceptorders({order_id: orderId});
      await fetchOrders(true);
    } catch (error) { Alert.alert('Error', error.message); }
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
