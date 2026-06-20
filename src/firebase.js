import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoCIHBSwBpre2kfyF8teTKkRdRZyeLl9E",
  authDomain: "webapp-ce0ce.firebaseapp.com",
  databaseURL: "https://webapp-ce0ce-default-rtdb.firebaseio.com",
  projectId: "webapp-ce0ce",
  storageBucket: "webapp-ce0ce.appspot.com",
  messagingSenderId: "389804133548",
  appId: "1:389804133548:web:af04ba2bbc64afa969e309"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
