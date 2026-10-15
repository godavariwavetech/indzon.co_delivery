import React, {useContext} from 'react';
import Renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext, AuthProvider} from '../src/context/AuthContext';
import {demoProfile} from '../src/data/demoData';

test('fresh launches require login even when an old session is saved', async () => {
  await AsyncStorage.setItem('amaraa-demo-user', JSON.stringify(demoProfile));
  let auth;
  let tree;
  const Probe = () => {
    auth = useContext(AuthContext);
    return null;
  };
  const mount = async () => {
    await act(async () => {
      tree = Renderer.create(<AuthProvider><Probe /></AuthProvider>);
    });
  };
  try {
    await mount();
    expect(auth.user).toBeNull();
    expect(auth.loading).toBe(false);
    await act(async () => auth.login(demoProfile));
    expect(auth.user).toEqual(demoProfile);
    await act(async () => tree.unmount());
    await mount();
    expect(auth.user).toBeNull();
    await act(async () => auth.login(demoProfile));
    await act(async () => auth.logout());
    expect(auth.user).toBeNull();
  } finally {
    if (tree) await act(async () => tree.unmount());
    await AsyncStorage.clear();
  }
});
