import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import getMatchedUserInfo from "../lib/getMatchedUserInfo";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";

const ChatRow = ({ matchDetails }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [matchedUserInfo, setMatchedUserInfo] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    setMatchedUserInfo(getMatchedUserInfo(matchDetails.users, user.uid));
  }, [matchDetails, user]);

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => doc.data());
          setLastMessage(messages[0]?.message);

          const unreadMessages = messages.filter(
            (message) => message.userId !== user.uid && !message.read
          );
          setUnreadMessageCount(unreadMessages.length);
        }
      ),

    [matchDetails, db, user]
  );

  const markMessagesAsRead = async () => {
    const messageDocs = await query(
      collection(db, "matches", matchDetails.id, "messages")
    ).get();

    messageDocs.forEach(async (doc) => {
      if (doc.data().userId !== user.uid && !doc.data().read) {
        const messageRef = doc.ref;
        await updateDoc(messageRef, { read: true });
      }
    });
  };

  const navigateToMessages = () => {
    markMessagesAsRead();
    navigation.navigate("Messages", { matchDetails });
  };

  return (
    <TouchableOpacity
      className="flex-row justify-between items-center"
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
      }}
      onPress={navigateToMessages}
    >
      <View className="flex-row">
        <Image
          style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }}
          source={{ uri: matchedUserInfo?.photoURL }}
        />
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {matchedUserInfo?.displayName}
          </Text>
          <Text style={{ color: "#888" }}>{lastMessage || "Say Hi!"}</Text>
        </View>
      </View>
      {unreadMessageCount > 0 && (
        <View
          style={{
            backgroundColor: "#FF5864",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
            {unreadMessageCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ChatRow;
