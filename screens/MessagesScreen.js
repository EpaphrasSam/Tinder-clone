import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { useRoute } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import getMatchedUserInfo from "../lib/getMatchedUserInfo";
import SenderMessage from "../components/SenderMessage";
import ReceiverMessage from "../components/ReceiverMessage";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const MessagesScreen = () => {
  const { user } = useAuth();
  const { params } = useRoute();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [textInputHeight, setTextInputHeight] = useState(0);

  const { matchDetails } = params;

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => {
          const updatedMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const unreadMessages = updatedMessages.filter(
            (message) => !message.read && message.userId !== user.uid
          );

          if (unreadMessages.length > 0) {
            unreadMessages.forEach((message) => {
              updateDoc(
                doc(db, "matches", matchDetails.id, "messages", message.id),
                {
                  read: true,
                }
              );
            });
          }
          setMessages(updatedMessages);
        }
      ),
    [matchDetails, db, user.uid]
  );

  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;
    setTextInputHeight(contentSize.height);
  };

  const sendMessage = () => {
    addDoc(collection(db, "matches", matchDetails.id, "messages"), {
      timestamp: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName,
      photoURL: matchDetails.users[user.uid].photoURL,
      message: input,
      read: false,
    });

    setInput("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        callEnabled
        title={getMatchedUserInfo(matchDetails?.users, user.uid).displayName}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={10}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={messages}
            inverted={-1}
            style={{ paddingLeft: 4 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item: message }) => {
              return message.userId === user.uid ? (
                <SenderMessage key={message.id} message={message} />
              ) : (
                <ReceiverMessage key={message.id} message={message} />
              );
            }}
          />
        </TouchableWithoutFeedback>
        <View className="flex-row bg-white justify-between items-center border-t border-gray-400 px-5 py-2 mt-2">
          <View className="flex-1">
            <TextInput
              style={{ height: Math.max(35, textInputHeight) }}
              className=" text-lg pr-2"
              placeholder="Send Message"
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              value={input}
              multiline={true}
              numberOfLines={6}
              onContentSizeChange={handleContentSizeChange}
            />
          </View>

          <TouchableOpacity
            disabled={input.length == 0}
            className={`${
              input.length == 0 ? "bg-gray-500" : "bg-red-500"
            } rounded-md py-3 px-6 self-center`}
            onPress={sendMessage}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessagesScreen;
