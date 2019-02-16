(function() {
    var dbAccess = {
        dbPromise: {},
        createDB: function() {
            this.dbPromise = idb.open('stream', 1, function(db){
                if(!db.objectStoreNames.contains('stream'))
                    db.createObjectStore('stream', {keyPath: 'id'});
            });
        },
        writeData: function(table, data) {
            return this.dbPromise
                .then(function(db){
                    var transaction = db.transaction(table, 'readwrite');
                    var stream = transaction.objectStore(table);
                    stream.put(data);
                    return transaction.complete;
                });
        },
        readData: function(table) {
            return this.dbPromise
                .then(function(db){
                    var transaction = db.transaction(table, 'readonly');
                    var stream = transaction.objectStore(table);
                    return stream.getAll();
                });
        },
        saveToFirebase: function() {
            this.readData('stream').then(function(data) {
                if (data && data.length) {
                    firebase.storage().ref().child('stream.mp4').put(data[0].stream, { contentType : 'video/mp4' }).then(function(snapshot) {
                        console.log('Uploaded a blob!');
                        // Generating Push Message
                        var doPush = firebase.functions().httpsCallable('doPush');
                        
                        doPush().then(function(result) {
                            console.log(`${result.data.successful}! Push Created.`);
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    });
                }
            });
        },
        saveToIPFS: function() {
            this.readData('stream').then(function(data) {
                if (data && data.length) {
                    let form = new FormData();
                    form.append('stream.mp4', data[0].stream);

                    fetch('/savetoipfs', {
                        method: 'POST',
                        body: form
                    }).then(response => {
                        
                    });
                }
            });
        }
    };

    dbAccess.createDB();
    self['dbAccess'] = dbAccess;
})();