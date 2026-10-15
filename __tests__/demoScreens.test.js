import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {Alert, Modal} from 'react-native';
import {AuthContext} from '../src/context/AuthContext';
import {demoProfile, demoOrders} from '../src/data/demoData';
import {resetDemo} from '../src/services/demoService';
import Orders from '../src/screens/Orders';
import CompletedOrders from '../src/screens/CompletedOrders';
import Accounts from '../src/screens/AccountsScreen';
import Reports from '../src/screens/ReportsScreen';
import Settlements from '../src/screens/CODSettlementsScreen';
import Profile from '../src/screens/Profile';
import EditProfile from '../src/screens/EditProfile';
import Payments from '../src/screens/Payment';
import Tracking from '../src/screens/Ordertracking';
import Contact from '../src/screens/Contact';
import Preferences from '../src/screens/DemoPreferences';
import Registration from '../src/screens/Registration';
import ForgotPassword from '../src/screens/ForgotPassword';
import Login from '../src/screens/Login';
import Terms from '../src/screens/TermsAndConditionsScreen';
import DeleteAccount from '../src/screens/DeleteAccountScreen';
import service from '../src/services/apiservice';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn(), openDrawer: jest.fn(), addListener: () => () => {}}),
  useRoute: () => ({params: {profile: {name: 'Arjun Kumar', phone: '9000000101', address: '12, Prakash Nagar, Rajahmundry'}}}),
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
}));
const navigation = {navigate: jest.fn(), goBack: jest.fn(), openDrawer: jest.fn(), addListener: () => () => {}};
beforeEach(resetDemo);
const renderedText = node => {
  if (node == null) return '';
  if (typeof node !== 'object') return String(node);
  if (Array.isArray(node)) return node.map(renderedText).join(' ');
  return `${node.props?.value || ''} ${node.props?.title || ''} ${renderedText(node.children)}`;
};

test.each([
  ['Home', Orders, 'Amaraa Kitchen'],
  ['Completed Orders', CompletedOrders, 'AM-4107'],
  ['Accounts', Accounts, 'Payment Summary'],
  ['Reports', Reports, 'Payment Breakdown'],
  ['COD Settlements', Settlements, 'Settlement History'],
  ['Profile', Profile, 'Arjun Kumar'],
  ['EditProfile', EditProfile, 'Arjun Kumar'],
  ['Payments', Payments, 'AM-4107'],
  ['Tracking', Tracking, 'Vegetable Biryani'],
  ['Contact', Contact, 'Message on WhatsApp'],
  ['Notifications', Preferences, 'New delivery available'],
  ['Settings', Preferences, 'Delivery alerts'],
  ['Registration', Registration, 'Registration'],
  ['Forgot Password', ForgotPassword, 'Verify'],
  ['Login', Login, 'Enter'],
  ['Terms', Terms, 'Terms and Conditions'],
  ['Delete Account', DeleteAccount, 'Reset your profile'],
])('%s renders populated offline content', async (name, Screen, expected) => {
  let tree;
  await act(async () => {
    tree = Renderer.create(
      <AuthContext.Provider value={{user: demoProfile, login: jest.fn(), logout: jest.fn()}}>
        <Screen navigation={navigation} route={{name, params: {orderDetails: demoOrders[0]}}} />
      </AuthContext.Provider>,
    );
  });
  try {
    expect(renderedText(tree.toJSON())).toContain(expected);
    expect(renderedText(tree.toJSON())).not.toMatch(/demo/i);
  } finally {
    await act(async () => tree.unmount());
  }
});

test('earnings refresh when a delivery is completed while the screen remains mounted', async () => {
  let tree;
  await act(async () => {tree = Renderer.create(<Payments navigation={navigation} />);});
  expect(renderedText(tree.toJSON())).not.toContain('AM-4101');
  await act(async () => {
    await service.acceptorders({order_id: '4101'});
    await service.vendorReceived({id: '4101'});
    await service.completedorder({order_id: '4101'});
  });
  expect(renderedText(tree.toJSON())).toContain('AM-4101');
  await act(async () => tree.unmount());
});

test('a picked-up order can be delivered without OTP verification', async () => {
  await service.acceptorders({order_id: '4101'});
  await service.vendorReceived({id: '4101'});
  const response = await service.getOrders();
  const orderDetails = response.data.find(order => order.order_id === '4101');
  delete orderDetails.customer_otp;
  const complete = jest.spyOn(service, 'completedorder');
  jest.useFakeTimers();
  let tree;
  try {
    await act(async () => {
      tree = Renderer.create(
        <AuthContext.Provider value={{user: demoProfile}}>
          <Tracking route={{params: {orderDetails}}} />
        </AuthContext.Provider>,
      );
    });
    // Locate the touchable through its visible label.
    const label = tree.root.findAll(node => node.props.children === 'Deliver Order')[0];
    let action = label.parent;
    while (action && typeof action.props.onPress !== 'function') action = action.parent;
    await act(async () => { await action.props.onPress(); });
    expect(complete).toHaveBeenCalledWith({
      order_id: '4101', delivery_id: demoProfile.id, customer_id: orderDetails.customer_id,
    });
    expect(renderedText(tree.toJSON())).toContain('Order Completed Successfully');
    expect(renderedText(tree.toJSON())).not.toMatch(/OTP|Enter the code/i);
    expect((await service.getOrders()).data.some(order => order.order_id === '4101')).toBe(false);
  } finally {
    if (tree) await act(async () => tree.unmount());
    complete.mockRestore();
    jest.clearAllTimers();
    jest.useRealTimers();
  }
});

test('order confirmations and errors use in-app modals instead of native alerts', async () => {
  const nativeAlert = jest.spyOn(Alert, 'alert');
  const pickup = jest.spyOn(service, 'vendorReceived');
  let tree;
  const press = async text => {
    const label = tree.root.findAll(node => node.props.children === text).at(-1);
    let action = label.parent;
    while (action && typeof action.props.onPress !== 'function') action = action.parent;
    await act(async () => { await action.props.onPress(); });
  };
  const modalText = () => renderedText(tree.toJSON());
  try {
    await act(async () => {
      tree = Renderer.create(
        <AuthContext.Provider value={{user: demoProfile}}>
          <Tracking route={{params: {orderDetails: demoOrders[0]}}} />
        </AuthContext.Provider>,
      );
    });
    await press('Accept Order');
    expect(tree.root.findByType(Modal).props.visible).toBe(true);
    await press('Yes, Accept');
    expect(modalText()).toContain('Order accepted successfully.');
    await press('OK');
    await press('Pickup Order');
    await press('Cancel');
    expect(pickup).not.toHaveBeenCalled();
    await press('Pickup Order');
    pickup.mockRejectedValueOnce(new Error('Unable to update pickup'));
    await press('Confirm Pickup');
    expect(modalText()).toContain('Unable to update pickup');
    expect(tree.root.findByType(Modal).props.visible).toBe(true);
    expect(nativeAlert).not.toHaveBeenCalled();
  } finally {
    if (tree) await act(async () => tree.unmount());
    nativeAlert.mockRestore();
    pickup.mockRestore();
  }
});
