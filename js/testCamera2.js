
navigator.getUserMedia  = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

if (typeof MediaStreamTrack === 'undefined'){
    alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
} else {
    MediaStreamTrack.getSources(gotSources);
}

var videos = [];

function gotSources(sourceInfos) {
    var j = 0;
    for (var i = 0; i !== sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        var option = document.createElement('option');
        option.value = sourceInfo.id;
        if (sourceInfo.kind === 'audio') {
            option.text = sourceInfo.label || 'microphone ' + (audioSelect.length + 1);
            audioSelect.appendChild(option);
            console.log(sourceInfo.label + " + " + sourceInfo.id);
        } else if (sourceInfo.kind === 'video') {
            option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
            videoSelect.appendChild(option);
            console.log(sourceInfo.label + " + " + sourceInfo.id);
            videos[j] = sourceInfo.id;
            j++;
        } else {
            console.log('Some other kind of source: ', sourceInfo);
        }
    }
    start();
}

function successCallback(stream) {
    window.stream = stream; // make stream available to console
    videoElement.src = window.URL.createObjectURL(stream);
    videoElement.play();
}

function errorCallback(error){
    console.log('navigator.getUserMedia error: ', error);
    alert("ERROR");
}

var videoElement = document.getElementById('video');
var audioSelect = document.getElementById('audioSource');
var videoSelect = document.getElementById('videoSource');


function start()
{
    if (!!window.stream) {
        videoElement.src = null;
        window.stream.stop();
    }

    var audioSource = audioSelect.value;
    var videoSource = videoSelect.value;

    var constraints = {
        audio: {
            optional: [{sourceId: audioSource}]
        },
        video: {
            optional: []
        }
    };

    constraints.video.optional.push({sourceId: videos[1]});

    for(var i = 0; i < videos.length; i++)
    {
        alert("camera numéro " + (i+1) + " OK");
    }

    navigator.getUserMedia(constraints, successCallback, errorCallback);
}
