import palette from '../theme/colors';
import React, {useState, useCallback} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, RefreshControl, Linking} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import notifee from '@notifee/react-native';
import {useFocusEffect} from '@react-navigation/native';
import {requestNotificationPermission} from '../NotificationService';

export default function Preferences({navigation, route}) {
  const [items, setItems] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const notifications = route.name === 'Notifications';
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const settings = await notifee.getNotificationSettings();
      setEnabled(settings.authorizationStatus >= 1);
      const displayed = await notifee.getDisplayedNotifications();
      setItems(displayed.map(item => item.notification));
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load notifications.');
    } finally {
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const changePermission = async () => {
    try {
      if (enabled) await Linking.openSettings();
      else await requestNotificationPermission();
      await refresh();
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not change notification permission.');
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color={palette.surface} />
        </TouchableOpacity>
        <Text style={styles.title}>{route.name}</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, notifications && !items.length && styles.emptyContent]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {notifications ? (
          items.length ? items.map(item => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => Alert.alert(item.title || 'Notification', item.body)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </TouchableOpacity>
          )) : (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={56} color={palette.textMuted} />
              <Text style={styles.emptyText}>No active notifications</Text>
            </View>
          )
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>App Preferences</Text>
              <Text style={styles.body}>Manage delivery notification permissions in your device settings.</Text>
            </View>
            <View style={[styles.card, styles.row]}>
              <View style={styles.description}>
                <Text style={styles.cardTitle}>Delivery alerts</Text>
                <Text style={styles.body}>Receive delivery notifications on this device.</Text>
              </View>
              <Switch value={enabled} onValueChange={changePermission} trackColor={{true: palette.primary}} />
            </View>
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
  emptyContent: {flexGrow: 1, justifyContent: 'center'},
  empty: {alignItems: 'center', justifyContent: 'center'},
  emptyText: {fontSize: 16, color: palette.textSecondary, marginTop: 12, textAlign: 'center'},
});
