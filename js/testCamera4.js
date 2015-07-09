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

        videoElement.addEventListener('play', onPlay, false);

        function onPlay()
        {
            canvasElement.style.width = videoElement.videoWidth;
            canvasElement.style.height = videoElement.videoHeight;

            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

            console.log("width : " + canvasElement.width);
            console.log("height : " + canvasElement.height);

            videoElement.addEventListener('click', snapshot, false);
        }

        function snapshot() {
            if (stream) {

                ctx.drawImage(videoElement, 0, 0);
                canvasElement.style.display = 'block';
                videoElement.style.display = 'none';


                /*
                var image = ctx.getImageData(0,0,videoElement.videoWidth, videoElement.videoHeight);

                console.log("videoWidth : " + videoElement.videoWidth);
                console.log("videoHeight : " + videoElement.videoHeight);
                console.log("streamWidth : " + stream.width);
                console.log("streamHeight : " + stream.height);
                console.log("videoElementWidth : " + videoElement.width);
                console.log("videoElementHeight : " + videoElement.height);

                canvasElement.width = image.width;
                canvasElement.height = image.height;



                console.log("Largeur : " + image.width);
                console.log("Hauteur : " + image.height);
                console.log("LxH : " + image.width*image.height);
                console.log("*4 : " + image.width*image.height*4);
                console.log("Taille buffer : " + image.data.length);

                var nbPoints = 0;
                var nbDarkPoints = 0;

                Bresenham(0, 0, image.width, image.height);

                console.log("Nombre de points : " + nbPoints);
                console.log("Nombre de points sombres : " + nbDarkPoints);

                if (nbDarkPoints > nbPoints / 2)
                {
                    console.log("SOMBRE !");
                }
                else
                {
                    console.log("CLAIR !");
                }

                ctx.putImageData(image, 0, 0);

                canvasElement.style.display = 'block';
*/
                function tracerPixel(x, y)
                {
                    console.log("x = " + x + " et y = " + y);
                    var red = image.data[x*4 + y*4*image.width];
                    var green = image.data[x*4 + y*4*image.width + 1];
                    var blue = image.data[x*4 + y*4*image.width + 2];
                    var alpha = image.data[x*4 + y*4*image.width + 3];
                    console.log("[" + (x*4 + y*4*image.width) + "] R = " + red + " G = " + green + " B = " + blue + " A = " + alpha);

                    image.data[x*4 + y*4*image.width] = 255;
                    image.data[x*4 + y*4*image.width + 1] = 0;
                    image.data[x*4 + y*4*image.width + 2] = 0;
                    image.data[x*4 + y*4*image.width + 3] = 255;

                    nbPoints++;

                    if (red <= 32 && green <= 32 && blue <= 32 )
                    {
                        nbDarkPoints++;
                    }
                }

                function Bresenham(x1, y1, x2, y2)
                {
                    var dx, dy;

                    dx = x2 - x1;

                    if ( dx !== 0 )
                    {
                        if ( dx > 0 )
                        {
                            dy = y2 - y1;

                            if ( dy !== 0 )
                            {
                                if ( dy > 0 )           // Vecteur oblique dans le 1er quadran
                                {
                                    if ( dx >= dy )         // Vecteur diagonal ou oblique proche de l'horizontale dans le 1er octant
                                    {
                                        var e = dx;         // e est positif
                                        dx = e * 2;
                                        dy = dy * 2;

                                        while ( true )          // Déplacements horizontaux
                                        {
                                            tracerPixel( x1, y1 );
                                            x1++;

                                            if ( x1 === x2 )
                                            {
                                                break;
                                            }

                                            e = e - dy;

                                            if (e < 0)
                                            {
                                                y1++;           // Déplacement diagonal
                                                e = e + dx;
                                            }
                                        }
                                    }
                                    else            // vecteur oblique proche de la verticale, dans le 2nd octant
                                    {
                                        var e = dy;         // e est positif
                                        dy = e * 2;
                                        dx = dx * 2;

                                        while ( true )          // déplacements verticaux
                                        {
                                            tracerPixel( x1, y1 );
                                            y1++;

                                            if ( y1 === y2 )
                                            {
                                                break;
                                            }

                                            e = e - dx;

                                            if ( e < 0 )
                                            {
                                                x1++;           // déplacement diagonal
                                                e = e + dy;
                                            }
                                        }
                                    }
                                }
                                else            // dy < 0 (et dx > 0) // vecteur oblique dans le 4e cadran
                                {
                                    if ( dx >= -dy )            // vecteur diagonal ou oblique proche de l’horizontale, dans le 8e octant
                                    {
                                        var e = dx;         // e est positif
                                        dx = e * 2;
                                        dy = dy * 2;

                                        while ( true )          // déplacements horizontaux
                                        {
                                            tracerPixel( x1, y1 );
                                            x1++;

                                            if ( x1 === x2 )
                                            {
                                                break;
                                            }

                                            e = e + dy;

                                            if ( e < 0 )
                                            {
                                                y1--;           // déplacement diagonal
                                                e = e + dx;
                                            }
                                        }
                                    }
                                    else            // vecteur oblique proche de la verticale, dans le 7e octant
                                    {
                                        var e = dy;         // e est négatif
                                        dy = e * 2;
                                        dx = dx * 2;

                                        while ( true )          // déplacements verticaux
                                        {
                                            tracerPixel( x1, y1 );
                                            y1--;

                                            if ( y1 === y2 )
                                            {
                                                break;
                                            }

                                            e = e + dx;

                                            if ( e > 0 )
                                            {
                                                x1++;           // déplacement diagonal
                                                e = e + dy;
                                            }
                                        }
                                    }
                                }
                            }
                            else            // dy = 0 (et dx > 0) // vecteur horizontal vers la droite
                            {
                                do
                                {
                                    tracerPixel( x1, y1 );
                                    x1++;
                                } while ( x1 !== x2 );
                            }
                        }
                        else            // dx < 0
                        {
                            dy = y2 - y1;
                            if ( dy !== 0 )
                            {
                                if ( dy > 0 )           // vecteur oblique dans le 2nd quadran
                                {
                                    if ( -dx >= dy )            // vecteur diagonal ou oblique proche de l’horizontale, dans le 4e octant
                                    {
                                        var e = dx;         // e est négatif
                                        dx = e * 2;
                                        dy = dy * 2;

                                        while ( true )          // déplacements horizontaux
                                        {
                                            tracerPixel( x1, y1 );
                                            x1--;

                                            if ( x1 === x2 )
                                            {
                                                break;
                                            }

                                            e = e + dy;

                                            if ( e >= 0 )
                                            {
                                                y1++;           // déplacement diagonal
                                                e = e + dx;
                                            }
                                        }
                                    }
                                    else            // vecteur oblique proche de la verticale, dans le 3e octant
                                    {
                                        var e = dy;         // e est positif
                                        dy = e * 2;
                                        dx = dx * 2;

                                        while ( true )          // déplacements verticaux
                                        {
                                            tracerPixel( x1, y1 );
                                            y1++;

                                            if ( y1 === y2 )
                                            {
                                                break;
                                            }

                                            e = e + dx;

                                            if ( e <= 0 )
                                            {
                                                x1--;           // déplacement diagonal
                                                e = e + dy;
                                            }
                                        }
                                    }
                                }
                                else            // dy < 0 (et dx < 0) // vecteur oblique dans le 3e cadran
                                {
                                    if ( dx <= dy )         // vecteur diagonal ou oblique proche de l’horizontale, dans le 5e octant
                                    {
                                        var e = dx;         // e est négatif
                                        dx = e * 2;
                                        dy = dy * 2;

                                        while ( true )          // déplacements horizontaux
                                        {
                                            tracerPixel( x1, y1 );
                                            x1--;

                                            if ( x1 === x2 )
                                            {
                                                break;
                                            }

                                            e = e - dy;

                                            if ( e >= 0 )
                                            {
                                                y1--;           // déplacement diagonal
                                                e = e + dx;
                                            }
                                        }
                                    }
                                    else            // vecteur oblique proche de la verticale, dans le 6e octant
                                    {
                                        var e = dy;         // e est négatif
                                        dy = e * 2;
                                        dx = dx * 2;

                                        while ( true )          // déplacements verticaux
                                        {
                                            tracerPixel( x1, y1 );
                                            y1--;

                                            if ( y1 === y2 )
                                            {
                                                break;
                                            }

                                            e = e - dx;

                                            if ( e >= 0 )
                                            {
                                                x1--;           // déplacement diagonal
                                                e = e + dy;
                                            }
                                        }
                                    }
                                }
                            }
                            else            // dy = 0 (et dx < 0) // vecteur horizontal vers la gauche
                            {
                                do {
                                    tracerPixel( x1, y1 );
                                    x1--;
                                } while ( x1 !== x2 );
                            }
                        }
                    }
                    else            // dx = 0
                    {
                        dy = y2 - y1;

                        if ( dy !== 0 )
                        {
                            if ( dy > 0 )           // vecteur vertical croissant
                            {
                                do {
                                    tracerPixel( x1, y1 );
                                    y1++;
                                } while ( y1 !== y2);
                            }
                            else            // dy < 0 (et dx = 0) // vecteur vertical décroissant
                            {
                                do {
                                    tracerPixel( x1, y1 );
                                    y1--;
                                } while ( y1 !== y2 );
                            }
                        }
                    }

                    // tracerPixel( x2, y2 );
                }

            }
        }
    }

    function onErrorCallback(error){
        console.log('navigator.getUserMedia error: ', error);
        alert("ERROR");
    }
}

