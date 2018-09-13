# PWA-WebRTC

This app was created by using [Create React App](https://github.com/facebook/create-react-app), and appending custom-service-worker to deal with particular events.  It emulates when a user is offline, sw stores the webcam stream into indexedDB. Once the user has connectivity, uploading the stored stream to Firebase, and in the meantime, generating push notification to other users.  The scenario was not practical in real world because the peers were on the same page, but still good for understanding some new things. 

### **To-do list:**

- [x] Get user's stream from camera
- [x] Adding customized service worker
- [x] Accessing indexedDB
- [x] Syncing stored stream with Firebase
- [x] Push Notification

### **Expected skills to learn through this project:**

1. Service Worker
2. WebRTC (getUserMedia, RTCPeerConnection)
3. IndexedDB
4. Firebase (storage, database API, Functions)
5. Push Notification (Firebase)