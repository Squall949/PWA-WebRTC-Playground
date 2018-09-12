importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-storage.js');
importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-database.js');
importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-functions.js');

// Initialize Firebase
var fireBaseConfig = {
    apiKey: "AIzaSyA0_0VRb3kRK--N5_FFzpARXkvVCy_VfOw",
    authDomain: "pwa-webrtc-16283.firebaseapp.com",
    databaseURL: "https://pwa-webrtc-16283.firebaseio.com",
    projectId: "pwa-webrtc-16283",
    storageBucket: "pwa-webrtc-16283.appspot.com",
    messagingSenderId: "39641803214"
};
firebase.initializeApp(fireBaseConfig);