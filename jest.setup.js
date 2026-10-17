/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('react-native-image-picker', () => ({launchImageLibrary: jest.fn()}));

jest.mock('@react-native-firebase/messaging', () => {
  const client = {
    requestPermission: jest.fn(async () => 1),
    setAutoInitEnabled: jest.fn(async () => {}),
    getToken: jest.fn(async () => 'test-device-token'),
    onMessage: jest.fn(() => jest.fn()),
    onTokenRefresh: jest.fn(() => jest.fn()),
    registerDeviceForRemoteMessages: jest.fn(async () => {}),
    isDeviceRegisteredForRemoteMessages: true,
  };
  return {__esModule: true, default: Object.assign(() => client, {AuthorizationStatus: {AUTHORIZED: 1, PROVISIONAL: 2}})};
});
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => ({authorizationStatus: 1})),
    getNotificationSettings: jest.fn(async () => ({authorizationStatus: 1})),
    getDisplayedNotifications: jest.fn(async () => []),
    createChannel: jest.fn(async () => 'custom-sound-channel'),
    displayNotification: jest.fn(async () => {}),
  },
  AndroidImportance: {HIGH: 4},
}));
jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  requestAuthorization: jest.fn(async () => 'granted'),
}));
