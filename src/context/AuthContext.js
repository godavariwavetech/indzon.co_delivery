import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {DELIVERY_API_BASE_URL} from '../config/api';

const USER_STORAGE_KEY = `user:${DELIVERY_API_BASE_URL}`;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Load user data from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
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
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  // Function to remove user details (logout)
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
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
