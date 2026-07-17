import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB4i-XEqmSvFUYmzbC-yz2BYI2PCAz9xbg",
    authDomain: "nexuscampus-pras.firebaseapp.com",
    projectId: "nexuscampus-pras",
    storageBucket: "nexuscampus-pras.firebasestorage.app",
    messagingSenderId: "165744054110",
    appId: "1:165744054110:web:6318f1512741c3890fc9cf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
