import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgE2tGvYZ3JZLfrjUUIQapHlKC7tKCX4c",
  authDomain: "tinder-clone-586f3.firebaseapp.com",
  projectId: "tinder-clone-586f3",
  storageBucket: "tinder-clone-586f3.appspot.com",
  messagingSenderId: "288439527861",
  appId: "1:288439527861:web:b9b284cbb71efedb3411fc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db };
