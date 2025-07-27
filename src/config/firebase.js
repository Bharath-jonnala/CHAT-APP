import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword,signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAA53JDXKFg4P5Q5_G0dKUhcl7mViH6JUU",
  authDomain: "chat-app-gs-d9730.firebaseapp.com",
  projectId: "chat-app-gs-d9730",
  storageBucket: "chat-app-gs-d9730.appspot.com", // fixed typo in domain
  messagingSenderId: "197136245483",
  appId: "1:197136245483:web:a7833397856e12befd14ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;


    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey There I am Chat App",
      lastSeen: Date.now()
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });

    console.log("User registered successfully!");
  } catch (error) {
    console.error("Signup error:", error.message);
toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const login=async(email,password)=>{
    try {
        await signInWithEmailAndPassword(auth,email,password);
    } catch (error) {
     console.error(error);
     toast.error(error.code.split('/')[1].split('_').join(" "));
    }
}

const logout=async()=>{
    try {
     

        await signOut(auth);

    } catch (error) {
        console.error(error);
     toast.error(error.code.split('/')[1].split('_').join(" "));

    }
}



const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter email");
    return;
  }

  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q); // ✅ Corrected here

    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent");
    } else {
      toast.error("Email does not exist");
    }
  } catch (error) {
    console.error("Password reset error:", error);
    toast.error(error.message);
  }
};

export default resetPass;

export {login,logout,auth,db,resetPass}