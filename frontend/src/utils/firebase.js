
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhS4yPNpVgVuCOVZDWGwaZzu-nTDnACmA",
  authDomain: "project-registor.firebaseapp.com",
  projectId: "project-registor",
  storageBucket: "project-registor.firebasestorage.app",
  messagingSenderId: "563976498706",
  appId: "1:563976498706:web:f1d19ca6c1453ea71eb2cb"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
