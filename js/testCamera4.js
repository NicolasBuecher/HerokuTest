navigator.getUserMedia  = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

navigator.getUserMedia({video: true}, successCallback, errorCallback);

var videoElement = document.getElementById('video');

function successCallback(stream) {

    window.stream = stream; // make stream available to console
    videoElement.src = window.URL.createObjectURL(stream);
    videoElement.play();

    var tab = stream.getVideoTracks();

    for (var i = 0; i < tab.length; i++)
    console.log("video " + i);

    setTimeout(end, 6000);

    function end()
    {
        videoElement.stop();
    }
}

function errorCallback(error){
    console.log('navigator.getUserMedia error: ', error);
    alert("ERROR");
}