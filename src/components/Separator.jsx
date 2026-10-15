import palette from '../theme/colors';
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

const Separator = ({ height = 1, color = palette.border, marginVertical = 10, width = '100%' }) => {
  const { width: screenWidth } = useWindowDimensions(); // Get the screen width dynamically

  return (
    <View
      style={[
        styles.separator,
        { height, backgroundColor: color, marginVertical, width: width === '100%' ? screenWidth : width },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    alignSelf: 'center', // Ensures the separator aligns properly in flex containers
  },
});

export default Separator;
