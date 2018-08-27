function saveStream(stream) {
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
            window.dbAccess.writeData('stream', {id: 'tmpRecord', stream: new Blob(recordedChunks)});
        }
    });  

    mediaRecorder.start(1000);

    // just to record for 10 seconds
    setTimeout(() => {
        mediaRecorder.stop();
    }, 10000);
}

export {saveStream};