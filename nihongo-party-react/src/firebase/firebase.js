
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDDE0mqXrie71arIDNJCCxATAk74NZfaso",
  authDomain: "nihongo-party.firebaseapp.com",
  databaseURL: "https://nihongo-party-default-rtdb.firebaseio.com",
  projectId: "nihongo-party",
  storageBucket: "nihongo-party.firebasestorage.app",
  messagingSenderId: "141360230494",
  appId: "1:141360230494:web:8dceb8f984f744eb5504cf",
  measurementId: "G-T2WW25ZK15"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
