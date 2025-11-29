import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Importar funciones de autenticación
import { getFirestore } from "firebase/firestore"; // Importar Firestore

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDRCNjFqKPOz3E1YgdW0hSrq4OyD7pVglE",
    authDomain: "undersounds-dc0dd.firebaseapp.com",
    projectId: "undersounds-dc0dd",
    storageBucket: "undersounds-dc0dd.firebasestorage.app",
    messagingSenderId: "455905178097",
    appId: "1:455905178097:web:2da69bd7280fd745dd1450",
    measurementId: "G-XJ2GVHPNV0"
};

const app = initializeApp(firebaseConfig);// Inicializar Firebase
const auth = getAuth(app);// Inicializar la autenticación
const db = getFirestore(app);// Inicializar Firestore

export { app, auth, db }; // Exportar Firebase para usarse para login, logout y registro
export default firebaseConfig;// Exportar la configuración de Firebase
