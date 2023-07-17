import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import ChatRow from "./ChatRow";

const ChatList = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useAuth();
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "matches"),
        where("usersMatched", "array-contains", user.uid)
      ),
      (snapshot) => {
        setMatches(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setLoadingChats(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <>
      {loadingChats ? (
        <View className="justify-center items-center">
          <Text className="text-lg">Loading...</Text>
        </View>
      ) : matches.length > 0 ? (
        <FlatList
          className="h-full"
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatRow matchDetails={item} />}
        />
      ) : (
        <View className="p-5">
          <Text className="text-center text-lg">No matches at the moment</Text>
        </View>
      )}
    </>
  );
};

export default ChatList;
