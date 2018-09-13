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

  if ('Notification' in window) {
    if (Notification.permission !== "granted") {
        // asking for the permission of Push Notification
        Notification.requestPermission().then(function() {
            console.log('Notification permission granted.');
            setPushSubscribe();
          }).catch(function(err) {
            console.log('Unable to get permission to notify.', err);
          });          
    }
    else {
      setPushSubscribe();
    }
  }

  function setPushSubscribe() {
    if (!('serviceWorker' in navigator)) 
        return;
    
    var reg;
    navigator.serviceWorker.ready
        .then(function(swreg) {
          reg = swreg;
          return swreg.pushManager.getSubscription();
        })
        .then(function(sub) {
            if (sub === null) {
              return doSubscribe(reg);
            }
            else {
              return sub.unsubscribe().then(function() {
                console.log('successfully unsubscribed');
                // to refresh subscription
                return doSubscribe(reg);
              });
            }
        })
        .then(function(newSub) {
          return firebase.database().ref('subscriptions').set(newSub.toJSON());
        })
        .then(function() {
          if ('Notification' in window && Notification.permission !== "granted")
            new Notification('Successfully Subscribe');

          console.log('Successfully Subscribe');
        })
        .catch(function(err) {
          console.log(err);
        });
  }

  function doSubscribe(reg) {
    return reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('BKeua3D7TfNiWARTtyDHfFLBp9mBLI-qHSrvfL2myus5xnj9Jv9ujTs1fFjxx8qRbbWtgUwcJVyc7BdYEnCR_vI')
    });
  }

  function urlBase64ToUint8Array(base64String){
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g,'/');
    var rawData = window.atob(base64);
    var outputArr = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i ){
        outputArr[i] = rawData.charCodeAt(i);
    }    
    return outputArr;
  }