import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Importar funciones de autenticación
import { getFirestore } from "firebase/firestore"; // Importar Firestore

// Tu configuración de Firebase (proporcionada por Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyC3lRQH26bzWY3FkMwh0Rg4DIYGASICHwo",
    authDomain: "undersounds-69aa7.firebaseapp.com",
    projectId: "undersounds-69aa7",
    storageBucket: "undersounds-69aa7.firebasestorage.app",
    messagingSenderId: "838128349104",
    appId: "1:838128349104:web:d8d78ea8b5e31bd0beb075",
    measurementId: "G-VD7DXSFHCM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar la autenticación
const auth = getAuth(app);

// Inicializar Firestore
const db = getFirestore(app);

// Exportar Firebase para usar en otros archivos
export { app, auth, db };

// Exportar la configuración de Firebase
export default firebaseConfig;
