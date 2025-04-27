// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCVpvYToZCTXWRhQ9jXcplU-M9DIE-BAzE',
  authDomain: 'mcc-app-v3.firebaseapp.com',
  projectId: 'mcc-app-v3',
  storageBucket: 'mcc-app-v3.appspot.com',
  messagingSenderId: '5508013705',
  appId: '1:5508013705:android:3a4a370105325a6d7a7058',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
