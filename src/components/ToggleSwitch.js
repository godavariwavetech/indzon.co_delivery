import palette from '../theme/colors';
import React, { useContext, useRef, useState } from 'react';
import { View, Animated, TouchableWithoutFeedback, StyleSheet, Alert } from 'react-native';
import ApiService from '../services/apiservice';
import { AuthContext } from '../context/AuthContext';

const ToggleSwitch = ({ toggle, setToggle }) => {
  const { user } = useContext(AuthContext);
  const translateX = useRef(new Animated.Value(toggle === 1 ? 30 : 0)).current;

  // Handle toggle animation and server update
  React.useEffect(() => {
    console.log('ToggleSwitch - Toggle state changed to:', toggle);
    Animated.timing(translateX, {
      toValue: toggle === 1 ? 30 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
  }, [toggle, translateX]);

  const [updating, setUpdating] = useState(false);
  const handleToggle = async () => {
    if (updating || !user?.id) return;
    setUpdating(true);
    const next = toggle === 1 ? 0 : 1;
    try {
      const response = await ApiService.updateDriverStatus(next === 1 ? 0 : 1, user.id);
      if (response?.status !== 200) throw new Error(response?.message || 'Failed to update availability.');
      setToggle(next);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update availability.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleToggle}>
        <View style={styles.container}>
          <View style={[styles.toggleContainer, { backgroundColor: toggle === 1 ? palette.surface : palette.border }]}>
            <Animated.View style={[styles.swipeCircle, { backgroundColor: toggle === 1 ? palette.success : palette.danger, transform: [{ translateX }] }]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    width: 60,
    height: 25,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 5,
    position: 'relative',
  },
  swipeCircle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    position: 'absolute',
    left: 5,
  },
});

export default ToggleSwitch;
