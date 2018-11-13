
/*----------------------------------------------------------------------------------------------

TRI - ANGULATION

			
ToDo: HelperClass: https://threejs.org/examples/?q=helper#webgl_helpers
DickeLinien gehen mit : https://github.com/spite/THREE.MeshLine
				  
Version ist ein gute Kompromiss !! erkennt aber nur die RAY-Punkte auf den KURVEN!
Speed darf nicht HOCH sein!!
SUPER - nach unendlichen Versuchen und tests ...ALLE punkte werden erkannt ..auch nach versetzen der Signale!!#


ToDo:
https://stackoverflow.com/questions/24791010/how-to-find-the-coordinate-that-is-closest-to-the-point-of-origin
https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_voxelpainter.html

sources:

2 dim array : https://stackoverflow.com/questions/7030229/storing-coordinates-in-array-in-javascript
Rotierender Punkt auf Kreisbahn /  ESP1 - verschiedene möglichkeiten -  : https://jsfiddle.net/prisoner849/a2ogz9vx/
			
-------------------------------------------------------------------------------------------------------------------------------*/

//THE HOST IP +  THE HOST IP + THE HOST IP **** OF THE Network where the IIs SERVER with  the REST SERVICE IS RUNNING  ***

/

var HOST_IP = "192.16xxxxxxx2";		 

var _REST = new restApiClass();


/*
var txtTEST = '{"employees":[' +
    '{"firstName":"Jerry","lastName":"Negrell","time":"9:15 am","email":"jerry@bah.com","phone":"800-597-9405","image":"images/jerry.jpg" },' +
    '{"firstName":"Ed","lastName":"Snide","time":"9:00 am","email":"edward@bah.com","phone":"800-597-9406","image":"images/ed.jpg" },' +
    '{"firstName":"Pattabhi","lastName":"Nunn","time":"10:15 am","email":"pattabhi@bah.com","phone":"800-597-9407","image":"images/pattabhi.jpg" }' +
    ']}';
*/

var _trilaterationMAC_JSON = {};            // ini the empty JSON object - https://coderwall.com/p/_g3x9q/how-to-check-if-javascript-object-is-empty

//https://www.quora.com/I-want-to-add-a-new-JSON-object-to-the-already-existing-JSON-Array-What-are-some-suggestions
//infos werden hier gespeichert: ESPmeshClass.prototype.setTriAngulationPoint = function (x, y, z, color) --  Zum Mitschreiben der finalen Bubbles ( deviceCoordinaten dist0  ..dist2 / MAC)
var _triBubblesLogJson = {};      

var _currentpeerMACinScan = "";             // die peerMAC, die wir gerade von REST aus der DB "trilateralen"...brauch ich für die Farbe des Gefunden bobbles
var _currentTriPointFromArrayInScan = {};   // object json ein Bubble

//scene
var camera, scene, renderer, clock = new THREE.Clock(),
    controls, container, gui = new dat.GUI({ width: 350 });   

// Raycaster
var raycasterNull;              // für die ESP kringel
var raycasterOne;
var raycasterTwo;
var INTERSECTED_NULL, INTERSECTED_ONE, INTERSECTED_TWO;
var collidableMeshList = [];                        // Da sind NUR die CIRCLEs drin 3 x 

var _INTERSECTED__TrilatPoint;
var _raycaster_TrilatPoint;                         // für die roten bobbel   trilat-punkte 
var _collidableMeshList_4_TrilatPoints = [];        // WICHTIG..der ROTE TRILAT-POINT auf der MAP
var _nearestNeighborDistX = 1.5;                    // unterhalb diesem wert das double bobble raus werfen

var _ESP0_IntersectionObjectsMESH_BUFFER = [];      // hier kommen die intersection kegel rein
var _ESP1_IntersectionObjectsMESH_BUFFER = [];
var _ESP2_IntersectionObjectsMESH_BUFFER = [];


// Mouse ( für die intersections )

var mouse = new THREE.Vector2();
var timestamp = 0;
var scaleVector = new THREE.Vector3();

// das sind die 3 mesh(en) mit dem kreis und den rotierenden Kegeln

var esp0CenterMesh, esp1CenterMesh, esp2CenterMesh;     // Mittelpunkt der wsp Mesh
var ESP0circle, ESP1circle, ESP2circle;		            // circle
var ESP1kegel, ESP2kegel;

var _ESP0circle_posX = 0;
var _ESP0circle_posY = 0;

var _ESP_ANZAHL_TRILAT_PUNKTE = 25;                      // anzahl der Trilat-PYLONE auf der Kreisbahn


// für das moven...wir speichern immer die letzte position
// GLEICH-SEITIGES DREIECK: h = a/2 . 1,73  ( h = a * 0,86 ) hier + oder - Y 

var esp0CurrPosX = 0, esp0CurrPosY = 0, esp0CurrPosZ = 0;
var esp1CurrPosX = -100, esp1CurrPosY = 0, esp1CurrPosZ = 0;
var esp2CurrPosX = -50, esp2CurrPosY = -85, esp2CurrPosZ = 0;

var centerPointSize = 1;    // das zentrum der ringe
var espMarkerMeshPointSize = 2; // die kleinen bubbles die bei hit gesetzt werden
var _triangukationsBobbel = 1;   // durchmesser des ROTEN PUNKTES ( intersection bobbel / gefunden Bobbel ..)
var circlePointSpeed = 3;      // speed de kegels auf der kreisbahn

// PYLONE
var _cylinderRadiusTop = 0.1;     // Parameter für die Cylinder auf der KreisBahn um den ESP
var _cylinderRadiusBottom = 1;
var _cylinderHeight = 3;
var _cylinderRadialSegments = 18; // ok: 17 /

// Die MESH, die zB den Grundriss eines MessPlans zeigt

var planeImageMesh1;
var _triangleMesh;          // rotes Kontroll-Dreieck

// Arrays für die ScanDaten

var triangularCoords = [];		// zwischenPuffer um die Coordinaten nach der TRHEE angulation zu speichern
var hitBubbleMeshGroup = [];     
var _tracePointCounter = 0;      // der finale rote gefundene punkt

var _testBubbleMeshGroup = [];  // Bobble-Buffer für tests

// CLASSES

var _fkt;
var _ray;
var _esp;
var _map;

//MESH

var esp0Group = new THREE.Group();      // Hält alles ESP0 Objekte
var esp1Group = new THREE.Group();      // Hält alles ESP1 Objekte
var esp2Group = new THREE.Group();      // Hält alles ESP2 Objekte


//FILTER & Timer

var MACfilterX = "00:00:00.00";
var divicesFromLastMinutesX = 3;       // e.g. XMinutes
var timerForTheRESTgetCallX = 12000;     // alle X sekunden neuer Datensatz    ****  SNIFFER-TIMER ****

// special Material

var sphereMaterial = new THREE.MeshBasicMaterial({
    color: 'grey',
    wireframe: true,
    wireframeLinewidth: 0.1,
    transparent: true,
    opacity: 0.3
    //side: THREE.BackSide
});

//  GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO GO 

init();
animate();

//-----------------------------------------------------------------------------------------------------------------------------




function init() {

    
    scene = new THREE.Scene();   
    scene.background = new THREE.Color('grey');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 600;	
    camera.lookAt(scene.position);

    // LIGHT

    scene.add(new THREE.AmbientLight(0x505050));
    var light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 500, 2000);
    light.castShadow = true;
    light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
    light.shadow.bias = - 0.00022;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);

    // Render

    renderer = new THREE.WebGLRenderer();    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container = document.getElementById('TRIANGULATION');           // ID in HTML page
    container.appendChild(renderer.domElement);

   
  
  
    //SCENE Objects

    //ESPmesh : (labelName, radius, orbitDist, speed, posOnX, posOnY, posOnZ)

    _fkt = new commonFktClass();
    _ray = new RAYintersectionClass();
    _esp = new ESPmeshClass(-100, 100, 0);
    _map = new triAngulationTargetMapClass(renderer, scene);

    
    _esp.createESP0_WRAPPER_and_BUFFER_MESH( 1, 15, circlePointSpeed , esp0CurrPosX, esp0CurrPosY, esp0CurrPosZ, 'black');
    _esp.setESP0centerMesh(_ESP0circle_posX, _ESP0circle_posY, 0, 'black');

    _esp.createESP1_WRAPPER_and_BUFFER_MESH(1, 15, circlePointSpeed, esp1CurrPosX, esp1CurrPosY, esp1CurrPosZ, 'black'); 
    _esp.setESP1centerMesh(ESP1circle.position.x, ESP1circle.position.y, 0, 'black');

    _esp.createESP2_WRAPPER_and_BUFFER_MESH(1, 15, circlePointSpeed, esp2CurrPosX, esp2CurrPosY, esp2CurrPosZ, 'black');
    _esp.setESP2centerMesh(ESP2circle.position.x, ESP2circle.position.y, 0, 'black');

    ///////////////////////////   SANDBOX **********************************************************

    
    
   

    ///////////////////////////   SANDBOX **********************************************************


       
    //SCENE Objects - E N D 


    //HELPERs  HELPERs HELPERs HELPERs HELPERs HELPERs HELPERs 

    //Boden-Platte

    /*
    geometry = new THREE.BoxGeometry(400, 2, 400);
    material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -30);
    mesh.rotation.x = THREE.Math.degToRad(-90);
    scene.add(mesh);
    */

    //http://conhit.telekom-healthcare.com/
    _map.buildPlaneMesh("planeImageMesh1", 0, 0, -26, "./images/HallenPlanTelekom.jpg");
    planeImageMesh1.visible = false;

    mesh = new THREE.GridHelper(100, 10, 0x303030, 0x303030);
    mesh.position.set(0, 0, -28);
    mesh.rotation.x = THREE.Math.degToRad(-90);
    scene.add(mesh);

    // axes
    scene.add(new THREE.AxesHelper(50));

       
        
    //Stats and controls

    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms --  Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.dom);  
    //document.getElementById("Stats-output").appendChild(stats.domElement);

    //Trackball
    tcontrols = new THREE.TrackballControls(camera, renderer.domElement);
    tcontrols.rotateSpeed = 1.0;
    tcontrols.zoomSpeed = 1.2;
    tcontrols.panSpeed = 0.8;
    tcontrols.noZoom = false;
    tcontrols.noPan = false;
    tcontrols.staticMoving = true;
    tcontrols.dynamicDampingFactor = 0.3;

    var dragControls = new THREE.DragControls(collidableMeshList, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', function (event) { tcontrols.enabled = false; });
    dragControls.addEventListener('dragend', function (event) { tcontrols.enabled = true; });

    // RAYCASTER

    raycasterNull = new THREE.Raycaster();
    raycasterOne = new THREE.Raycaster();
    raycasterTwo = new THREE.Raycaster();
    _raycaster_TrilatPoint = new THREE.Raycaster();     // für die roten bobbel..die trilaterations-punkte

    
    // GUI
    controls = new function () {
        this.esp0_Radius = 10;           // hiermit die X-Pos von ESP1 verschieben 
        this.esp1_Radius = 20;           // hiermit die X-Pos von ESP1 verschieben 
        this.esp2_Radius = 30;
        this.bouncingSpeed = 0.03;
        //this.ambientColor = ambiColor; 
        this.timerForTheRESTgetCall = 5000;             // 5 sec between each rest call as default
        this.showPictureMap = false;                     //  planeImageMesh1.visible = true;
        this.disableKnownDevices= true;
        this.useOnlyDummyData = false;
        this.MACfilter = MACfilterX;
        this.activateMACfilter = false;
        this.devicesFromLastMinutes = divicesFromLastMinutesX;        // zeigt die gesanten devices der letzten n stunden
        this.nearestNeighborDist = _nearestNeighborDistX;                               // kleiner diesem Wert den doppelten raus werfen
       
    };

    //produce a button in the GUI
    //https://stackoverflow.com/questions/18366229/is-it-possible-to-create-a-button-using-dat-gui
    var countMACinLastXminutes = {
        add: function () {
            makeCorsRequest4DevicesFromLastHrs(divicesFromLastMinutesX);
        }
    };       

    var getTRIpointsfromDB = {
        add: function () {            
            _REST.makeCorsRequest4TrilaterationData(divicesFromLastMinutesX);    
        }
    };

    var pushNextTriPoint = {
        add: function () {
            _esp.setAllTrilatCirclesToStart();
            _fkt.setNextESP_TRIO_fromJSON();
        }
    };

    var runSomeTest = {
        add: function () {

             // nur für tests aktivieren
            _esp.deleteAll_TEST_BubbleMeshGroupElements();
            scene.remove(_triangleMesh);
            //--bobbleBuffer ist leer - paar punkte platzieren
            _esp.setSomeBobbels4Test(20, 20);       // Punkt1
            _esp.setSomeBobbels4Test( 50, 40);
            _esp.setSomeBobbels4Test(-30, 40);
            _esp.setSomeBobbels4Test(50, 5);       // Punkt2
            _esp.setSomeBobbels4Test(60, -8);
            _esp.setSomeBobbels4Test(65, 10);
            _esp.setSomeBobbels4Test(67, -4);       // BASTARD
            //-- hier rein ein dreieck bauen                     
            _testBubbleMeshGroup =  _fkt.DeleteMultiPoints(_testBubbleMeshGroup,2);
            _fkt.getThe3nearest3PointsDistance(_testBubbleMeshGroup);       // Flache
            
        }
    };

   /*
    gui.addColor(controls, 'ambientColor').onChange(function (e) {
        ambientLight.color = new THREE.Color(e);
    });
    
    gui.addColor(controls, 'colorAccessPoint').onChange(function (e) {
        apDeviceMaterial.color.setStyle(e);
        apMeshColorX = e;       // speichern  die die scene wieder neu geladen wird
    });
    gui.addColor(controls, 'colorMACdevice').onChange(function (e) {
        macDeviceMaterial.color.setStyle(e);
        macMeshColorX = e;  // speichern  die die scene wieder neu geladen wird
    });
   */

    gui.add(controls, 'esp0_Radius', 0, 200).onChange(function (e) {
        _esp.removeESP0CircleAndTrigger();
        _esp.deleteAllhitBubbleMeshGroupElements();   
        hitBubbleMeshGroup = [];
        _esp.createESP0_WRAPPER_and_BUFFER_MESH(1, e, circlePointSpeed, esp0CurrPosX, esp0CurrPosY, esp0CurrPosZ, 'black');
        document.getElementById("hitBubbleMeshCounter").innerHTML = hitBubbleMeshGroup.length; 
        
    });
    gui.add(controls, 'esp1_Radius', 0, 200).onChange(function (e) {        
        _esp.removeESP1CircleAndTrigger();
        _esp.deleteAllhitBubbleMeshGroupElements();       
        hitBubbleMeshGroup = [];
        _esp.createESP1_WRAPPER_and_BUFFER_MESH(1, e, circlePointSpeed, esp1CurrPosX, esp1CurrPosY, esp1CurrPosZ, 'black');
        document.getElementById("hitBubbleMeshCounter").innerHTML = hitBubbleMeshGroup.length; 
    });
    gui.add(controls, 'esp2_Radius', 0, 200).onChange(function (e) {       
        _esp.removeESP2CircleAndTrigger();
        _esp.deleteAllhitBubbleMeshGroupElements();      
        hitBubbleMeshGroup = [];
        _esp.createESP2_WRAPPER_and_BUFFER_MESH(1, e, circlePointSpeed, esp2CurrPosX, esp2CurrPosY, esp2CurrPosZ, 'black');       
        document.getElementById("hitBubbleMeshCounter").innerHTML = hitBubbleMeshGroup.length; 
    });

    gui.add(controls, 'timerForTheRESTgetCall', 2500, 30000).onChange(function (e) {
        
        timerForTheRESTgetCallX = e;
        clearInterval(RESTinterval);
        startInterval();      
    });

    gui.add(controls, 'showPictureMap').onChange(function (e) {
        planeImageMesh1.visible = e;
    });

    gui.add(controls, 'disableKnownDevices').onChange(function (e) {
        disableKnownDevicesX = e;
    });

    gui.add(controls, 'useOnlyDummyData').onChange(function (e) {
        useOnlyDummyDataX = e;
        if (useOnlyDummyDataX === true) {
            _SB.deleteALLMacObjects(scene);
            _SB.createMACdeviceObjectsWithDummyData();            
        }
    });
    // eine bestimmte mac filterm

   
    gui.add(controls, 'MACfilter').onChange(function (e) {
        //MACfilterX = e;
    });
    gui.add(controls, 'activateMACfilter').onChange(function (e) {
       // activateMACfilterX = e;
    });

    
    gui.add(controls, 'devicesFromLastMinutes').onChange(function (e) {
        divicesFromLastMinutesX = e;
    });

    gui.add(controls, 'nearestNeighborDist').onChange(function (e) {
        _nearestNeighborDistX = e;
    });

   /*
    gui.add(countMACinLastXminutes, 'add').name("countMACinLastXminutes");       // Buttons    
    gui.add(deleteMACinScene, 'add').name("deleteMACinScene"); 
    */

    gui.add(getTRIpointsfromDB, 'add').name("get TRI-pointsfromDB");          // Button ..hole TrilaterationsPunkte aus der DB
    gui.add(pushNextTriPoint, 'add').name("pushNext TRI-Point");           // Button

    //someTest
    gui.add(runSomeTest, 'add').name("RUN SOME TEST");           // Button


    // Event Listener
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    // some page GUI infos   

    // Timer for the Rest CALL to get NEW Data

    // Some STUFF for the TRILATERATION  - Initial Read

    startInterval();
    _fkt.setLoadMessage("ERASE");
    _esp.setAllTrilatCirclesToStart();              // Nur die zähler und das Trio
    _REST.makeCorsRequest4TrilaterationData(divicesFromLastMinutesX);   // Neue Daten Holen..

}


// NEW:: der Timer ist eine art watchDog...der trilatPoint kann UNTER einer SEKUNDE ermittelt werden..wenn out of Time: Neue Datensätze holen
function startInterval() {
    RESTinterval = setInterval(function () {
        stopInterval();

         //  issue bzgl. Nachladen via REST -  wenn das zu kurz hinter einander passiert, dann gibt es deadLOCK´s !!
        if (_trilaterationMAC_JSON.length === 0 || _trilaterationMAC_JSON.length === 'undefined'  || _trilaterationMAC_JSON === 'ERR:NoData') {
            _esp.setAllTrilatCirclesToStart();                                               // die kreise nudeln dann so vor sich hin  
            _REST.makeCorsRequest4TrilaterationData(divicesFromLastMinutesX);               // Neue Daten Holen im Main-LOOP...Alternativ über den TIMER  
        }
      
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



// Convert an int to hexadecimal with a max length
// of six characters.
function intToARGB(i) {
    var hex = (i >> 24 & 0xFF).toString(16) +
        (i >> 16 & 0xFF).toString(16) +
        (i >> 8 & 0xFF).toString(16) +
        (i & 0xFF).toString(16);
    // Sometimes the string returned will be too short so we 
    // add zeros to pad it out, which later get removed if
    // the length is greater than six.
    hex += '000000';
    return hex.substring(0, 6);
}

function animate() {   
    requestAnimationFrame(animate);

    // Scene Updates and Loops

    // esp1Group e.g. ESp1 and ESP2 orbits

    var orbit;
    var speed;
    var intersectionPylon;
    var i;
    timestamp = Date.now() * 0.0001;

   

    // ESP0 mit seiner rotierenden MAC  
   
    for (i = 0; i !== _ESP0_IntersectionObjectsMESH_BUFFER.length; ++i) {      
        intersectionPylon = _ESP0_IntersectionObjectsMESH_BUFFER[i];        // Hier sind die intersection Pylone drin
        orbit = intersectionPylon.userData.orbit;
        speed = intersectionPylon.userData.speed;
        intersectionPylon.position.x = ESP0circle.position.x + Math.cos(timestamp * speed + i * 10) * orbit;	   // MIT Uhrzeiger      
        intersectionPylon.position.y = ESP0circle.position.y + Math.sin(timestamp * speed + i * 10) * orbit;
        intersectionPylon.updateMatrixWorld();   
        _ESP0_IntersectionObjectsMESH_BUFFER[i] = intersectionPylon;
    }
    ESP0circle.updateMatrixWorld();
    document.getElementById("esp0PosXY").innerHTML = "X=" + ESP0circle.position.x.toFixed(2) + "  Y=" + ESP0circle.position.y.toFixed(2);
    //CenterPoint muss korrigiert werden
    esp0CenterMesh.position.set(ESP0circle.position.x, ESP0circle.position.y, ESP0circle.position.z);
    esp0CurrPosX = ESP0circle.position.x;   // wenn in der dat gui die Radien Neu geladen werden
    esp0CurrPosY = ESP0circle.position.y;
    esp0CurrPosZ = ESP0circle.position.z;
       

       
    // ESP1 mit seiner rotierenden MAC - wenn drag´n drop dann alle pos aktualisieren   

    for (i = 0; i !== _ESP1_IntersectionObjectsMESH_BUFFER.length; ++i) {
        intersectionPylon = _ESP1_IntersectionObjectsMESH_BUFFER[i];        // Hier sind die intersection Pylone drin
        orbit = intersectionPylon.userData.orbit;
        speed = intersectionPylon.userData.speed;
        intersectionPylon.position.x = ESP1circle.position.x + Math.cos(timestamp * speed + i * 10) * orbit;	   // MIT Uhrzeiger      
        intersectionPylon.position.y = ESP1circle.position.y + Math.sin(timestamp * speed + i * 10) * orbit;
        intersectionPylon.updateMatrixWorld();
        _ESP1_IntersectionObjectsMESH_BUFFER[i] = intersectionPylon;
    }
    ESP1circle.updateMatrixWorld();
    document.getElementById("esp1PosXY").innerHTML = "X=" + ESP1circle.position.x.toFixed(2) + "  Y=" + ESP1circle.position.y.toFixed(2);
    //CenterPoint muss korrigiert werden
    esp1CenterMesh.position.set(ESP1circle.position.x, ESP1circle.position.y, ESP1circle.position.z);
    esp1CurrPosX = ESP1circle.position.x;   // wenn in der dat gui die Radien Neu geladen werden
    esp1CurrPosY = ESP1circle.position.y;
    esp1CurrPosZ = ESP1circle.position.z;
   

    // ESP2 mit seiner rotierenden MAC
    
    for (i = 0; i !== _ESP2_IntersectionObjectsMESH_BUFFER.length; ++i) {
        intersectionPylon = _ESP2_IntersectionObjectsMESH_BUFFER[i];        // Hier sind die intersection Pylone drin
        orbit = intersectionPylon.userData.orbit;
        speed = intersectionPylon.userData.speed;
        intersectionPylon.position.x = ESP2circle.position.x + Math.cos(timestamp * speed + i * 10) * orbit;	   // MIT Uhrzeiger      
        intersectionPylon.position.y = ESP2circle.position.y + Math.sin(timestamp * speed + i * 10) * orbit;
        intersectionPylon.updateMatrixWorld();
        _ESP2_IntersectionObjectsMESH_BUFFER[i] = intersectionPylon;
    }
    ESP2circle.updateMatrixWorld();
    document.getElementById("esp2PosXY").innerHTML = "X=" + ESP2circle.position.x.toFixed(2) + "  Y=" + ESP2circle.position.y.toFixed(2);
    //CenterPoint muss korrigiert werden
    esp2CenterMesh.position.set(ESP2circle.position.x, ESP2circle.position.y, ESP2circle.position.z);
    esp2CurrPosX = ESP2circle.position.x;   // wenn in der dat gui die Radien Neu geladen werden
    esp2CurrPosY = ESP2circle.position.y;
    esp2CurrPosZ = ESP2circle.position.z;


    // Update some Info :

    document.getElementById("winInnerWH").innerHTML = "Width=" + window.innerWidth + " Height=" + window.innerHeight;   
          
    // Render , trackball, stats
    tcontrols.update();
    render();
    stats.update();

 /*
    RAYCASTER - NACH dem rendering aufrufen!!  -    mit 6 schnittKnoten dürften wir den Punkt haben
    AUF nächstes ELEMENT im Array schalten   - REST-Call, falls Buffer Leer ist ( alte bedingung aary length > 0  )
*/

    if (_trilaterationMAC_JSON.length === 0 || _trilaterationMAC_JSON.length === 'undefined' || _trilaterationMAC_JSON === 'ERR:NoData') {
        return;     // Ray macht NUR sinn, wenn auch Daten DA sind
    }

    if ( _trilaterationMAC_JSON.length > 0 ) {
          
        if (hitBubbleMeshGroup.length !== 6 ) {
            _ray.collisionDetectionESP0_KegelArray();
            _ray.collisionDetectionESP1_KegelArray();
            _ray.collisionDetectionESP2_KegelArray();

            // gibt noch kleine ausrutscher:  ich lasse ihm zeit..erst die bobbles setzen dann weg nehmen

            hitBubbleMeshGroup = _fkt.DeleteMultiPoints(hitBubbleMeshGroup, _nearestNeighborDistX);
            document.getElementById("hitBubbleMeshCounter").innerHTML = hitBubbleMeshGroup.length;

        } else {       
            if (typeof _currentpeerMACinScan !== 'undefined' && _currentpeerMACinScan !== "") {      // RED BOBBLE preparation - PRECHECK again! again!
               
                scene.remove(_triangleMesh);                                                         // Das kleine Rote Drei-ECK
                if (_fkt.getThe3nearest3PointsDistance(hitBubbleMeshGroup)) {                        // RotesDreieck  PLUS  setzt den ROTEN PUNKT ( bzw. DreickeckMesh  *  BINGO  ****************
                    _esp.setAllTrilatCirclesToStart();                                              // die kreise nudeln dann so vor sich hin
                    _fkt.setNextESP_TRIO_fromJSON();
                   _tracePointCounter += 1;    // rote bobbel..
                   document.getElementById("tracePointCounter").innerHTML = _tracePointCounter;     
                }                
            }
        }

    } else {
                 // issue bzgl. Nachladen via REST -  wenn das zu kurz hinter einander passiert, dann gibt es deadLOCK´s !! -  Neue Daten Holen im Main-LOOP...Alternativ über den TIMER
                 //  wird zz via Timer gestartet, wenn sich hier nichts tut...zB wenn 0 Intersection!
    }

   
    camera.updateMatrixWorld();
    _ray.collisionDetectionRAY_MOUSE(_collidableMeshList_4_TrilatPoints);       // TrilaterationsPunkt-Intersection (RED BOBBLES !! )

}

function render() {

    renderer.render(scene, camera);

}

