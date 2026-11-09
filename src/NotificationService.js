import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';

// Firebase is only configured when GoogleService-Info.plist / google-services.json
// is bundled. Calling messaging() without a default app crashes on iOS at launch.
const firebaseReady = () => {
  try {
    return firebase.apps.some(app => app.name === '[DEFAULT]');
  } catch (error) {
    return false;
  }
};

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
  if (!firebaseReady()) return;
  await messaging().requestPermission();
};

export const getTokenValue = async () => {
  if (!firebaseReady()) return null;
  await messaging().setAutoInitEnabled(true);
  if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging().registerDeviceForRemoteMessages();
  }
  return messaging().getToken();
};

const displayMessage = async remoteMessage => {
  if (!remoteMessage.notification) return;
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'custom-sound-channel', name: 'Delivery notifications',
      importance: AndroidImportance.HIGH, sound: 'custom_sound', vibration: true,
    });
  }
  await notifee.displayNotification({
    title: remoteMessage.notification.title,
    body: remoteMessage.notification.body,
    data: remoteMessage.data,
    android: {channelId: 'custom-sound-channel', importance: AndroidImportance.HIGH},
  });
};

export const listenForNotifications = () => {
  if (!firebaseReady()) return () => {};
  try {
    return messaging().onMessage(message => {
      displayMessage(message).catch(error => console.error('Notification failed:', error.message));
    });
  } catch (error) {
    console.error('Push initialization failed:', error.message);
    return () => {};
  }
};

export const getFCMToken = getTokenValue;
export const onTokenRefresh = handler => {
  if (!firebaseReady()) return () => {};
  try { return messaging().onTokenRefresh(handler); }
  catch (error) {
    console.error('Push token listener failed:', error.message);
    return () => {};
  }
};
