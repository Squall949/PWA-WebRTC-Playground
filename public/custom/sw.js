self.addEventListener('sync', function (event) {
    if (event.tag == 'save-stream') {
        event.waitUntil(self.dbAccess.saveToFirebase());
    }
});
