/**
 * Created by lespingal on 17/06/15.
 */

/**
 * @author Arnaud Steinmetz <s.arnaud67@hotmail.fr>
 * @description Function that is used to refresh the renderer
 */
function render() {
    App.requestId = requestAnimationFrame(function (){
        render();
    });

    if(App.ANIMATION && App.PLAY) {
        if (App.uniforms.t.value < 1.0) {
            App.uniforms.t.value += App.parameters.speed/100;
        } else {
            if(App.parameters.posSnapShot + 2 < App.parameters.nbSnapShot) {
                App.uniforms.t.value = 0.0;
                App.parameters.posSnapShot++;
                App.data.departureArray = App.data.positionsArray[App.parameters.posSnapShot];
                App.data.directionArray = App.data.directionsArray[App.parameters.posSnapShot];
                App.animationBufferGeometry.attributes.position = new THREE.BufferAttribute(App.data.departureArray, 3);
                App.animationBufferGeometry.attributes.position.needsUpdate = true;
                App.animationBufferGeometry.attributes.endPosition = new THREE.BufferAttribute(App.data.directionArray, 3);
                App.animationBufferGeometryPointCloud.geometry.attributes.endPosition.needsUpdate = true;
            }else{
                App.uniforms.t.value = 1.0;
                computePositions();//Let's go back to static mode
                enableMouseEventHandling();
                App.PLAY = false;
            }
        }
    }

    //Display information about selected particles - take an average of 1ms
    if(App.selection != null){
        showSelectedInfo(App.selection);
    }
    if(App.intersection != null){
        showIntersectedInfo(App.intersection);
    }

    Gui.stats.update();
    showDebugInfo();

    //App.colorPickingRenderer.render(App.colorPickerSprite, Camera.camera);
    //getColorPickingPointCloudIntersectionIndex();

    if(App.pointCloud != null) {
        App.drawCalls = [];
        cullFromFrustum(App.octree);
        App.staticBufferGeometry.offsets = App.staticBufferGeometry.drawcalls = [];
        for (var i = 0; i < App.drawCalls.length; i++) {
            App.staticBufferGeometry.addDrawCall(App.drawCalls[i].start / 3, App.drawCalls[i].count / 3, App.drawCalls[i].start / 3);
        }
    }

    App.renderer.render( App.scene, Camera.camera );
    if(App.CAMERAISFREE) {
        Camera.controls.update(App.clock.getDelta());
    }else{
        Camera.time += 1/60;
        if(Camera.time < 1.0) {
            Camera.camera.position.set(Camera.origin.x + Camera.time * Camera.objectif.x,
                Camera.origin.y + Camera.time * Camera.objectif.y,
                Camera.origin.z + Camera.time * Camera.objectif.z);
        }else{
            console.log(Camera.camera.position);
            App.CAMERAISFREE = true;
        }
    }
}

/**
 * @author Pierre Lespingal
 * @description Display infos about the particle currently under the mouse
 * @param el
 */
function showSelectedInfo(el){
    var vec3 = new THREE.Vector3(App.data.currentPositionArray[el.index*3], App.data.currentPositionArray[el.index*3 + 1], App.data.currentPositionArray[el.index*3 + 2]);
    var vec2 = worldToScreen(vec3);
    var div = document.getElementById('info_selected');
    div.style.top = vec2.y + 'px';
    div.style.left = vec2.x + 'px';
    div.innerHTML = vec3.distanceTo(Camera.camera.position);
}

/**
 * @author Pierre Lespingal
 * @description Display infos about the selected particle
 * @param el
 */
function showIntersectedInfo(el){
    var vec3 = new THREE.Vector3(App.data.currentPositionArray[el.index*3], App.data.currentPositionArray[el.index*3 + 1], App.data.currentPositionArray[el.index*3 + 2]);
    var vec2 = worldToScreen(vec3);
    var div = document.getElementById('info_intersected');
    div.style.top = vec2.y + 'px';
    div.style.left = vec2.x + 'px';
    div.innerHTML = vec3.distanceTo(Camera.camera.position);
}

/**
 * @author Pierre lespingal
 * @description remove the pointCloud from the scene
 * @detail Care not to delete other object
 */
App.clearPointCloud = function(){
    if(App.scene.children.length != 1)
    {
        var nbChildToDelete = App.scene.children.length;
        var numChildToDelete = 1;
        //Beginning the loop at 1 to avoid deleting the AxisHelper
        for(var i = 1; i < nbChildToDelete;i++)
        {
            //Always deleting the second Object of the scene, because on each delete, it refreshes the children Array.
            if(App.scene.children[numChildToDelete].type == "PointCloud")
            {
                App.scene.remove(App.scene.children[numChildToDelete]);
            }
            else{
                numChildToDelete++;
            }

        }
    }
};

/**
 * @author Arnaud Steinmetz <s.arnaud67@hotmail.fr>
 * @description adds the attributes to the geometry and adds the PointCloud to the scene
 */
function loadData(){

    if(App.parameters.nbSnapShot == 0) {    //If it's the first time, let's set things up for static shadering
        var i = 0;

        //
        App.staticBufferGeometry = new THREE.BufferGeometry();

        App.staticBufferGeometry.addAttribute('position', new THREE.BufferAttribute(App.data.currentPositionArray, 3));
        App.staticBufferGeometry.addAttribute('color' , new THREE.BufferAttribute( App.data.color, 3));

        App.staticBufferGeometry.computeBoundingSphere();

        App.staticBufferGeometry.addDrawCall(0, App.parameters.nbPoint, 0);
        //App.staticBufferGeometry.addDrawCall(2097152/2, 2097152/2, 2097152/2);

        console.log(App.staticBufferGeometry.drawcalls);

        if(App.FOG){
            App.staticBufferGeometryPointCloud = new THREE.PointCloud(App.staticBufferGeometry, App.staticFogShaderMaterial);
        }else{
            App.staticBufferGeometryPointCloud = new THREE.PointCloud(App.staticBufferGeometry, App.staticShaderMaterial);
        }

        //computePositions();

        //
        /*App.colorPickerBufferGeometry = new THREE.BufferGeometry();

        App.departureArray = App.data.positionsArray[App.parameters.nbSnapShot - 1];
        App.colorPickerBufferGeometry.addAttribute('position', new THREE.BufferAttribute(App.data.departureArray, 3));
        App.departureArray = App.data.positionsArray[App.parameters.nbSnapShot - 1];
        App.colorPickerBufferGeometry.addAttribute('endPosition', new THREE.BufferAttribute(App.data.positionsArray[App.parameters.nbSnapShot], 3));
        App.colorPickerBufferGeometry.addAttribute('colorIndex', new THREE.BufferAttribute(App.data.colorIndex, 3));

        App.colorPickerBufferGeometryPointCloud = new THREE.PointCloud(App.colorPickerBufferGeometry, App.colorPickerShaderMaterial);*/

        //

        App.pointCloud = App.staticBufferGeometryPointCloud;

        App.scene.add(App.pointCloud);
        //App.colorPickerScene.add(App.colorPickerBufferGeometryPointCloud);

        //TODO disable all events related to animation


    }else if(App.parameters.nbSnapShot == 1){   //if it's just the second time, it's animated shadering turn

        //
        App.animationBufferGeometry = new THREE.BufferGeometry();

        App.data.departureArray = App.data.positionsArray[App.parameters.nbSnapShot - 1];
        App.data.directionArray = App.data.directionsArray[App.parameters.nbSnapShot - 1];

        App.animationBufferGeometry.addAttribute('position' , new THREE.BufferAttribute( App.data.departureArray, 3 ));
        App.animationBufferGeometry.addAttribute('endPosition' , new THREE.BufferAttribute( App.data.directionArray, 3 ));
        App.animationBufferGeometry.addAttribute('color' , new THREE.BufferAttribute( App.data.color, 3 ));

        App.animationBufferGeometry.drawcalls.push({
            start: 0,
            count: App.parameters.nbPoint,
            index: 0
        });

        if(App.fog){
            App.animationBufferGeometryPointCloud = new THREE.PointCloud(App.animationBufferGeometry, App.animatedFogShaderMaterial);
        }else{
            App.animationBufferGeometryPointCloud = new THREE.PointCloud(App.animationBufferGeometry, App.animatedShaderMaterial);
        }

        App.ANIMATION = true;

        //TODO enable events related to animation

    }else{  //if we're used to it, no big deal

    }


}

/**
 * @author Pierre Lespingal
 * @description Compute within the CPU the current position of each particle - takes between 10 and 20 ms
 */
function computePositions(){
    var progressBar = document.getElementById('fileLoadingProgress');
    progressBar.value = 0;
    App.timer.start();
    progressBar.style.display = 'block';
    var length = App.data.currentPositionArray.length / 3;
    var i;
    for(i = 0; i < length;i++) {
        App.data.currentPositionArray[i * 3] = App.data.departureArray[i * 3] + App.uniforms.t.value * App.data.directionArray[i * 3];
        App.data.currentPositionArray[i * 3 + 1] = App.data.departureArray[i * 3 + 1] + App.uniforms.t.value * App.data.directionArray[i * 3 + 1];
        App.data.currentPositionArray[i * 3 + 2] = App.data.departureArray[i * 3 + 2] + App.uniforms.t.value * App.data.directionArray[i * 3 + 2];
    }

    progressBar.value = 10;

    var newPos = createOctreeFromPos(App.data.currentPositionArray);

    progressBar.value = 80;
    length = newPos.length;
    for(i = 0; i < length;i++){
     App.data.currentPositionArray[i] = newPos[i];
     }
    newPos = null;

    progressBar.value = 90;

    App.staticBufferGeometry.attributes.position.needsUpdate = true;
    setStaticShaderMode();
    progressBar.value = 100;
    App.timer.stop("recomputing position");
    progressBar.style.display = 'none';
}

/**
 * @author Pierre Lespingal, based on Ian Webster work on timed array processing, based on a Nicholas Zakas article
 * @description compute position while let the UI update himself often enough
 * @detail only usefull if the computing is very long, timed array processing is longer than without timout, only smoother to the user
 */
function timedChunckComputePositions(){
    var i = 0;
    App.timer.start();
    var tick = function(){
        var start = new Date().getTime();
        //var time = App.uniforms.t.value - lastTime;
        for(;i < App.data.currentPositionArray.length / 3 && (new Date().getTime()) - start < 50;i++){
            App.data.currentPositionArray[i * 3] = App.data.positionsArray[App.parameters.posSnapShot][i * 3] + App.uniforms.t.value * App.data.directionsArray[App.parameters.posSnapShot][i * 3];
            App.data.currentPositionArray[i * 3 + 1] = App.data.positionsArray[App.parameters.posSnapShot][i * 3 + 1] + App.uniforms.t.value * App.data.directionsArray[App.parameters.posSnapShot][i * 3 + 1];
            App.data.currentPositionArray[i * 3 + 2] = App.data.positionsArray[App.parameters.posSnapShot][i * 3 + 2] + App.uniforms.t.value * App.data.directionsArray[App.parameters.posSnapShot][i * 3 + 2];
        }
        if(i < App.data.currentPositionArray.length / 3){
            App.staticBufferGeometry.attributes.position.needsUpdate = true;
            setTimeout(tick, 1);
        }else{
            App.staticBufferGeometry.attributes.position.needsUpdate = true;
            setStaticShaderMode();
            App.timer.stop("compute positions");
            //lastTime = t;
        }
    };
    setTimeout(tick, 1);
}

/**
 * @author Pierre Lespingal
 * @description set the pointCloud in a way the positions are computed within the shader, at each frame
 * @detail The raytracer is no longer effective
 */
function setAnimationShaderMode(){
    App.scene.remove(App.pointCloud);
    App.pointCloud = App.animationBufferGeometryPointCloud;
    if(App.FOG){
        App.pointCloud.material = App.animatedFogShaderMaterial;
    }else{
        App.pointCloud.material = App.animatedShaderMaterial;
    }
    App.animationBufferGeometry.attributes.color.needsUpdate = true;
    App.scene.add(App.pointCloud);
}

/**
 * @author Pierre Lespingal
 * @description set the pointCloud in a way the positions have been already computed once within the CPU, then the current position is sent to the graphic pipeline
 * @detail Since the position aren't computed again, the animation of the particle won't be rendered
 */
function setStaticShaderMode(){
    App.scene.remove(App.pointCloud);
    App.pointCloud = App.staticBufferGeometryPointCloud;
    if(App.FOG){
        App.pointCloud.material = App.staticFogShaderMaterial;
    }else{
        App.pointCloud.material = App.staticShaderMaterial;
    }
    App.scene.add(App.pointCloud);
}

var videoElement = document.getElementById('color-detection-video');
var canvasElement = document.getElementById('color-detection-canvas');
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
                start(videoSources[0]);
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

App.addScript(name, script, true);
App.addScript(name2, script2, false);

initFileReading();

if (isMobile.any())
{
    initCardboard();
}
else
{
    initSimpleView();
}

function start(videoId) {
    if (!!window.stream) {
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

    function onSuccessCallback(stream) {
        window.stream = stream;
        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();

        videoElement.addEventListener('play', onPlay, false);

        function onPlay() {
            //videoElement.addEventListener('click', snapshot, false);
            setTimeout(snapshot, 1000);
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

                var image = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);

                var nbPoints = 0;
                var nbDarkPoints = 0;
                var nbRedPoints = 0;

                CentreVideo();

                //console.log("Nombre de points : " + nbPoints);
                //console.log("Nombre de points rouges : " + nbRedPoints);

                if (nbRedPoints > nbPoints - nbRedPoints) {
                    App.autoWalk = App.autoWalk ? false : true;
                    App.autoWalk ? console.log("DEMARRE") : console.log("ARRETE");
                    setTimeout(snapshot, 1000);
                }
                else {
                    console.log("RAS");
                    setTimeout(snapshot, 250);
                }

                //ctx.putImageData(image, 0, 0);

                //canvasElement.style.display = 'block';

                function CentreVideo() {
                    //console.log("R = " + (image.data[3 * (image.width / 2) + 3 * (image.height / 2) * image.width]));
                    //console.log("G = " + (image.data[3 * (image.width / 2) + 1 + 3 * (image.height / 2) * image.width]));
                    //console.log("B = " + (image.data[3 * (image.width / 2) + 2 + 3 * (image.height / 2) * image.width]));

                    for (var i = 3 * (image.width / 2); i < 5 * (image.width / 2); i += 4) {
                        for (var j = 3 * (image.height / 2) * image.width; j < 5 * (image.height / 2) * image.width; j += 4 * image.width) {
                            nbPoints++;
                            var red = image.data[i + j];
                            var green = image.data[i + j + 1];
                            var blue = image.data[i + j + 2];

                            if (red > 192 && green < 128 && blue < 128) {
                                nbRedPoints++;
                            }

                            image.data[i + j] = 255;
                            image.data[i + j + 1] = 0;
                            image.data[i + j + 2] = 0;
                        }
                    }
                }
            }
        }
    }

    function onErrorCallback(error) {
        console.log('navigator.getUserMedia error: ', error);
        alert("ERROR");
    }
}