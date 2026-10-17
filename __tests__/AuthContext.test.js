import React, {useContext} from 'react';
import Renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext, AuthProvider} from '../src/context/AuthContext';

const profile = {id: 'test-rider', delivery_boy_name: 'Test Rider'};
afterEach(() => AsyncStorage.clear());
test('restores the backend session across launches and clears it on logout', async () => {
  let auth;
  let tree;
  const Probe = () => { auth = useContext(AuthContext); return null; };
  const mount = async () => {
    await act(async () => { tree = Renderer.create(<AuthProvider><Probe /></AuthProvider>); });
  };
  await mount();
  expect(auth.user).toBeNull();
  expect(auth.loading).toBe(false);
  await act(async () => auth.login(profile));
  expect(JSON.parse(await AsyncStorage.getItem('user'))).toEqual(profile);
  await act(async () => tree.unmount());
  await mount();
  expect(auth.user).toEqual(profile);
  await act(async () => auth.logout());
  expect(auth.user).toBeNull();
  expect(await AsyncStorage.getItem('user')).toBeNull();
  await act(async () => tree.unmount());
});
