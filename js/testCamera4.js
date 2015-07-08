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

}

function errorCallback(error){
    console.log('navigator.getUserMedia error: ', error);
    alert("ERROR");
}