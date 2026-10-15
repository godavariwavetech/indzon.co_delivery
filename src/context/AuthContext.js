import React, {createContext, useState} from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Keep sign-in in memory so every fresh launch begins at Login.
  const login = async (userData) => {
    setUser(userData);
  };

  // Function to remove user details (logout)
  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, login, logout, loading: false}}>
      {children}
    </AuthContext.Provider>
  );
};
