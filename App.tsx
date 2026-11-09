import React, {useEffect} from 'react';
import {listenForNotifications, requestNotificationPermission} from './src/NotificationService';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';

const App = () => {
  useEffect(() => {
    const unsubscribe = listenForNotifications();
    requestNotificationPermission().catch(error => console.error('Notification permission failed:', error.message));
    return unsubscribe;
  }, []);
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};
export default App;
