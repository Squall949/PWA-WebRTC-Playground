const functions = require('firebase-functions');
const admin = require('firebase-admin');
const webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp();

exports.doPush = functions.https.onCall((data, context) => {
    return admin.storage().bucket("pwa-webrtc-16283.appspot.com").file('stream.mp4').getMetadata().then(function(results) {
        let url  = results[0].mediaLink;

        const index = url.indexOf("pwa-webrtc");
        url = "https://firebasestorage.googleapis.com/v0/b/" + url.slice(index);

        return admin.database().ref('subscriptions').once('value').then(function(sub) {
            webpush.setVapidDetails(
                'mailto:webber949@gmail.com',
                'BKeua3D7TfNiWARTtyDHfFLBp9mBLI-qHSrvfL2myus5xnj9Jv9ujTs1fFjxx8qRbbWtgUwcJVyc7BdYEnCR_vI',
                '73Ol_9aNCgC_T1jV1B2-UkXUos5xVjYsJs_8QErguQs'
            );
    
            var pushConfig = {
                endpoint: sub.val().endpoint,
                keys: {
                    auth: sub.val().keys.auth,
                    p256dh: sub.val().keys.p256dh
                }
            };
            return webpush.sendNotification(pushConfig, 
                JSON.stringify({
                    title: 'Watch my offline stream', 
                    content: 'enjoy it!',
                    openUrl: url
                })
            )
            .then(function() {
                return {successful: "successful"};
            })
            .catch(function(err) {
                console.log('Creating Push failed', err);
                throw new functions.https.HttpsError('999', 'Creating Push failed.');
            });
        });
    });
});