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
  await requestNotificationPermission();
  await messaging().setAutoInitEnabled(true);
  if (Platform.OS === 'ios') {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    // messaging().getToken() can hang indefinitely on iOS until Apple's
    // APNs device token has actually arrived - wait for it (briefly) first.
    for (
      let attempt = 0;
      attempt < 10 && !(await messaging().getAPNSToken());
      attempt += 1
    ) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    // Belt-and-suspenders: never let a never-resolving getToken() block the caller forever.
    return Promise.race([
      messaging().getToken(),
      new Promise(resolve => setTimeout(() => resolve(null), 8000)),
    ]);
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
