self.addEventListener('sync', function (event) {
    if (event.tag == 'save-stream') {
        event.waitUntil(self.dbAccess.saveToFirebase());
    }
});

self.addEventListener('push', function(event){
    console.log('got a push message', event);

    var contentObj = {title: 'New', content: 'Something new happened', openUrl:'/'};
    if(event.data){
        contentObj = JSON.parse(event.data.text());
    }

    var options = {
        body: contentObj.content,
        icon: 'favicon.ico',
        badge: 'favicon.ico',
        data: {
            url: contentObj.openUrl
        }
    };
    event.waitUntil(
        self.registration.showNotification(contentObj.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var action = event.action;
  
    console.log(notification);
  
    if (action === 'confirm') {
      console.log('Confirm was chosen');
      notification.close();
    } else {
      console.log(action);
      // view the offline video
      event.waitUntil(
        clients.matchAll()
          .then(function(clis) {
            var client = clis.find(function(c) {
              return c.visibilityState === 'visible';
            });
  
            if (client) {
              client.navigate(notification.data.url);
              client.focus();
            } else {
              clients.openWindow(notification.data.url);
            }
            notification.close();
          })
      );
    }
});