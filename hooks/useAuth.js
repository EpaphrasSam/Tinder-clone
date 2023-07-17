import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext({});

const config = {
  android: {
    clientId:
      "288439527861-s4l55nf4r15drtum00cdr0q695o0eaid.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ["profile", "email"],
  },
  ios: {
    clientId:
      "288439527861-ibg7citanfvds6t84cu7d0ef0cqj5nhh.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ["profile", "email"],
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingIntial, setLoadingIntial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
        setLoadingIntial(false);
      }),
    []
  );

  const logout = () => {
    setLoading(true);

    signOut(auth)
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  const signInWithGoogle = async () => {
    setLoading(true);

    try {
      const result = await AuthSession.startAsync({
        authUrl: generateGoogleAuthUrl(),
      });

      if (result.type === "success") {
        const { id_token, access_token } = result.params;
        const credential = GoogleAuthProvider.credential(
          id_token,
          access_token
        );
        await signInWithCredential(auth, credential);
      } else if (result.type === "error") {
        console.log("Error during Google sign-in:", result.error);
      }
    } catch (error) {
      setError(error);
    } finally {
      () => setLoading(false);
    }
  };

  const generateRandomString = (length) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const generateGoogleAuthUrl = () => {
    const platform = getPlatform();
    const platformConfig = config[platform];

    const nonce = generateRandomString(16);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      platformConfig.clientId
    }&redirect_uri=${encodeURIComponent(
      platformConfig.redirectUri
    )}&response_type=id_token%20token&scope=${encodeURIComponent(
      platformConfig.scopes.join(" ")
    )}&nonce=${encodeURIComponent(nonce)}`;

    return authUrl;
  };

  const getPlatform = () => {
    const platform = Platform.OS === "android" ? "android" : "ios";
    return platform;
  };

  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      signInWithGoogle,
      logout,
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingIntial && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
