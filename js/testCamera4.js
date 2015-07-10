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
            //videoElement.addEventListener('click', snapshot, false);
            setTimeout(snapshot, 2000);
        }

        function snapshot() {
            if (stream) {

                /* Définition dynamique de la largeur et de la hauteur visuelles du canvas */

                canvasElement.style.width = videoElement.videoWidth.toString() + "px";
                canvasElement.style.height = videoElement.videoHeight.toString() + "px";

                /* Définition dynamique du nombre de pixels de la zone de dessin du canvas */

                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;

                ctx.drawImage(videoElement, 0, 0);
                //videoElement.style.display = 'none';

                var image = ctx.getImageData(0,0, canvasElement.width, canvasElement.height);

                var nbPoints = 0;
                var nbDarkPoints = 0;
                var nbRedPoints = 0;

                CentreVideo();
                //Bresenham(0, 0, image.width, image.height);

                console.log("Nombre de points : " + nbPoints);
                console.log("Nombre de points rouges : " + nbRedPoints);

                if ( nbRedPoints > nbPoints - nbRedPoints)
                {
                    console.log("ROUGE DETECTE");
                }
                else
                {
                    console.log("RAS");
                }

                setTimeout(snapshot, 5000);
/*                console.log("Nombre de points sombres : " + nbDarkPoints);

                if (nbDarkPoints > nbPoints / 2)
                {
                    console.log("SOMBRE !");
                }
                else
                {
                    console.log("CLAIR !");
                }*/

                //ctx.putImageData(image, 0, 0);

                //canvasElement.style.display = 'block';

                function CentreVideo()
                {
                    var stepX = 3 * (image.width / 8);
                    var stepY = 3 * (image.height / 8);

                    for (var i = 3 * (image.width / 2); i < 5 * (image.width / 2); i+=4)
                    {
                        for (var j = 3 * (image.height / 2) * image.width; j < 5 * (image.height / 2) * image.width; j+=480)
                        {
                            nbPoints++;
                            var red = image.data[i+j];

                            if (red > 192)
                            {
                                nbRedPoints++;
                            }
                        }
                    }
                }

                function tracerPixel(x, y)
                {
                    //console.log("x = " + x + " et y = " + y);
                    var red = image.data[x*4 + y*4*image.width];
                    var green = image.data[x*4 + y*4*image.width + 1];
                    var blue = image.data[x*4 + y*4*image.width + 2];
                    var alpha = image.data[x*4 + y*4*image.width + 3];
                    //console.log("[" + (x*4 + y*4*image.width) + "] R = " + red + " G = " + green + " B = " + blue + " A = " + alpha);

                    nbPoints++;

                    if (red <= 64 && green <= 64 && blue <= 64 )
                    {
                        nbDarkPoints++;
                    }

                    image.data[x*4 + y*4*image.width] = 255;
                    image.data[x*4 + y*4*image.width + 1] = 0;
                    image.data[x*4 + y*4*image.width + 2] = 0;
                    image.data[x*4 + y*4*image.width + 3] = 255;
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

