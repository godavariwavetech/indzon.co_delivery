import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Load user data from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }finally {
        setLoading(false); // Mark loading as complete
      }
    };
    loadUser();
  }, []);

  // Function to set user details
  const login = async (userData) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  // Function to remove user details (logout)
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout ,loading}}>
      {children}
    </AuthContext.Provider>
  );
};
