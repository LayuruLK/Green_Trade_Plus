// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
// IMPORTANT: Keep this for biometric authentication/check
import * as LocalAuthentication from 'expo-local-authentication';
// If you plan to use react-native-biometrics (requiring EAS Build/bare workflow), you would keep this:
// import ReactNativeBiometrics from 'react-native-biometrics';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { API_URL } = Constants.expoConfig.extra;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        console.log("userdata: ", userData);

        if (userData && userData !== 'undefined') {
          setUser(JSON.parse(userData));
        } else {
          setUser(null); // clear user if invalid data
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (usernameOrPhone, password) => {
    try {
      const response = await fetch(`http://${API_URL}:8080/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrPhone, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        const user = data;
        const token = data.token;
        console.log("user", user);
        console.log("token", token);

        // Save to AsyncStorage
        if (user && token) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('token', token);
          setUser(user);
        }

        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: 'Network error' };
    }
  };


  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  };

  // --- Biometric Functions (Using Expo LocalAuthentication) ---

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      // const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync(); // Uncomment if you need specific types

      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Biometric check error:', error);
      return false;
    }
  };

  const biometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to log in',
        fallbackLabel: 'Enter Passcode',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        // If LocalAuthentication is successful, you *might* want to hit your backend
        // to get a new token or verify a session, but remember:
        // LocalAuthentication does NOT provide a cryptographic signature.
        // Your backend's `/api/auth/biometric/verify` expecting `signature` and `payload`
        // is likely designed for `react-native-biometrics`.
        // If sticking with Expo Go, this backend call might need to be adjusted
        // to be less dependent on cryptographically verifiable biometrics.

        const response = await fetch(`http://${API_URL}:8080/api/auth/biometric/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: user?.userName || user?.email,
            // You can't send 'signature' or 'payload' if using LocalAuthentication
            // You would send user identifying info and potentially a flag that biometrics succeeded locally.
          }),
        });

        const data = await response.json();

        if (response.status === 200) {
          const token = data.accessToken;
          await AsyncStorage.setItem('token', token);
          return { success: true };
        } else {
          return { success: false, message: data.message || 'Biometric login failed' };
        }
      } else {
        return { success: false, message: result.error || 'Biometric authentication failed' };
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      return { success: false, message: 'Biometric authentication error' };
    }
  };

  // NEW FUNCTIONS TO ADD TO AUTHCONTEXT

  const updateBiometricPreference = async (isEnabled) => {
    // This function will tell your backend whether the user wants biometrics enabled or disabled.
    // It does NOT involve public keys directly, but just updates a user setting.
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found for updating biometric preference.');
        return false;
      }

      const endpoint = isEnabled ? `http://${API_URL}:8080/api/auth/biometric/enable` : `http://${API_URL}:8080/api/auth/biometric/disable`;

      const response = await fetch(endpoint, {
        method: 'POST', // Assuming your backend uses POST for these endpoints
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user?.id, /* other relevant info */ }) // Send user ID or relevant identifier
      });

      if (response.status === 200) {
        return true; // Successfully updated preference on backend
      } else {
        const errorData = await response.json();
        console.error('Failed to update biometric preference on server:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Network error updating biometric preference:', error);
      return false;
    }
  };


  // If your backend absolutely requires a public key generated on the device
  // for secure biometric enrollment, this will need react-native-biometrics
  // and thus, a bare Expo workflow (EAS Build).
  // For Expo Go, this `publicKey` argument might be conceptually empty,
  // or you'd need a different server-side approach.
  const storePublicKeyOnServer = async (publicKey) => {
    console.warn("`storePublicKeyOnServer` is designed for `react-native-biometrics`'s key generation. For Expo Go, `publicKey` might be undefined or you need a different backend enrollment strategy.");
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found for storing public key.');
        return false;
      }

      const response = await fetch(`http://${API_URL}:8080/api/auth/biometric/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ publicKey, userId: user?.id }), // Send the public key and user ID
      });

      if (response.status === 200) {
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to store public key on server:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Network error storing public key:', error);
      return false;
    }
  };

  const removePublicKeyFromServer = async () => {
    // This would ideally correspond to deleting the public key from the backend.
    // If you're not using public keys for enrollment (due to Expo Go), this might just
    // be a "disable biometrics" call.
    console.warn("`removePublicKeyFromServer` is designed for `react-native-biometrics`'s key deletion. Adjust if your backend doesn't store explicit biometric public keys.");
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found for removing public key.');
        return false;
      }

      const response = await fetch(`http://${API_URL}:8080/api/auth/biometric/disable`, {
        method: 'POST', // Assuming POST for disabling
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user?.id }), // Send user ID to identify
      });

      if (response.status === 200) {
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to remove public key from server:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Network error removing public key:', error);
      return false;
    }
  };


  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      biometricLogin,
      checkBiometricSupport,
      enableBiometricAuth: storePublicKeyOnServer, // Map your context function to the one calling the backend
      disableBiometricAuth: removePublicKeyFromServer, // Map your context function to the one calling the backend
      updateBiometricPreference, // Expose the new function
    }}>
      {children}
    </AuthContext.Provider>
  );
};