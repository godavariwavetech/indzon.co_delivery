import palette from '../theme/colors';
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Logo Animation */}
      <Animated.View entering={FadeIn.duration(1500)}>
        <Image source={require("../assets/indzon-logo.png")} style={styles.logo} />
      </Animated.View>

      {/* App Name */}
      <Animated.Text entering={FadeIn.duration(1500)} style={styles.appName}>
        Food Delivery Partner
      </Animated.Text>

      {/* Loading Text */}
      <Animated.Text entering={FadeIn.duration(1500)} style={styles.loadingText}>
        Getting things ready...
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.surface, 
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    borderRadius: 10,
  },
  appName: {
    fontSize: 24,
    color: palette.text,
    fontWeight: "bold",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: palette.textSecondary,
    marginTop: 10,
    opacity: 0.8,
  },
});

export default SplashScreen;
