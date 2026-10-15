import palette from '../theme/colors';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getDemoExtras,
  subscribeDemo,
  markDemoRead,
  toggleDemoSetting,
} from '../services/demoService';
import ApiService from '../services/apiservice';

export default function DemoPreferences({navigation, route}) {
  const [data, setData] = useState(getDemoExtras);
  useEffect(() => subscribeDemo(() => setData(getDemoExtras())), []);
  const notifications = route.name === 'Notifications';
  const openNotification = async item => {
    markDemoRead(item.id);
    if (item.order_id) {
      const response = await ApiService.getOrders();
      const history = await ApiService.completedorders({});
      const orderDetails = [...response.data, ...history.data.data].find(
        order => order.order_id === item.order_id,
      );
      if (orderDetails) {
        navigation.navigate('Ordertracking', {orderDetails});
        return;
      }
    }
    Alert.alert(item.title, item.message);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color={palette.surface} />
        </TouchableOpacity>
        <Text style={styles.title}>{route.name}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {notifications ? (
          data.notifications.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => openNotification(item)}>
              <Text style={styles.cardTitle}>
                {item.read ? '' : '● '}
                {item.title}
              </Text>
              <Text style={styles.body}>{item.message}</Text>
              <Text style={styles.caption}>
                {item.date} · {item.read ? 'Read' : 'Unread'}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>App Preferences</Text>
              <Text style={styles.body}>
                All delivery actions run locally. Changes reset when the app
                restarts.
              </Text>
            </View>
            {data.settings.map(item => (
              <View key={item.id} style={[styles.card, styles.row]}>
                <View style={styles.description}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.body}>{item.description}</Text>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleDemoSetting(item.id)}
                  trackColor={{true: palette.primary}}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: palette.background},
  header: {
    backgroundColor: palette.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {fontSize: 20, fontWeight: 'bold', color: palette.surface, marginLeft: 16},
  content: {padding: 16},
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  cardTitle: {fontSize: 16, fontWeight: '600', color: palette.text},
  body: {fontSize: 14, color: palette.textSecondary, marginTop: 8},
  caption: {fontSize: 12, color: '#777', marginTop: 12},
  row: {flexDirection: 'row', alignItems: 'center'},
  description: {flex: 1},
});
