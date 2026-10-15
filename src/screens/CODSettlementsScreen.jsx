import palette from '../theme/colors';
import {useCallback as useDemoCallback} from 'react';
import {useEffect} from 'react';
import {subscribeDemo} from '../services/demoService';
import React, {useContext, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  Image,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {scale, moderateScale, verticalScale} from 'react-native-size-matters';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ApiService from '../services/apiservice';
import {AuthContext} from '../context/AuthContext';

const CODSettlementsScreen = () => {
  const {user} = useContext(AuthContext);
  const navigation = useNavigation();

  const [codSummary, setCodSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const handleImagePress = image => {
    setActiveImage(image);
    setModalVisible(true);
  };

  const fetchData = useDemoCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const [amountsResponse, historyResponse] = await Promise.all([
        ApiService.getCODAmounts(user?.id),
        ApiService.getCODSettledHistory(user?.id),
      ]);

      console.log(historyResponse, '>>>>>>>>>>>>>>>>>>>.historyResponse');

      if (amountsResponse.length > 0) {
        setCodSummary(amountsResponse[0]);
      } else {
        setCodSummary(null);
      }

      if (Array.isArray(historyResponse)) {
        setHistory(historyResponse);
      }
    } catch (error) {
      console.error('Error fetching COD settlements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  useEffect(() => subscribeDemo(fetchData), [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderHistoryItem = ({item}) => {
    const isApproved = item.settlement_status_text === 'Approved';

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.historyDate}>
              {item.settleddate || 'Date N/A'}
            </Text>
            {/* <Text style={styles.historySubId}>Transaction ID: #{item.id || '---'}</Text> */}
          </View>

          {item.payment_image ? (
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => handleImagePress(item.payment_image)}>
              <MaterialCommunityIcons
                name="image-outline"
                size={22}
                color={palette.primary}
              />
              <Text style={styles.viewImageText}>payment image</Text>
            </TouchableOpacity>
          ) : null}

          {/* <View style={[styles.statusBadge, { backgroundColor: isApproved ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={[styles.statusText, { color: isApproved ? '#1B5E20' : '#E65100' }]}>
                 {item.settlement_status_text || 'Pending'}
              </Text>
           </View> */}
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.historyBody}>
          <View style={styles.historyInfoBlock}>
            <Text style={styles.historyLabel}>Amount</Text>
            <Text style={styles.historyAmount}>₹{item.cod_amount}</Text>
          </View>
          <View style={styles.historyInfoBlock}>
            <Text style={styles.historyLabel}>Orders</Text>
            <Text style={styles.historyValue}>{item.cod_orders}</Text>
          </View>
          <View style={styles.historyInfoBlock}>
            <Text style={styles.historyLabel}>Settlement OTP</Text>
            <View style={styles.historyOtpContainer}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={14}
                color={palette.primary}
              />
              <Text style={styles.historyOtpText}>
                {item.cod_settlement_otp || '---'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerWrapper}>
      {/* Premium Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>Total Cash in Hand</Text>
            {codSummary?.date_range && (
              <Text style={styles.summaryDateRange}>
                {codSummary.date_range}
              </Text>
            )}
          </View>
          {/* <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="wallet" size={24} color="#3236FF" />
           </View> */}
        </View>

        <Text style={styles.summaryAmount}>
          ₹{codSummary?.cod_amount || '0.00'}
        </Text>

        <View style={styles.summaryStatsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{codSummary?.cod_count || '0'}</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ₹{codSummary?.total_amount || '0'}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        {/* OTP Box - Glassmorphism Style */}
        {codSummary?.cod_settlement_otp ? (
          <View style={styles.otpBox}>
            <Text style={styles.otpTitle}>VERIFY SETTLEMENT</Text>
            <View style={styles.otpRow}>
              <Text style={styles.otpCode}>
                {codSummary.cod_settlement_otp}
              </Text>
              {/* <MaterialCommunityIcons name="content-copy" size={18} color="rgba(255,255,255,0.8)" style={{marginLeft: 10}} /> */}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Settlement History</Text>
        {/* <Ionicons name="filter" size={18} color="#666" /> */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={palette.primary} barStyle="light-content" />

      {/* Professional Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color={palette.surface} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>COD Settlements</Text>
        <View style={styles.navButton} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[palette.primary]}
              tintColor={palette.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={60}
                color={palette.disabled}
              />
              <Text style={styles.emptyText}>No settlements yet</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="close-circle" size={40} color={palette.surface} />
          </TouchableOpacity>

          <View style={styles.modalContent}>
            {activeImage && (
              <Image
                source={{uri: activeImage}}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background, // High-quality light gray
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(14),
    paddingHorizontal: wp(5),
    backgroundColor: palette.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    zIndex: 10,
  },
  navTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: palette.surface,
    letterSpacing: 0.5,
  },
  navButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: verticalScale(30),
  },
  headerWrapper: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(8),
  },

  // --- Premium Summary Card ---
  summaryCard: {
    backgroundColor: palette.primary,
    borderRadius: 20,
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    // Sophisticated Shadow
    shadowColor: palette.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: scale(13),
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryDateRange: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scale(10),
    fontWeight: '500',
  },
  iconCircle: {
    backgroundColor: palette.surface,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryAmount: {
    color: palette.surface,
    fontSize: scale(36),
    fontWeight: 'bold',
    marginVertical: verticalScale(12),
    letterSpacing: 0.5,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.08)', // Subtle dark overlay
    borderRadius: 12,
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(5),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: '80%',
    alignSelf: 'center',
  },
  statValue: {
    color: palette.surface,
    fontSize: scale(16),
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scale(11),
    marginTop: 2,
  },

  // --- OTP Box (Glass Effect) ---
  otpBox: {
    marginTop: verticalScale(16),
    backgroundColor: 'rgba(255,255,255,0.15)', // Glassmorphism
    borderRadius: 12,
    padding: moderateScale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  otpTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpCode: {
    color: palette.surface,
    fontSize: scale(22),
    fontWeight: 'bold',
    letterSpacing: 3,
  },

  // --- Section Header ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: palette.text,
  },

  // --- Fancy History List ---
  historyCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: moderateScale(16),
    marginHorizontal: moderateScale(16),
    marginBottom: verticalScale(12),
    // Soft Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Platform.OS === 'ios' ? palette.border : 'transparent',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: scale(14),
    fontWeight: '600',
    color: palette.text,
  },
  historySubId: {
    fontSize: scale(11),
    color: palette.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: palette.background,
    marginVertical: verticalScale(12),
  },
  historyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyInfoBlock: {
    flex: 1,
  },
  historyLabel: {
    fontSize: scale(11),
    color: palette.textMuted,
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: scale(15),
    fontWeight: '700',
    color: palette.text,
  },
  historyValue: {
    fontSize: scale(14),
    fontWeight: '600',
    color: palette.text,
  },
  historyOtpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyOtpText: {
    fontSize: scale(13),
    fontWeight: '700',
    color: palette.primary,
    marginLeft: 4,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(60),
    opacity: 0.6,
  },
  emptyText: {
    marginTop: verticalScale(12),
    color: palette.textMuted,
    fontSize: scale(15),
    fontWeight: '500',
  },

  // --- Image Modal & Button ---
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewImageText: {
    fontSize: scale(10),
    color: palette.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 2,
  },
  modalContent: {
    width: wp(100),
    height: hp(80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

export default CODSettlementsScreen;
