import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBt5DvViwm5ls_B4CWKYIYhMutJJ9opw_Y",
  authDomain: "vidyaproject-c4a1d.firebaseapp.com",
  projectId: "vidyaproject-c4a1d",
  storageBucket: "vidyaproject-c4a1d.firebasestorage.app",
  messagingSenderId: "637214484165",
  appId: "1:637214484165:web:f23e84c08cd6069f6fb2ac",
  measurementId: "G-647MPHBDGW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);