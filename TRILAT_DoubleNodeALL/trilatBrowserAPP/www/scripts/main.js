
/*----------------------------------------------------------------------------------------------

TRI - ANGULATION  Version 1  - SPLINE EDITOR  zum visualisieren des MOVE


Neuer look: NEW ab 11.12.18
https://threejs.org/examples/#webgl_helpers
https://www.script-tutorials.com/webgl-with-three-js-lesson-3/
https://threejs.org/examples/#webgl_buffergeometry_drawcalls


Former-Version:
04.01.19:

>> TRILAT_2jsVersion_MeterBased_checkCommentInMainJS_OK__070119.zip

Gute Version aber METER ( nach allen Formeln) ist NOCH zu unscharf!
Diese Version basiert auf METER!
Berechnet und mit XY übergeben aus der MS SQL DB
Dort läuf CURSOR durch die DB und glätten die Werte ( KALMAN )
GUT aber durch die logarithmische Formel immer wieder "schwimmende" Koordinaten   - WIRD als ZIP mal "eingefrohren"

Current-Version:
================

07.01.19 -Gehen zurück auf kalmanisierten RSSI!  
Specials:
- SingleNode ( No Double-Node necessary )
- WiFiEventSoftAPModeProbeRequestReceived
- MQTT
- Kalman over RSSI !
- NUR 1 MAC zZ: e8:1f:1f:1f:1f:1f
- VIRTUINO  ( Publish & SUBSCRIBE )
- Node-RED  / Publish: espScan in json:{ "probes":[{"esp":2,"MAC" : "e8:1f:1f:1f:1f:1f","rssiK" :49.48}] }
- Only RSSI ! Distance was not exact enough!
- THIS --> Virtuino/NodeRed  ---> DB
- RAW auf ESP seite: json:{"probes":[{"esp":2,"address":"E81F1F1F1F1F","rssi":-45},{"esp":2,"address":"E81F1F1F1F1F","rssi":-43},{"esp":2,"address":"E81F1F1F1F1F","rssi":-59},{"esp":2,"address":"E81F1F1F1F1F","rssi":-56}]}
- RAW-rssi: 56.00 KALMAN: -49.60 ( dort wird gleich KALMANISIERT )
- geht SO zur DB  ( via NodeReD ) / espScan in json:   { "probes":[{"esp":2,"MAC" : "E81F1F1F1F1F","rssiK" :49.60}] }

State / 07.01.19
adapt this version for dBm instead of Meter 

State / 10.01.19

Wir nehmen den spline editor zum visualisieren des MOVE ( https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_spline_editor.html )  bzw https://threejs.org/examples/#webgl_geometry_spline_editor
Wir sellen gleich auf MQTT um
TriAngel stellt das GleichSchenklige Dreieck dar
Objekte bekommen text-label

state / 12.01.19

Real good move shown with SPLINE ( from spline editor :   https://threejs.org/examples/?q=spline#webgl_geometry_spline_editor )
the spline curve is following where we are movin to!!
Established the DRAG of the ESP-Circle-Positions
DragControls - Take the latest Version
DragGroups: https://jsfiddle.net/prisoner849/sj4p7b0k/



-------------------------------------------------------------------------------------------------------------------------------
*/

//THE HOST IP +  THE HOST IP + THE HOST IP **** OF THE Network where the IIs SERVER with  the REST SERVICE IS RUNNING  ***



var HOST_IP = "YOUR BROWSER IP HERE";		  // MSI

var _REST = new restApiClass();
var _trilaterationMAC_JSON = {};            // ini the empty JSON object - https://coderwall.com/p/_g3x9q/how-to-check-if-javascript-object-is-empty

   

var _currentpeerMACinScan = "";             // die peerMAC, die wir gerade von REST aus der DB "trilateralen"...brauch ich für die Farbe des Gefunden bobbles
var _currentTriPointFromArrayInScan = {};   // object json ein Bubble

//scene
var camera, scene, renderer, clock = new THREE.Clock(), light,
    labelContainer, gui = new dat.GUI({ width: 350 }), stats;
var tcontrols;
var labelRenderer;
var fnh, vnh;

// Raycaster & DRAG Objects & DragControlsDefinition
var _DraggableSceneObjectArray = [];                 

// Mouse ( für die intersections )

var mouse = new THREE.Vector2();
var timestamp = 0;
var scaleVector = new THREE.Vector3();

// ESP - Groups : Radius-Kreis + MittelPunkt + Label + Effekt  

var _ESPOrootGroup = new THREE.Group();      // Hält alles ESP0 Objekte
var _ESP1rootGroup = new THREE.Group();      // Hält alles ESP1 Objekte
var _ESP2rootGroup = new THREE.Group();      // Hält alles ESP2 Objekte

// für das moven...wir speichern immer die letzte position
// GLEICH-SEITIGES DREIECK: h = a/2 . 1,73  ( h = a * 0,86 ) hier + oder - Y 

var _esp0CurrPosX = 0.0, _esp0CurrPosY = 0.0, _esp0CurrPosZ = 0.0;                   // var _esp0CurrPosX = 0, esp0CurrPosY = 0, esp0CurrPosZ = 0;
var _esp1CurrPosX = -10.0, _esp1CurrPosY = 0.0, _esp1CurrPosZ = 0.0;                // war so ok bei dBm :: var esp1CurrPosX = -100, esp1CurrPosY = 0, esp1CurrPosZ = 0;  
var _esp2CurrPosX = -9.0, _esp2CurrPosY = -10.0, _esp2CurrPosZ = 0.0;               // var esp2CurrPosX = -50, esp2CurrPosY = -85, esp2CurrPosZ = 0;

var _centerPointSize = 1;    // das zentrum der ringe
var _triangukationsBobbel = 0.1;   // durchmesser des ROTEN PUNKTES ( intersection bobbel / gefunden Bobbel ..)


// CLASSES

var _fkt;
var _esp;
var _map;

//FILTER & Timer

var MACfilterX = "00:00:00.00";
var divicesFromLastMinutesX = 3;       // e.g. XMinutes
var timerForTheRESTgetCallX = 8000;     // alle X sekunden neuer Datensatz    ****  SNIFFER-TIMER ****

//ALL SPLINE EDITOR Parameters

String.prototype.format = function () {
    var str = this;
    for (var i = 0; i < arguments.length; i++) {
        str = str.replace('{' + i + '}', arguments[i]);
    }
    return str;
};

var splineHelperObjects = [];
var _splinePointsLength = 4;        // initial Points we set
var positions = [];
var point = new THREE.Vector3();
var splineGeometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
var ARC_SEGMENTS = 200;
var splines = {};

//GUI ini parameter

var params = {
    uniform: true,
    tension: 0.01,
    centripetal: true,
    chordal: true,
    addPoint: addPoint,
    removePoint: removePoint,
    removeAllPoints: removeAllPoints,
    exportSpline: exportSpline
};

//  GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO 

init();
animate();

//-----------------------------------------------------------------------------------------------------------------------------



function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('TRIANGULATION').appendChild(renderer.domElement);

    // TEXT LABEL am OBJEKT - Ok  body append ging für dieses Label NICHT ...hing die anwendung bzgl der MausSteuerung  - so geht es :-)
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(labelRenderer.domElement);
    //document.getElementById('container').appendChild(labelRenderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);
   

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 300;
    scene = new THREE.Scene();

    // Light - Light - Light - Light -Light - Light - Light - Light - Light - Light -Light - Light - Light - Light 

    light = new THREE.PointLight();
    light.position.set(200, 200, 150);
    scene.add(light);
    scene.add(new THREE.PointLightHelper(light, 15));

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 0, 1);
    scene.add(dirLight);

    // add hemisphere light
    
    var hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.4);
    hemiLight.color.setHSL(0.6, 1, 0.6);    
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);    
    hemiLight.position.set(-200, 400, -200);    
    this.scene.add(hemiLight);    
    var hlightHelper = new THREE.HemisphereLightHelper(hemiLight, 50, 300); // 50 is sphere size, 300 is arrow length   ----  H E L P E R 
    this.scene.add(hlightHelper);

    //Light 4 Spline 

    scene.add(new THREE.AmbientLight(0xf0f0f0));
    var splineLight = new THREE.SpotLight(0xffffff, 1.5);
    splineLight.position.set(0, 1500, 200);
    splineLight.castShadow = true;
    splineLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000));
    splineLight.shadow.bias = - 0.000222;
    splineLight.shadow.mapSize.width = 1024;
    splineLight.shadow.mapSize.height = 1024;
    scene.add(splineLight);


    //GRID Helper

    var gridHelper = new THREE.GridHelper(300, 40, 0x0000ff, 0x808080);
    gridHelper.position.y = -200;
    gridHelper.position.x = 0;
    scene.add(gridHelper);
   
    

    // mesh.position.set(0, 0, -28);
   // mesh.rotation.x = THREE.Math.degToRad(-90); 
    
      
    
    //SCENE Objects

    scene.add(_ESPOrootGroup);      // ESP: Mittelpunkt.  Radius-Kreis, Effect + Label-Text, Position
    scene.add(_ESP1rootGroup); 
    scene.add(_ESP2rootGroup); 
     
   

    //GUI

    var gui = new dat.GUI();
    //gui.add(params, 'uniform');
    gui.add(params, 'centripetal');
    //gui.add(params, 'chordal');
   
    gui.add(params, 'tension', 0, 1).step(0.01).onChange(function (value) {
       // splines.uniform.tension = value;
        splines.centripetal.tension = value;
        updateSplineOutline();
    });
   
   
    gui.add(params, 'addPoint');
    gui.add(params, 'removePoint');
    gui.add(params, 'removeAllPoints');
    gui.add(params, 'exportSpline');
    gui.open();

   
    //Trackball
    tcontrols = new THREE.TrackballControls(camera, renderer.domElement);
    tcontrols.rotateSpeed = 1.0;
    tcontrols.zoomSpeed = 1.2;
    tcontrols.panSpeed = 0.8;
    tcontrols.noZoom = false;
    tcontrols.noPan = false;
    tcontrols.staticMoving = true;
    tcontrols.dynamicDampingFactor = 0.3;

    //Drag Controls

    var dragControls = new THREE.DragControls(_DraggableSceneObjectArray, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', function () {
        tcontrols.enabled = false;
    });
    dragControls.addEventListener('dragend', function () {
        tcontrols.enabled = true;
    });
   
    //SPLINE EDITOR STUFF   --  TRANSFORM & DRAG  --

    
    /*******
     * Curves
     *********/
    for (var i = 0; i < _splinePointsLength; i++) {
        addSplineObject(positions[i]);
    }
    positions = [];
    for (var ii = 0; ii < _splinePointsLength; ii++) {
        positions.push(splineHelperObjects[ii].position);
    }
    var splGeometry = new THREE.BufferGeometry();
    splGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));
      
    curve = new THREE.CatmullRomCurve3(positions);
    curve.curveType = 'centripetal';
    curve.mesh = new THREE.Line(splGeometry.clone(), new THREE.LineBasicMaterial({
        color: 0x00ff00,
        opacity: 0.35
    }));
     curve.mesh.castShadow = true;
    splines.centripetal = curve;
    
    
    for (var k in splines) {
        var spline = splines[k];
        scene.add(spline.mesh);
    }
   

     load([new THREE.Vector3(-1.700483634830107, -0.00410967216136271, 0), new THREE.Vector3(-0.9416818794973167, -0.00410967216136271, 0), new THREE.Vector3(-4.870975811713592, 0.4558012258668178, 0), new THREE.Vector3(-9.464213018980047, 0.7406848425052104, 0)]);

    // SPLINE END   SPLINE END   SPLINE END   SPLINE END  

    //ESPmesh : (labelName, radius, orbitDist, speed, posOnX, posOnY, posOnZ)

    _fkt = new commonFktClass();
    _esp = new ESPmeshClass();    
    

    startInterval();
    _fkt.setLoadMessage("ERASE");
    _REST.makeCorsRequest4TrilaterationData(divicesFromLastMinutesX);   // Neue Daten Holen..

}

//SPLINE EDIT START


//Bekommt dann noch den Namen ( MAC )
function addSplineObject(position) {
    var material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    var object = new THREE.Mesh(splineGeometry, material);     
    object.castShadow = true;
    object.receiveShadow = true;
    object.name = 'splCube_' + _splinePointsLength; 
    scene.add(object);
    splineHelperObjects.push(object);
    
    return object;
}

function addPoint(x,y) {
    _splinePointsLength++;
    var o = addSplineObject();

    o.position.x = x;               // Math.random() * 1000 - 500;
    o.position.y = y;               // Math.random() * 600;
    o.position.z = 0;              //Math.random() * 800 - 400;
    positions.push(o.position);
    updateSplineOutline();

    document.getElementById("SplineSegmentCounter").innerHTML = _splinePointsLength;
}



function removePoint() {
    if (_splinePointsLength <= 4) {
        return;
    }
    _splinePointsLength--;
    positions.pop();
    scene.remove(splineHelperObjects.pop());
    updateSplineOutline();
} 

function removeAllPoints() {

    var pl = _splinePointsLength;
    for (var i = 0; i <= pl; i++) {
        if (_splinePointsLength <= 4) {
            return;
        }
        _splinePointsLength--;
        positions.pop();
        scene.remove(splineHelperObjects.pop());
        updateSplineOutline();
    }
   
}

function updateSplineOutline() {
    for (var k in splines) {
        var spline = splines[k];
        var splineMesh = spline.mesh;
        var position = splineMesh.geometry.attributes.position;
        for (var i = 0; i < ARC_SEGMENTS; i++) {
            var t = i / (ARC_SEGMENTS - 1);
            spline.getPoint(t, point);
            position.setXYZ(i, point.x, point.y, 0);                                        // wir haben kein Z !! originale:  position.setXYZ(i, point.x, point.y, point.z);
        }
        position.needsUpdate = true;
    }
}
function exportSpline() {
    var strplace = [];
    for (var i = 0; i < _splinePointsLength; i++) {
        var p = splineHelperObjects[i].position;
        strplace.push('new THREE.Vector3({0}, {1}, {2})'.format(p.x, p.y, 0));            // wir haben kein Z !! strplace.push('new THREE.Vector3({0}, {1}, {2})'.format(p.x, p.y, p.z));
    }
    console.log(strplace.join(',\n'));
    var code = '[' + (strplace.join(',\n\t')) + ']';
    prompt('copy and paste code', code);
}

function load(new_positions) {
    while (new_positions.length > positions.length) {
        addPoint();
    }
    while (new_positions.length < positions.length) {
        removeAllPoint();
    }
    for (var i = 0; i < positions.length; i++) {
        positions[i].copy(new_positions[i]);
    }
    updateSplineOutline();
}



//SPLINE EDIT END   SPLINE EDIT END   SPLINE EDIT END


// NEW:: der Timer ist eine art watchDog...der trilatPoint kann UNTER einer SEKUNDE ermittelt werden..wenn out of Time: Neue Datensätze holen
function startInterval() {
    RESTinterval = setInterval(function () {
        stopInterval();
         //  issue bzgl. Nachladen via REST -  wenn das zu kurz hinter einander passiert, dann gibt es deadLOCK´s !!
        _trilaterationMAC_JSON = {};          
        _REST.makeCorsRequest4TrilaterationData(divicesFromLastMinutesX);               // Neue Daten Holen im Main-LOOP...Alternativ über den TIMER  
            
        startInterval();
    }, timerForTheRESTgetCallX);
}

function stopInterval() {
    clearInterval(RESTinterval);
}

//___________________________________________________________________________________________________________

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = event.clientX / window.innerWidth * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}


function animate() {   
    requestAnimationFrame(animate);
    // Update some Info :

    document.getElementById("winInnerWH").innerHTML = "Width=" + window.innerWidth + " Height=" + window.innerHeight;   
  
   
    // Render , trackball, stats   
    render();   
    stats.update();
    camera.updateMatrixWorld();
}

function render() {
   
    splines.centripetal.mesh.visible = params.centripetal;
    tcontrols.update(); 
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

