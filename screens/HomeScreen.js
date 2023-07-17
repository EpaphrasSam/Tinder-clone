import { View, Text, Button, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import generateId from "../lib/generateId";

const DUMMY_DATA = [
  {
    id: 1,
    firstName: "Sonny",
    lastName: "Sangha",
    job: "Software Developer",
    photoURL: "https://avatars.githubusercontent.com/u/24712956?v=4",
    age: 27,
  },
  {
    id: 2,
    firstName: "Elon",
    lastName: "Musk",
    job: "Software Developer",
    photoURL:
      "https://thumbs.dreamstime.com/b/vanity-fair-oscar-party-los-angeles-feb-elon-musk-vanity-fair-oscar-party-wallis-annenberg-center-february-200005974.jpg",
    age: 40,
  },
  {
    id: 3,
    firstName: "Mark",
    lastName: "Zuckerberg",
    job: "Software Developer",
    photoURL:
      "https://thumbs.dreamstime.com/b/april-washington-usa-facebook-ceo-mark-zuckerberg-testifies-front-us-house-committee-energy-commerce-dc-facebook-ceo-114315862.jpg",
    age: 35,
  },
  {
    id: 4,
    firstName: "Emma",
    lastName: "Johnson",
    job: "Student",
    photoURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzePFIgADHGyRcP_e-U-pQGoFBrL_jRu4avQ&usqp=CAU",
    age: 22,
  },
  {
    id: 5,
    firstName: "Olivia",
    lastName: "Smith",
    job: "Artist",
    photoURL:
      "https://www.lboro.ac.uk/media/media/subjects/social-policy/images/staff-profiles/Olivia%20Smith.jpg",
    age: 23,
  },
  {
    id: 6,
    firstName: "Noah",
    lastName: "Wilson",
    job: "Engineer",
    photoURL:
      "https://media.licdn.com/dms/image/C5603AQF9Br3ntGTd6A/profile-displayphoto-shrink_800_800/0/1659638643035?e=2147483647&v=beta&t=gRG0jtCOgU-ujdcAq8xD8VuwMPMM8YOb6sEvrZsIntc",
    age: 24,
  },
  {
    id: 7,
    firstName: "Sophia",
    lastName: "Taylor",
    job: "Designer",
    photoURL:
      "https://m.media-amazon.com/images/M/MV5BNzAyMGZhYTYtMDQ3MS00ZDc4LWE3NjctMzI4Y2JiYjlkNmY5XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_.jpg",
    age: 26,
  },
  {
    id: 8,
    firstName: "Liam",
    lastName: "Brown",
    job: "Writer",
    photoURL:
      "https://media.licdn.com/dms/image/C4D03AQGCYWysmqymiA/profile-displayphoto-shrink_800_800/0/1660383125742?e=2147483647&v=beta&t=n8II60l94sox6Dw_U8BtFEf4O9tM9NqGMO79F0A2DY0",
    age: 21,
  },
  {
    id: 9,
    firstName: "Ava",
    lastName: "Martin",
    job: "Photographer",
    photoURL:
      "https://media.licdn.com/dms/image/D5603AQETvxaj2EeFwg/profile-displayphoto-shrink_800_800/0/1638973328615?e=2147483647&v=beta&t=vBhzYB5L-TVhDW65H_scuGJh0HPzhHMKN3Ov3Nz9kK8",
    age: 27,
  },
  {
    id: 10,
    firstName: "James",
    lastName: "Anderson",
    job: "Chef",
    photoURL: "https://njithighlanders.com/images/2022/12/27/Liam_Brown.jpg",
    age: 29,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const swipeRef = useRef();
  const [cardsLoading, setCardsLoading] = useState(true);

  const iconDisable = profiles.length == 0;

  const clearProfiles = () => {
    setProfiles([]);
  };

  useLayoutEffect(
    () =>
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),
    []
  );

  useEffect(() => {
    setCardsLoading(true);
    let unsub;

    const fetchCards = async () => {
      const passes = await getDocs(
        collection(db, "users", user.uid, "passes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const swipes = await getDocs(
        collection(db, "users", user.uid, "swipes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ),
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
          );
          setCardsLoading(false);
        }
      );
    };
    fetchCards();

    return unsub;
  }, [iconDisable]);

  const swipeLeft = (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];

    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };

  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    const loggedInProfile = (await getDoc(doc(db, "users", user.uid))).data();

    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          // console.log(`Hooray, You MATCHED with ${userSwiped.displayName}`);

          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );

          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });

          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          // console.log(
          //   `You swiped on ${userSwiped.displayName} ${userSwiped.job}`
          // );

          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );

    setDoc(doc(db, "users", user.uid, "swipes", userSwiped.id), userSwiped);
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <View className="flex-row items-center justify-between px-5">
        <TouchableOpacity onPress={logout}>
          <Image
            source={{
              uri: user.photoURL,
            }}
            style={{ height: 40, width: 40, borderRadius: 50 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Image
            source={require("../assets/tinderlogo.png")}
            style={{
              height: 70,
              width: 70,
              borderRadius: 50,
              backgroundColor: "transparent",
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" color="#FF5864" size={30} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 -mt-6 ">
        {cardsLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text>Loading...</Text>
          </View>
        ) : (
          <Swiper
            ref={swipeRef}
            containerStyle={{ backgroundColor: "transparent" }}
            cards={profiles}
            stackSize={iconDisable ? 1 : 5}
            cardIndex={0}
            animateCardOpacity
            verticalSwipe={false}
            horizontalSwipe={iconDisable ? false : true}
            backgroundColor={"#4FD0E9"}
            onSwipedAll={clearProfiles}
            onSwipedLeft={(cardIndex) => {
              swipeLeft(cardIndex);
            }}
            onSwipedRight={(cardIndex) => {
              swipeRight(cardIndex);
            }}
            overlayLabels={{
              left: {
                title: "NOPE",
                style: {
                  label: {
                    textAlign: "right",
                    color: "red",
                  },
                },
              },
              right: {
                title: "MATCH",
                style: {
                  label: {
                    color: "#4DED30",
                  },
                },
              },
            }}
            renderCard={(card) =>
              card ? (
                <>
                  <View
                    key={card.id}
                    className="bg-white h-3/4 rounded-xl relative"
                  >
                    {/* {console.log(card)} */}
                    <Image
                      style={{
                        position: "absolute",
                        top: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: 25,
                      }}
                      source={{ uri: card.photoURL }}
                    />
                    <View
                      className="bg-white flex-row w-full h-20 absolute bottom-0 justify-between items-center px-6 py-2 rounded-b-xl"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.2,
                        shadowRadius: 1.41,
                        elevation: 2,
                      }}
                    >
                      <View>
                        <Text className="text-xl font-bold">
                          {card.displayName}
                        </Text>
                        <Text>{card.job}</Text>
                      </View>
                      <Text className="text-2xl font-bold">{card.age}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View
                    className="relative bg-white h-3/4 rounded-xl justify-center items-center"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      elevation: 2,
                    }}
                  >
                    <Text className="font-bold pb-5">No more profiles</Text>

                    <Image
                      style={{ height: 100, width: 100 }}
                      source={{ uri: "https://links.papareact.com/6gb" }}
                    />
                  </View>
                </>
              )
            }
          />
        )}
      </View>

      <View className="flex-row justify-evenly my-4">
        <TouchableOpacity
          disabled={iconDisable}
          onPress={() => swipeRef.current.swipeLeft()}
          className={`items-center justify-center rounded-full w-16 h-16 ${
            iconDisable ? "bg-gray-400" : "bg-red-200"
          }`}
        >
          <Entypo name="cross" size={24} color={iconDisable ? "gray" : "red"} />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={iconDisable}
          onPress={() => swipeRef.current.swipeRight()}
          className={`items-center justify-center rounded-full w-16 h-16 ${
            iconDisable ? "bg-gray-400" : "bg-green-200"
          }`}
        >
          <AntDesign
            name="heart"
            size={24}
            color={iconDisable ? "gray" : "green"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
