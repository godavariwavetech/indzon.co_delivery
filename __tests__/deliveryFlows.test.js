import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {Text, TouchableOpacity, TextInput} from 'react-native';
import Tracking from '../src/screens/Ordertracking';
import Orders from '../src/screens/Orders';
import ToggleSwitch from '../src/components/ToggleSwitch';
import Login from '../src/screens/Login';
import {AuthContext} from '../src/context/AuthContext';
import service from '../src/services/apiservice';

jest.mock('../src/services/apiservice', () => ({__esModule: true, default: {
  getOrderDetails: jest.fn(), acceptorders: jest.fn(), vendorReceived: jest.fn(), completedorder: jest.fn(),
  getOrders: jest.fn(), getProfileData: jest.fn(), uploadFcmToken: jest.fn(), updateDriverStatus: jest.fn(), login: jest.fn(),
}}));
const mockNavigation = {navigate: jest.fn(), goBack: jest.fn(), openDrawer: jest.fn()};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
}));
const user = {id: 'rider', delivery_boy_location_id: 'location'};
const order = {order_id: 'order', order_ids: 'IN-1', order_status: 1, customer_id: 'customer', customer_otp: '5678', grand_total: '250', shop_name: 'Test Kitchen', delivery_address: 'Test Address'};
let tree;
beforeEach(() => {
  jest.clearAllMocks();
  service.getOrderDetails.mockResolvedValue({status: 200, data: {orderitemdata: []}});
  service.getOrders.mockResolvedValue({status: 200, data: [order], new_orders: [order], active_orders: []});
  service.getProfileData.mockResolvedValue({status: 200, data: {data: [{delivery_boy_active_status: 0}]}});
  service.uploadFcmToken.mockResolvedValue({status: 200});
  service.acceptorders.mockResolvedValue({status: 200});
  service.vendorReceived.mockResolvedValue({status: 200});
  service.completedorder.mockResolvedValue({status: 200});
});
afterEach(async () => { if (tree) await act(async () => tree.unmount()); tree = null; jest.useRealTimers(); });
const mount = async element => {
  await act(async () => { tree = Renderer.create(<AuthContext.Provider value={{user}}>{element}</AuthContext.Provider>); });
};
const press = async label => {
  const text = tree.root.findAllByType(Text).reverse().find(node => React.Children.toArray(node.props.children).join('') === label);
  if (!text) throw new Error('Missing button: ' + label);
  let button = text.parent;
  while (button && !button.props.onPress) button = button.parent;
  await act(async () => button.props.onPress());
};

test('accept, pickup and customer OTP send backend payloads before advancing', async () => {
  const accepted = jest.fn();
  const completed = jest.fn();
  await mount(<Tracking route={{params: {orderDetails: order, handleAccept: accepted, handleComplete: completed}}} />);
  await press('Accept Order');
  await press('Yes, Accept');
  expect(service.acceptorders).toHaveBeenCalledTimes(1);
  expect(service.acceptorders).toHaveBeenCalledWith({deliveryarr: [user], id: 'rider', order_status: 8, order_id: 'order'});
  expect(accepted).toHaveBeenCalledTimes(1);
  await press('OK');
  await press('Pickup Order');
  await press('Confirm Pickup');
  expect(service.vendorReceived).toHaveBeenCalledWith({id: 'order', customer_id: 'customer'});
  await press('Deliver Order');
  expect(service.completedorder).not.toHaveBeenCalled();
  expect(tree.root.findAllByType(TextInput)).toHaveLength(4);
  for (let index = 0; index < 4; index++) {
    await act(async () => tree.root.findAllByType(TextInput)[index].props.onChangeText('0'));
  }
  await press('Submit');
  expect(service.completedorder).not.toHaveBeenCalled();
  await press('OK');
  for (let index = 0; index < 4; index++) {
    await act(async () => tree.root.findAllByType(TextInput)[index].props.onChangeText('5678'[index]));
  }
  await press('Submit');
  expect(service.completedorder).toHaveBeenCalledWith({order_id: 'order', delivery_id: 'rider', delivery_otp: '5678', customer_id: 'customer'});
  expect(completed).toHaveBeenCalledWith('order');
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 1100)); });
  expect(mockNavigation.goBack).toHaveBeenCalled();
});

test('rejected acceptance leaves the order available and does not notify home of success', async () => {
  service.acceptorders.mockResolvedValue({status: 409, message: 'Already assigned'});
  const accepted = jest.fn();
  await mount(<Tracking route={{params: {orderDetails: order, handleAccept: accepted}}} />);
  await press('Accept Order');
  await press('Yes, Accept');
  expect(accepted).not.toHaveBeenCalled();
  expect(tree.root.findAllByType(Text).some(node => node.props.children === 'Already assigned')).toBe(true);
  expect(tree.root.findAllByType(Text).some(node => node.props.children === 'Pickup Order')).toBe(false);
});

test('home acceptance uses the full reference payload and refetches orders', async () => {
  await mount(<Orders navigation={mockNavigation} />);
  await press('Accept Order');
  await press('Yes, Accept');
  expect(service.acceptorders).toHaveBeenCalledTimes(1);
  expect(service.acceptorders).toHaveBeenCalledWith({deliveryarr: [user], id: 'rider', order_status: 8, order_id: 'order'});
  expect(service.getOrders.mock.calls.length).toBeGreaterThan(1);
});

test('availability does not write to the backend on render and changes only after success', async () => {
  const setToggle = jest.fn();
  service.updateDriverStatus.mockResolvedValue({status: 200});
  await mount(<ToggleSwitch toggle={0} setToggle={setToggle} />);
  expect(service.updateDriverStatus).not.toHaveBeenCalled();
  const pressable = tree.root.findAll(node => typeof node.props.onPress === 'function')[0];
  await act(async () => pressable.props.onPress());
  expect(service.updateDriverStatus).toHaveBeenCalledWith(0, 'rider');
  expect(setToggle).toHaveBeenCalledWith(1);
});

test('login persists only the server identity after successful authentication', async () => {
  const login = jest.fn();
  service.login.mockResolvedValue({status: 200, data: [user]});
  await act(async () => { tree = Renderer.create(<AuthContext.Provider value={{login}}><Login navigation={mockNavigation} /></AuthContext.Provider>); });
  const inputs = tree.root.findAllByType(TextInput);
  await act(async () => { inputs[0].props.onChangeText('9000000000'); inputs[1].props.onChangeText('secret'); });
  const buttons = tree.root.findAllByType(TouchableOpacity);
  const submit = buttons.find(button => button.props.disabled === false);
  await act(async () => submit.props.onPress());
  expect(service.login).toHaveBeenCalledWith('9000000000', 'secret');
  expect(login).toHaveBeenCalledWith(user);
});


test('home explains the backend three-order limit after acceptance', async () => {
  const activeOrders = [
    {...order, order_id: 'active-1', order_ids: 'IN-A1', order_status: 8},
    {...order, order_id: 'active-2', order_ids: 'IN-A2', order_status: 2},
  ];
  service.getOrders.mockResolvedValueOnce({status: 200, new_orders: [order], active_orders: activeOrders});
  service.getOrders.mockResolvedValue({status: 200, new_orders: [], active_orders: [...activeOrders, {...order, order_status: 8}], cod_exceeded: false});
  await mount(<Orders navigation={mockNavigation} />);
  await press('Accept Order');
  await press('Yes, Accept');
  const text = tree.root.findAllByType(Text).map(node => React.Children.toArray(node.props.children).join('')).join(' ');
  expect(text).toContain('New Orders(0)');
  expect(text).toContain('Ongoing Orders (3)');
  expect(text).toContain('Complete one to see new delivery requests.');
  await press('Ongoing Orders (3)');
  expect(tree.root.findAllByType(Text).map(node => React.Children.toArray(node.props.children).join('')).join(' ')).toContain('IN-A1');
});

test('home counts active_orders when checking the acceptance limit without a data field', async () => {
  service.getOrders.mockResolvedValue({status: 200, new_orders: [order], active_orders: [
    {...order, order_id: 'active-1', order_status: 8},
    {...order, order_id: 'active-2', order_status: 2},
    {...order, order_id: 'active-3', order_status: 8},
  ]});
  await mount(<Orders navigation={mockNavigation} />);
  await press('Accept Order');
  await press('Yes, Accept');
  expect(service.acceptorders).not.toHaveBeenCalled();
});


test('order details displays instructions from the order details API', async () => {
  service.getOrderDetails.mockResolvedValue({status: 200, data: {
    orderdata: [{order_instructions: 'Keep the items separate', delivery_instruction: 'Use the side entrance'}],
    orderitemdata: [],
  }});
  await mount(<Tracking route={{params: {orderDetails: order}}} />);
  const text = tree.root.findAllByType(Text).map(node => React.Children.toArray(node.props.children).join('')).join(' ');
  expect(text).toContain('Keep the items separate');
  expect(text).toContain('Use the side entrance');
});

test('order details explains missing instructions instead of showing a blank card', async () => {
  service.getOrderDetails.mockResolvedValue({status: 200, data: {
    orderdata: [{order_instructions: '   ', delivery_instruction: null}], orderitemdata: [],
  }});
  await mount(<Tracking route={{params: {orderDetails: order}}} />);
  const text = tree.root.findAllByType(Text).map(node => React.Children.toArray(node.props.children).join('')).join(' ');
  expect(text).toContain('No order instructions provided.');
  expect(text).toContain('No delivery instructions provided.');
});


test('delivery OTP uses four numeric boxes and supports moving back to edit', async () => {
  await mount(<Tracking route={{params: {orderDetails: {...order, order_status: 2}}}} />);
  await press('Deliver Order');
  let inputs = tree.root.findAllByType(TextInput);
  expect(inputs).toHaveLength(4);
  expect(inputs.map(input => input.props.maxLength)).toEqual([1, 1, 1, 1]);
  await act(async () => inputs[0].props.onChangeText('5'));
  inputs = tree.root.findAllByType(TextInput);
  expect(inputs[0].props.value).toBe('5');
  // The next input is highlighted as focus advances.
  expect(inputs[1].props.style[1]).toBeTruthy();
  await act(async () => inputs[1].props.onChangeText('x'));
  expect(tree.root.findAllByType(TextInput)[1].props.value).toBe('');
  await act(async () => inputs[1].props.onKeyPress({nativeEvent: {key: 'Backspace'}}));
  inputs = tree.root.findAllByType(TextInput);
  expect(inputs[0].props.value).toBe('');
  expect(inputs[0].props.style[1]).toBeTruthy();
  expect(service.completedorder).not.toHaveBeenCalled();
});
