self.addEventListener('activate', function(event) {
    event.waitUntil(
        self.dbAccess.createDB()
    );
  });

self.addEventListener('sync', function (e) {
    if (event.tag == 'save-stream') {
        event.waitUntil(saveToFirebase());
    }
});

// save to firebase
function saveToFirebase() {

}
