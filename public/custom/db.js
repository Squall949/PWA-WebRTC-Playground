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
        }
    };

    self['dbAccess'] = dbAccess;
})();