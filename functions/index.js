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
            JSON.stringify({title: 'Watch my offline stream', content: 'enjoy it!'})
        )
        .then(function() {
            return {successful: "successful"};
        })
        .catch(function(err) {
            console.log('Creating Push failed', err);
        });
    });
});