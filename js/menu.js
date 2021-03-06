/**
 * Created by buecher on 29/06/15.
 */

Menu = {};

Menu.simpleView = document.getElementById('simpleview');
Menu.multiView = document.getElementById('multiview');
Menu.oculus = document.getElementById('oculus');
Menu.cardboard = document.getElementById('cardboard');

Menu.simpleView.addEventListener('click', initSimpleView, false);
Menu.multiView.addEventListener('click', initMultiView, false);
Menu.oculus.addEventListener('click', initOculus, false);
Menu.cardboard.addEventListener('click', initCardboard, false);

function initSimpleView()
{

    if ( App.currentDisplay == App.DisplayType.SIMPLEVIEW )
    {

        /* Disparition du menu */

        document.getElementById('blocker').style.display = 'none';

        /* Activation des contrôles */

        App.controlsEnabled = true;

    }
    else
    {

        /* Interruption de la boucle de rendu en cours s'il y a lieu */

        if ( App.currentDisplay !== App.DisplayType.UNKNOWN )
        {
            cancelAnimationFrame(App.requestId);
            document.body.removeChild( App.renderer.domElement );
            document.body.removeChild( Gui.stats.domElement );
            //document.getElementById('colorPickingTexture').removeChild(App.colorPickingRenderer.domElement);
            Gui.gui.destroy();
            Camera.fpControls = undefined;
            Camera.controls = undefined;
        }

        /* Enregistrement du choix */

        App.currentDisplay = App.DisplayType.SIMPLEVIEW;

        /* Disparition du menu */

        document.getElementById('blocker').style.display = 'none';

        /* Initialisation de la scène */

        setupScene();
        setupcamera();
        setupGUI();

        initEventhandling();

        if (App.autoLoadData)
        {
            loadBinaryFiles(App.startFiles);
        }

        /* Activation des contrôles */

        App.controlsEnabled = true;

        /* Lancement de la boucle de rendu */

        render();

    }

}

function initMultiView()
{

    if ( App.currentDisplay == App.DisplayType.MULTIVIEW )
    {

        /* Disparition du menu */

        document.getElementById('blocker').style.display = 'none';

        /* Activation des contrôles */

        App.controlsEnabled = true;

    }
    else {

        /* Interruption de la boucle de rendu en cours s'il y a lieu */

        if (App.currentDisplay !== App.DisplayType.UNKNOWN) {
            cancelAnimationFrame(App.requestId);
            document.body.removeChild( App.renderer.domElement );
            document.body.removeChild( Gui.stats.domElement );
            //document.getElementById('colorPickingTexture').removeChild(App.colorPickingRenderer.domElement);
            Gui.gui.destroy();
            Camera.fpControls = undefined;
            Camera.controls = undefined;
        }

        /* Enregistrement du choix */

        App.currentDisplay = App.DisplayType.MULTIVIEW;

        /* Disparition du menu */

        document.getElementById('blocker').style.display = 'none';

        /* Initialisation de la scène */

        setupScene();
        setupcamera();
        setupGUI();

        initEventhandling();

        if (App.autoLoadData)
        {
            loadBinaryFiles(App.startFiles);
        }

        /* Activation des contrôles */

        App.controlsEnabled = true;

        /* Lancement de la boucle de rendu */

        render();

    }

}

function initOculus()
{

    alert("Fonctionnalité en cours de développement !");

}

function initCardboard()
{

    if (isMobile.any())
    {
        if (App.currentDisplay == App.DisplayType.CARDBOARD) {

            /* Disparition du menu */

            document.getElementById('blocker').style.display = 'none';

            /* Activation des contrôles */

            App.controlsEnabled = true;

        }
        else
        {
            /* Interruption de la boucle de rendu en cours s'il y a lieu */

            if (App.currentDisplay !== App.DisplayType.UNKNOWN) {
                cancelAnimationFrame(App.requestId);
                document.body.removeChild(App.renderer.domElement);
                document.body.removeChild(Gui.stats.domElement);

                Camera.fpControls = undefined;
                Camera.controls = undefined;
            }

            /* Enregistrement du choix */

            App.currentDisplay = App.DisplayType.CARDBOARD;

            /* Disparition du menu */

            document.getElementById('blocker').style.display = 'none';

            /* Initialisation de la scène */

            setupScene();
            setupcamera();

            initEventhandling();

            if (App.autoLoadData) {
                loadBinaryFiles(App.startFiles);
            }

            /* Initialisation de l'effet stéréo */

            Camera.effect = new THREE.StereoEffect(App.renderer);
            Camera.effect.setSize(App.width, App.height);
            Camera.effect.eyeSeparation = 0.01;

            /* Initialisation du contrôle par orientation du mobile */

            function setOrientationControls(e) {

                if (!e.alpha) {
                    return;
                }

                Camera.controls = new THREE.DeviceOrientationControls(Camera.camera, true);                   // Contrôles par orientation du mobile
                Camera.controls.connect();                                                             // Initialisation
                Camera.controls.update();                                                              // Mise à jour

                App.renderer.domElement.addEventListener('click', fullscreen, false);                           // Passage en mode plein écran pour les mobiles

                window.removeEventListener('deviceorientation', setOrientationControls, true);  // Suppression de l'événement

            }

            window.addEventListener('deviceorientation', setOrientationControls, true);         // Mise en place des contrôles pour mobile si détection de mobile compatible

            /* Activation des contrôles */

            App.controlsEnabled = true;

            /* Lancement de la boucle de rendu */

            render3();
        }
    }
    else
    {

        if (App.currentDisplay == App.DisplayType.CARDBOARD) {

            /* Disparition du menu */

            document.getElementById('blocker').style.display = 'none';

            /* Activation des contrôles */

            App.controlsEnabled = true;

        }
        else {

            /* Interruption de la boucle de rendu en cours s'il y a lieu */

            if (App.currentDisplay !== App.DisplayType.UNKNOWN) {
                cancelAnimationFrame(App.requestId);
                document.body.removeChild(App.renderer.domElement);
                document.body.removeChild(Gui.stats.domElement);
                //document.getElementById('colorPickingTexture').removeChild(App.colorPickingRenderer.domElement);
                Gui.gui.destroy();
                Camera.fpControls = undefined;
                Camera.controls = undefined;
            }

            /* Enregistrement du choix */

            App.currentDisplay = App.DisplayType.CARDBOARD;

            /* Disparition du menu */

            document.getElementById('blocker').style.display = 'none';

            /* Initialisation de la scène */

            setupScene();
            setupcamera();
            setupGUI();

            initEventhandling();

            if (App.autoLoadData) {
                loadBinaryFiles(App.startFiles);
            }

            /* Initialisation de l'effet stéréo */

            Camera.effect = new THREE.StereoEffect(App.renderer);
            Camera.effect.setSize(App.width, App.height);
            Camera.effect.eyeSeparation = 0.01;

            /* Initialisation du contrôle par orientation du mobile */

            function setOrientationControls(e) {

                if (!e.alpha) {
                    return;
                }

                Camera.controls = new THREE.DeviceOrientationControls(Camera.camera, true);                   // Contrôles par orientation du mobile
                Camera.controls.connect();                                                             // Initialisation
                Camera.controls.update();                                                              // Mise à jour

                App.renderer.domElement.addEventListener('click', fullscreen, false);                           // Passage en mode plein écran pour les mobiles

                window.removeEventListener('deviceorientation', setOrientationControls, true);  // Suppression de l'événement

            }

            window.addEventListener('deviceorientation', setOrientationControls, true);         // Mise en place des contrôles pour mobile si détection de mobile compatible

            /* Activation des contrôles */

            App.controlsEnabled = true;

            /* Lancement de la boucle de rendu */

            render3();

        }
    }
}

function render2() {
    App.requestId = requestAnimationFrame(function (){
        render2();
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
                App.uniforms.t.value = 1.0;//TODO go back to static mode ?
                computePositions();
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

    Camera.effect.render( App.scene, Camera.camera );
    Camera.controls.update(App.clock.getDelta());
}

//document.getElementById('timeline').addEventListener('click', function() { document.getElementById('blocker').style.display = 'initial'; App.controlsEnabled = false; }, false);

/* Fonction permettant le passage en mode plein écran */

function fullscreen()
{

    if (screenfull.enabled)
    {
        screenfull.request(document.body);
    }
    else
    {
        alert("Impossible de passer en mode plein écran.");
    }
}

function render3() {
    App.requestId = requestAnimationFrame(function (){
        render3();
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

    //Gui.stats.update();
    showDebugInfo();

    //App.colorPickingRenderer.render(App.colorPickerSprite, Camera.camera);
    //getColorPickingPointCloudIntersectionIndex();

    Camera.effect.render( App.scene, Camera.camera );
    if(App.CAMERAISFREE) {
        if (App.autoWalk)
        {
            go();
        }
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

function go()
{
    var direction = Camera.camera.getWorldDirection().normalize();
    Camera.camera.position.set(
        Camera.camera.position.x + direction.x / 1000,
        Camera.camera.position.y + direction.y / 1000,
        Camera.camera.position.z + direction.z / 1000
    );
}