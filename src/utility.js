function saveStream(stream, isIPFS) {
    const options = {mimeType: 'video/webm'};
    const recordedChunks = [];
    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.addEventListener('dataavailable', function(e) {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    });

    mediaRecorder.addEventListener('stop', function() {
        // save to indexedDb
        if ('indexedDB' in window && window.dbAccess){
            window.dbAccess.writeData('stream', {id: 'tmpRecord', stream: new Blob(recordedChunks)})
            .then(() => {
                // trigger sw's sync event
                // if('serviceWorker' in navigator && 'SyncManager' in window){
                //     navigator.serviceWorker.ready.then(function(swRegistration) {
                        if (isIPFS) {
                            // swRegistration.sync.register('save-ipfs');
                            console.log('isIPFS ' + isIPFS);
                            let form = new FormData();
                            form.append('stream', new Blob(recordedChunks));

                            fetch('/savetoipfs', {
                                method: 'POST',
                                body: form
                            }).then(response => {
                        
                            });
                        }
                        else {
                            // swRegistration.sync.register('save-stream');
                        }
                //     });
                // }
            });
        }
    });  

    mediaRecorder.start(1000);

    // just to record for 10 seconds
    setTimeout(() => {
        mediaRecorder.stop();
    }, 10000);
}

export {saveStream};