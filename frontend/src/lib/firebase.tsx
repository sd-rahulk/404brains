// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbTWRkLtohozi0Ap0XgmV7HAU8yxuEpRE",
  authDomain: "joker-devil.firebaseapp.com",
  databaseURL: "https://joker-devil-default-rtdb.firebaseio.com",
  projectId: "joker-devil",
  storageBucket: "joker-devil.appspot.com",
  messagingSenderId: "986059333236",
  appId: "1:986059333236:web:2bf72012be458851c7fb21",
  measurementId: "G-Q8TRDJMS4L"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
