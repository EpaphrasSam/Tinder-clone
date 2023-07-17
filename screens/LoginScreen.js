import {
  View,
  Text,
  Button,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../hooks/useAuth";

const LoginScreen = () => {
  const { signInWithGoogle, loading } = useAuth();
  const navigation = useNavigation();

  return (
    <>
      {!loading ? (
        <View className="flex-1">
          <ImageBackground
            resizeMode="cover"
            style={{ flex: 1 }}
            source={{ uri: "https://tinder.com/static/tinder.png" }}
          >
            <TouchableOpacity
              className="absolute bottom-40 w-52 bg-white p-4 rounded-2xl"
              style={{ marginHorizontal: "25%" }}
              onPress={signInWithGoogle}
            >
              <Text className="text-center font-semibold">
                Sign in & get swiping
              </Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      ) : (
        <>
          <SafeAreaView className="flex-1 items-center justify-center">
            <Text>Loading...</Text>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default LoginScreen;
