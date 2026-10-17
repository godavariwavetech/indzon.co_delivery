import palette from '../theme/colors';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// --- Import all your screens ---
import OrdersScreen from '../screens/Orders';
import CompletedOrders from '../screens/CompletedOrders';
import Payment from '../screens/Payment';
import Preferences from '../screens/Preferences';
import Contact from '../screens/Contact';
import ProfileScreen from '../screens/Profile';
import EditProfileScreen from '../screens/EditProfile';
import AccountsScreen from '../screens/AccountsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
// --- ⬇️ 1. Import the new Terms and Conditions screen ---
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import CODSettlementsScreen from '../screens/CODSettlementsScreen';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// This stack for Profile -> Edit Profile remains unchanged
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: palette.primary}}>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: palette.surface, // White background
          },
          headerShown: false,
          drawerActiveBackgroundColor: palette.primarySoft,
          drawerActiveTintColor: palette.primary,
          drawerInactiveTintColor: palette.text, // Dark gray for inactive text/icons
          drawerLabelStyle: {fontSize: 16, fontWeight: 'bold'},
        }}>
        {/* Orders Screen */}
        <Drawer.Screen
          name="Home"
          component={OrdersScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="list" size={22} color={color} />
            ),
          }}
        />

        {/* Completed Orders */}
        <Drawer.Screen
          name="Completed Orders"
          component={CompletedOrders}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="check-circle" size={22} color={color} />
            ),
          }}
        />

        {/* Payments History */}
        <Drawer.Screen
          name="Payments History"
          component={AccountsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons
                name="account-balance-wallet"
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Drawer.Screen
          name="COD Settlements"
          component={CODSettlementsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="attach-money" size={22} color={color} />
            ),
          }}
        />

        <Drawer.Screen name="Earnings" component={Payment} options={{drawerIcon: ({color}) => <MaterialIcons name="payments" size={22} color={color} />}} />
        <Drawer.Screen name="Notifications" component={Preferences} options={{drawerIcon: ({color}) => <MaterialIcons name="notifications" size={22} color={color} />}} />
        <Drawer.Screen name="Settings" component={Preferences} options={{drawerIcon: ({color}) => <MaterialIcons name="settings" size={22} color={color} />}} />
        {/* Reports */}
        <Drawer.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="work-history" size={22} color={color} />
            ),
          }}
        />

        {/* Contact Details */}
        <Drawer.Screen
          name="Contact Details"
          component={Contact}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="phone" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Terms & Conditions"
          component={TermsAndConditionsScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="description" size={22} color={color} />
            ),
          }}
        />

        {/* Profile Stack (Nested Navigator) */}
        <Drawer.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="person" size={22} color={color} />
            ),
          }}
        />

        {/* --- ⬇️ 2. Add the new screen to the drawer menu --- */}

        {/* Delete Account */}
        <Drawer.Screen
          name="Delete Account"
          component={DeleteAccountScreen}
          options={{
            drawerIcon: ({color}) => (
              <MaterialIcons name="delete" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </SafeAreaView>
  );
};

export default DrawerNavigator;
