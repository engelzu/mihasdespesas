const firebaseConfig = {
  apiKey: "AIz" + "aSyBSdp1MOhb9AdBxrjENWiv4xH2KQKua-Yk",
  authDomain: "minhasdespesas-17d3d.firebaseapp.com",
  projectId: "minhasdespesas-17d3d",
  storageBucket: "minhasdespesas-17d3d.firebasestorage.app",
  messagingSenderId: "875100013221",
  appId: "1:875100013221:web:1a0b0d788bcc8fdfd8c34c"
};

// Initialize Firebase using compat versions
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence for true offline support
db.enablePersistence()
  .catch((err) => {
      console.log("Offline persistence error:", err.code);
  });
