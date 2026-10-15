import palette from '../theme/colors';
import React, { useContext, useRef, useEffect } from 'react';
import { View, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
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
    
    // Update server status when toggle changes
    const updateServerStatus = async () => {
      try {
        const status = toggle === 1 ? 0 : 1;
        await ApiService.updateDriverStatus(status, user?.id);
        console.log('ToggleSwitch - Server status updated:', status);
      } catch (error) {
        console.error('ToggleSwitch - Error updating server status:', error);
      }
    };
    
    updateServerStatus();
  }, [toggle, user?.id, translateX]);

  const handleToggle = () => {
    console.log('ToggleSwitch - Manual toggle pressed, current:', toggle);
    setToggle(prevToggle => (prevToggle === 1 ? 0 : 1));
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
