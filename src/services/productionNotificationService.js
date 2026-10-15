import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Alert } from 'react-native';

export const requestNotificationPermission = async () => {
  try {
    // Request Notifee Permission
    const permission = await notifee.requestPermission();
    
    // if (permission) {
    //   console.log("Notification Permission Granted ✅");
    // } else {
    //   console.log("Notification Permission Denied ❌");
    // }

    // Firebase Permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    // if (enabled) {
    //   console.log("FCM Permission Granted ✅");
    //   getFCMToken();
    // } else {
    //   console.log("FCM Permission Denied ❌");
    // }
  } catch (error) {
    console.log("Permission Error: ", error);
    // Alert.alert(error)

  }
};

export const getFCMToken = async () => {
  await notifee.createChannel({
    id: 'custom-sound-channel',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH, // Ensures high priority notifications
    sound: 'custom_sound',// You can add a custom sound here
    vibration: true,
  });
  const token = await messaging().getToken();
  console.log(token)
  messaging().onMessage(async (remoteMessage) => {

    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        channelId: 'custom-sound-channel',
        importance: AndroidImportance.HIGH,
      },
    });
  });

 return token
};

export const getTokenValue = async () => {
  const token = await messaging().getToken();
  return token;
}

// export async function displayLocalNotification() {
//   // Create or get the channel with the custom sound
//   const channelId = await notifee.createChannel({
//     id: 'orders',
//     name: 'Order Notifications',
//     sound: 'notification_sound',// No file extension!
//     importance: AndroidImportance.HIGH,
//   });

//   // Display the notification
//   await notifee.displayNotification({
//     title: '🔔 Test Notification',
//     body: 'This is how your custom sound will play!',
//     android: {
//       channelId,
//       pressAction: {
//         id: 'default',
//       },
//     },
//   });
// }