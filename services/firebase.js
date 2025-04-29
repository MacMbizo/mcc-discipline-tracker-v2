"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = void 0;
// Firebase configuration and initialization
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    apiKey: 'AIzaSyCVpvYToZCTXWRhQ9jXcplU-M9DIE-BAzE',
    authDomain: 'mcc-app-v3.firebaseapp.com',
    projectId: 'mcc-app-v3',
    storageBucket: 'mcc-app-v3.appspot.com',
    messagingSenderId: '5508013705',
    appId: '1:5508013705:android:3a4a370105325a6d7a7058',
};
const app = (0, app_1.getApps)().length ? (0, app_1.getApps)()[0] : (0, app_1.initializeApp)(firebaseConfig);
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.default = app;
