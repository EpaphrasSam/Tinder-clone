import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const MatchScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute();

  const { loggedInProfile, userSwiped } = params;

  return (
    <SafeAreaView className="h-full bg-red-500 pt-20" style={{ opacity: 0.89 }}>
      <View className="justify-center px-10 pt-20">
        <Image
          className="h-20 w-full rounded-full"
          source={{ uri: "https://links.papareact.com/mg9" }}
        />
      </View>

      <Text className="text-white text-center mt-5">
        You and {userSwiped.displayName} have liked each other
      </Text>

      <View className="flex-row justify-evenly mt-5 h-32">
        <Image
          style={{ height: 128, width: 128, borderRadius: 100 }}
          source={{ uri: loggedInProfile.photoURL }}
        />
        <Image
          style={{ height: 128, width: 128, borderRadius: 100 }}
          source={{ uri: userSwiped.photoURL }}
        />
      </View>

      <TouchableOpacity
        className="bg-white m-5 px-10 py-8 rounded-full mt-20"
        onPress={() => {
          navigation.goBack();
          navigation.navigate("Chat");
        }}
      >
        <Text className="text-center">Send a Message</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MatchScreen;
