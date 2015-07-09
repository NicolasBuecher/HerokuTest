var videoElement = document.getElementById('video');
var canvasElement = document.getElementById('canvas');
var ctx = canvasElement.getContext('2d');

navigator.getUserMedia  = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

if (typeof MediaStreamTrack === 'undefined')
{
    alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
}
else
{
    var videoSources = [];
    var j = 0;

    MediaStreamTrack.getSources(gotSources);

    function gotSources(sourceInfos) {
        for (var i = 0; i !== sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            if (sourceInfo.kind === 'video') {
                videoSources[j] = sourceInfo.id;
                j++;
            }
        }

        switch (videoSources.length) {
            case 0:
                alert("Aucune caméra détectée");
                break;
            case 1:
                alert("Il s'agit certainement de ta webcam, non ?");
                break;
            case 2:
                alert("Au pif, ce doit être ta caméra externe !");
                start(videoSources[1]);
                break;
            default:
                alert("Trop de choix, je ne sais que choisir !");
                break;
        }
    }
}

function start(videoId)
{
    if (!!window.stream)
    {
        videoElement.src = null;
        window.stream.stop();
    }

    var constraints = {
        video: {
            optional: [{
                sourceId: videoId
            }]
        }
    };

    navigator.getUserMedia(constraints, onSuccessCallback, onErrorCallback);

    function onSuccessCallback(stream)
    {
        window.stream = stream;
        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();

        videoElement.addEventListener('click', snapshot, false);

        function snapshot() {
            if (stream) {
                ctx.drawImage(videoElement, 0, 0);
                var image = ctx.getImageData(0,0,videoElement.videoWidth, videoElement.videoHeight);
                console.log(image.width);
                console.log(image.height);
                console.log(image.width*image.height);
                console.log(image.width*image.height*4);
                console.log(image.data.length);
            }
        }
    }

    function onErrorCallback(error){
        console.log('navigator.getUserMedia error: ', error);
        alert("ERROR");
    }
}





