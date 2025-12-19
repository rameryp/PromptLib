// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";

// Your web app's Firebase configuration
// REPLACE THESE VALUES WITH YOUR OWN FROM THE FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyAJqhfoqX0_NAkYg0QITO_KqnXohY_mPIM",
    authDomain: "prompt-library-95494.firebaseapp.com",
    projectId: "prompt-library-95494",
    storageBucket: "prompt-library-95494.firebasestorage.app",
    messagingSenderId: "410503725404",
    appId: "1:410503725404:web:55f07fe5a7a06cae69c199"
};

// Initialize Firebase
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        // Ensure the auth state persists in the browser
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
}
