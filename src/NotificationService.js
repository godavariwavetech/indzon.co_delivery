import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
  await messaging().requestPermission();
};

export const getTokenValue = async () => {
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
  try { return messaging().onTokenRefresh(handler); }
  catch (error) {
    console.error('Push token listener failed:', error.message);
    return () => {};
  }
};
