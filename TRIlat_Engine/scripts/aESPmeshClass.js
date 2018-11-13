/*
CLASS: fkts for the ESP MESH


*/

function ESPmeshClass(iniX, iniY) {

    this._ESP0macDeviceMesh;
    this._ESP0circleMesh;    

    this._ESP1macDeviceMesh;
    this._ESP1circleMesh;   

    this._ESP2macDeviceMesh;
    this._ESP2circleMesh;   

    // esp0 is initially = 0,0,0
    this._ESP1initialPosOnX = iniX;        // ESP1 ist auf der X-Achse LINKs von ESP0
    this._ESP2initialPosOnY = iniY;        // ESP2 ist auf der Y-Achse Oberhalb von ESP0

   
}

ESPmeshClass.constructor = ESPmeshClass;

//-------------------- E S P 0 --------------------------------------------------------------------------------

// ESP0 ist der MittenDetector..steht auf 0,0,0 im koordinatenSystem


ESPmeshClass.prototype.setESP0centerMesh = function (iniX, iniY, iniZ, col) {
    // simuliert den Mittelpunk des circle...quasi die sonne im solar-system
    esp0CenterMesh = new THREE.Mesh(new THREE.SphereGeometry(centerPointSize, 32, 16), new THREE.MeshBasicMaterial({
        color: col
    }));
    esp0CenterMesh.position.x = iniX;
    esp0CenterMesh.position.y = iniY;
    esp0CenterMesh.position.z = iniZ;
    scene.add(esp0CenterMesh);
};

ESPmeshClass.prototype.setESP1centerMesh = function (iniX, iniY, iniZ, col) {
    // simuliert den Mittelpunk des circle...quasi die sonne im solar-system
    esp1CenterMesh = new THREE.Mesh(new THREE.SphereGeometry(centerPointSize, 32, 16), new THREE.MeshBasicMaterial({
        color: col
    }));
    esp1CenterMesh.position.x = iniX;
    esp1CenterMesh.position.y = iniY;
    esp1CenterMesh.position.z = iniZ;
    scene.add(esp1CenterMesh);
};

ESPmeshClass.prototype.setESP2centerMesh = function (iniX, iniY, iniZ, col) {
    // simuliert den Mittelpunk des circle...quasi die sonne im solar-system
    esp2CenterMesh = new THREE.Mesh(new THREE.SphereGeometry(centerPointSize, 32, 16), new THREE.MeshBasicMaterial({
        color: col
    }));
    esp2CenterMesh.position.x = iniX;
    esp2CenterMesh.position.y = iniY;
    esp2CenterMesh.position.z = iniZ;
    scene.add(esp2CenterMesh);
};

/*
CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
radiusTop — Radius of the cylinder at the top. Default is 1.
radiusBottom — Radius of the cylinder at the bottom. Default is 1.
height — Height of the cylinder. Default is 1.
radialSegments — Number of segmented faces around the circumference of the cylinder. Default is 8
heightSegments — Number of rows of faces along the height of the cylinder. Default is 1.
openEnded — A Boolean indicating whether the ends of the cylinder are open or capped. Default is false, meaning capped.
thetaStart — Start angle for first segment, default = 0 (three o'clock position).
thetaLength — The central angle, often called theta, of the circular sector. The default is 2*Pi, which makes for a complete cylinder.

können global gesetzt werden:
var _cylinderRadiusTop = 1;     // Parameter für die Cylinder auf der KreisBahn um den ESP
var _cylinderRadiusBottom = 2;
var _cylinderHeight = 3;
var _cylinderRadialSegments = 5;

*/


/*
NEW  NEW NEW  NEW NEW  NEW   WITH Buffer

var _ESP0_IntersectionObjectsMESH_BUFFER = [];                      // hier kommen die intersection kegel rein

*/

ESPmeshClass.prototype.createESP0_WRAPPER_and_BUFFER_MESH = function (radius, orbitDist, speed, posOnX, posOnY, posOnZ, circleColor) {

    // Rotierendes Objekt auf dem Radius des Circle - wichtig fürs spätere RAY

    // CREATION!

    for (var i = 0; i !== _ESP_ANZAHL_TRILAT_PUNKTE; ++i) {
        var geo1 = new THREE.CylinderGeometry(_cylinderRadiusTop, _cylinderRadiusBottom, _cylinderHeight, _cylinderRadialSegments);
        var mat1 = new THREE.MeshNormalMaterial();
        geo1.rotateX(Math.PI / 2);
        //var ESPkegel=  new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), new THREE.MeshNormalMaterial());
        var ESPkegel = new THREE.Mesh(geo1, mat1);
        ESPkegel.userData.orbit = orbitDist;
        ESPkegel.userData.speed = speed;
        ESPkegel.name = "esp0Kegel_" + i;
        ESPkegel.position.x = orbitDist * Math.cos(i * 10);         // verteilt uns auf der Kreisbahn innerhalb des wrappers
        ESPkegel.position.y = orbitDist * Math.sin(i * 10);
        scene.add(ESPkegel);
        _ESP0_IntersectionObjectsMESH_BUFFER.push(ESPkegel);        // die objekte kommen in einen buffer...so stehen sie später für intersection zur verfügung

    }

    //ORbit mit LineMaterial - Vollkreis statisch - DAS IST DAS RAY OBJEKT...die PYLONE TREFFEN AUF DIE LINIEN

    var segmentCount = 30, geometry = new THREE.Geometry(), material = new THREE.LineBasicMaterial({ color: circleColor });
    for (i = 0; i <= segmentCount; i++) {
        var theta = i / segmentCount * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos(theta) * orbitDist,
                Math.sin(theta) * orbitDist,
                0));
    }
    ESP0circle = new THREE.Line(geometry, material);
    ESP0circle.position.x = posOnX;
    ESP0circle.position.y = posOnY;
    ESP0circle.position.z = posOnZ;
    ESP0circle.name = "esp0MeshCircle";         // fix, da an diese klasse gebunden   
    scene.add(ESP0circle);
    collidableMeshList.push(ESP0circle);        //  Brauchen wir zum verschieben

    _ESP0circle_posX = posOnX;
    _ESP0circle_posY = posOnY;
};


//-------------------- E S P 1 --------------------------------------------------------------------------------


/*
labelName = für später..uu mache ich noch sprites hier dazu
radius = eher die size der einzelnen objekte
orbitDist = eher der radius des circle ( RSSI )
speed = bestimmt die rot geschwindigkeit des Cube auf der Umlaufbahn  !! achtung die geschwindigkeit hat einfluss auf INTERSECTION
posOnX, posOnY, posOnZ : pos auf der Achse

REMARK: 2 getrennte methoden für ESP1 und ESP2 ...wir brauchen später sowohl dien Circle als auch deviceMesh

ISSUE: wenn GROUP dann stimmen die positionen nicht mehr ??

*/

ESPmeshClass.prototype.createESP1_WRAPPER_and_BUFFER_MESH = function (radius, orbitDist, speed, posOnX, posOnY, posOnZ, circleColor) {

    // Rotierendes Objekt auf dem Radius des Circle - wichtig fürs spätere RAY

    // CREATION!

    for (var i = 0; i !== _ESP_ANZAHL_TRILAT_PUNKTE; ++i) {
        var geo1 = new THREE.CylinderGeometry(_cylinderRadiusTop, _cylinderRadiusBottom, _cylinderHeight, _cylinderRadialSegments);
        var mat1 = new THREE.MeshNormalMaterial();
        geo1.rotateX(Math.PI / 2);
        //var ESPkegel=  new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), new THREE.MeshNormalMaterial());
        var ESPkegel = new THREE.Mesh(geo1, mat1);
        ESPkegel.userData.orbit = orbitDist;
        ESPkegel.userData.speed = speed;
        ESPkegel.name = "esp1Kegel_" + i;
        ESPkegel.position.x = orbitDist * Math.cos(i * 10);         // verteilt uns auf der Kreisbahn innerhalb des wrappers
        ESPkegel.position.y = orbitDist * Math.sin(i * 10);
        scene.add(ESPkegel);
        _ESP1_IntersectionObjectsMESH_BUFFER.push(ESPkegel);        // die objekte kommen in einen buffer...so stehen sie später für intersection zur verfügung

    }

    //ORbit mit LineMaterial - Vollkreis statisch - DAS IST DAS RAY OBJEKT...die PYLONE TREFFEN AUF DIE LINIEN

    var segmentCount = 30, geometry = new THREE.Geometry(), material = new THREE.LineBasicMaterial({ color: circleColor });
    for (i = 0; i <= segmentCount; i++) {
        var theta = i / segmentCount * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos(theta) * orbitDist,
                Math.sin(theta) * orbitDist,
                0));
    }
    ESP1circle = new THREE.Line(geometry, material);
    ESP1circle.position.x = posOnX;
    ESP1circle.position.y = posOnY;
    ESP1circle.position.z = posOnZ;
    ESP1circle.name = "esp1MeshCircle";         // fix, da an diese klasse gebunden   
    scene.add(ESP1circle);
    collidableMeshList.push(ESP1circle);        //  Brauchen wir zum verschieben

    _ESP1circle_posX = posOnX;
    _ESP1circle_posY = posOnY;
};




//-------------------- E S P 2 --------------------------------------------------------------------------------

ESPmeshClass.prototype.createESP2_WRAPPER_and_BUFFER_MESH = function (radius, orbitDist, speed, posOnX, posOnY, posOnZ, circleColor) {

    // Rotierendes Objekt auf dem Radius des Circle - wichtig fürs spätere RAY

    // CREATION!

    for (var i = 0; i !== _ESP_ANZAHL_TRILAT_PUNKTE; ++i) {
        var geo1 = new THREE.CylinderGeometry(_cylinderRadiusTop, _cylinderRadiusBottom, _cylinderHeight, _cylinderRadialSegments);
        var mat1 = new THREE.MeshNormalMaterial();
        geo1.rotateX(Math.PI / 2);
        //var ESPkegel=  new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), new THREE.MeshNormalMaterial());
        var ESPkegel = new THREE.Mesh(geo1, mat1);
        ESPkegel.userData.orbit = orbitDist;
        ESPkegel.userData.speed = speed;
        ESPkegel.name = "esp2Kegel_" + i;
        ESPkegel.position.x = orbitDist * Math.cos(i * 10);         // verteilt uns auf der Kreisbahn innerhalb des wrappers
        ESPkegel.position.y = orbitDist * Math.sin(i * 10);
        scene.add(ESPkegel);
        _ESP2_IntersectionObjectsMESH_BUFFER.push(ESPkegel);        // die objekte kommen in einen buffer...so stehen sie später für intersection zur verfügung

    }

    //ORbit mit LineMaterial - Vollkreis statisch - DAS IST DAS RAY OBJEKT...die PYLONE TREFFEN AUF DIE LINIEN

    var segmentCount = 30, geometry = new THREE.Geometry(), material = new THREE.LineBasicMaterial({ color: circleColor });
    for (i = 0; i <= segmentCount; i++) {
        var theta = i / segmentCount * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos(theta) * orbitDist,
                Math.sin(theta) * orbitDist,
                0));
    }
    ESP2circle = new THREE.Line(geometry, material);
    ESP2circle.position.x = posOnX;
    ESP2circle.position.y = posOnY;
    ESP2circle.position.z = posOnZ;
    ESP2circle.name = "esp2MeshCircle";         // fix, da an diese klasse gebunden   
    scene.add(ESP2circle);
    collidableMeshList.push(ESP2circle);        //  Brauchen wir zum verschieben

    _ESP2circle_posX = posOnX;
    _ESP2circle_posY = posOnY;
};





// sonstige mesh-Methoden   -- OTHER ---  sonstige mesh-Methoden   -- OTHER ---


// zum setzten der Distanzen der ESP ANKER PUNKTE...auch zum neutralen Rücksetzen, wenn ein punkt gefunden wurde

ESPmeshClass.prototype.setEsp0Esp1Esp2DistanceDIRECT = function (dist0, dist1, dist2) {

    //für ALLE

    this.deleteAllhitBubbleMeshGroupElements();
    hitBubbleMeshGroup = [];

    //ESP0 mit REMOTE distanzen von den ESP-Sniffern
    this.removeESP0CircleAndTrigger();
    this.createESP0_WRAPPER_and_BUFFER_MESH(1, dist0, circlePointSpeed, esp0CurrPosX, esp0CurrPosY, esp0CurrPosZ, 'black');

    //ESP1
    this.removeESP1CircleAndTrigger();
    this.createESP1_WRAPPER_and_BUFFER_MESH(1, dist1, circlePointSpeed, esp1CurrPosX, esp1CurrPosY, esp1CurrPosZ, 'black');

    //ESP2
    this.removeESP2CircleAndTrigger();
    this.createESP2_WRAPPER_and_BUFFER_MESH(1, dist2, circlePointSpeed, esp2CurrPosX, esp2CurrPosY, esp2CurrPosZ, 'black');

};


//ALLE ESP´s in die Ausgangs-Position bringen
ESPmeshClass.prototype.setAllTrilatCirclesToStart = function () {
    _esp.setEsp0Esp1Esp2DistanceDIRECT(10, 10, 10);
    document.getElementById("hitBubbleMeshCounter").innerHTML = hitBubbleMeshGroup.length;
};


/* ..der kleine bunte bobble, der die momentan ermittelte pos anzeigt

!!! ToDo: ??  und gleich prüfen, ob schon einer drinnen ist  mit geringem Abstand
 
*/
ESPmeshClass.prototype.setTheESPMarkerMesh = function (x, y, z) {
    var ESP_HitMesh = new THREE.Mesh(new THREE.SphereGeometry(espMarkerMeshPointSize, 32, 16), new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff
    }));
    ESP_HitMesh.position.x = x;
    ESP_HitMesh.position.y = y;
    ESP_HitMesh.position.z = z;
    ESP_HitMesh.name = "hitBubbleXY_" + x + "_" + y;
    hitBubbleMeshGroup.push(ESP_HitMesh);
    scene.add(ESP_HitMesh);
    ESP_HitMesh.updateMatrixWorld();
};

// Das Ist der ROTE BUBBLE   / ROTE PUNKT / XPOINT / TRI POINT  ***********************************************
// This will set the mesh where we finally found the Tri-Angulation-Point..a voxel or a re point etc.
// The Bubble/Bubbel is RAY !!  the name: "triPoint/noCannel;11.02.2018 06:42:39;E4:F8:EF:53:77:9D;/23.00/2C:3A:E8:14:C8:EF;/9.00/5C:CF:7F:1C:26:FD;/3.00/68:C6:3A:97:A5:89/X-cor/Y-COR
/*
var _triBubblesLogJson =                 // Zum Mitschreiben der finalen Bubbles ( deviceCoordinaten dist0  ..dist2 / MAC)
    [   {
        "MAC": "leer",
        "DIST0": 0,
        "DIST1": 0,
        "DIST2": 0
    }
    ];
*/
ESPmeshClass.prototype.setTriAngulationPoint = function (x, y, z, color) {
    var triAnagulationMesh = new THREE.Mesh(new THREE.SphereGeometry(_triangukationsBobbel, 32, 16), new THREE.MeshBasicMaterial({
        color: color
    }));
    triAnagulationMesh.position.x = x;
    triAnagulationMesh.position.y = y;
    triAnagulationMesh.position.z = z;
    triAnagulationMesh.name = "triPoint/" + JSON.stringify( _currentTriPointFromArrayInScan) + "/" + x + "/" + y;
    scene.add(triAnagulationMesh);
    _collidableMeshList_4_TrilatPoints.push(triAnagulationMesh);

    //mitprotokollieren in eine JSON...Ausreißersuche
    
    /* zuordnen...    x.toFixed(2);    y.toFixed(2);    z.                          NO gibt einen string keine Zahl            toFixed(2);*/
    

    
    //  test
    /*
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    var newData = { MAC: '1.2.3.4', DIST0: 11, DIST1: 11, DIST2: 33 };
    _triBubblesLogJson = Object.assign(_triBubblesLogJson, newData);
    console.log("setTriAngulationPoint(): " + _triBubblesLogJson);
    console.log(JSON.stringify(_triBubblesLogJson));

    mit der mimik geht es !!

    var data = JSON.parse(txtTEST);  //parse the JSON
    data.employees.push({        //add the employee
        firstName: "Mike",
        lastName: "Rut",
        time: "10:00 am",
        email: "rut@bah.com",
        phone: "800-888-8888",
        image: "images/mike.jpg"
    });
    txtTEST = JSON.stringify(data);  //reserialize to JSON
    console.log(txtTEST);
    */

};
// Das Ist der ROTE BUBBLE   / ROTE PUNKT / XPOINT / TRI POINT  ***********************************************


//************ THIS IS ERASER SECTION *************************************************************************

ESPmeshClass.prototype.deleteAllSceneMeshes = function () {

    var toRemove = [];
    scene.traverse(function (e) {
        if (e instanceof THREE.Mesh) {
            //console.log("checked for delete: e.name " + e.name);
            if (e.name !== "radarScheibe") {
                toRemove.push(e);   // objekt kann nicht zugeordnet werden  ALSO LÖSCHEN   
                //deletedSceneCIs += 1;
            }
        }
    });

    toRemove.forEach(function (e) {
        scene.remove(e);
    });
};

// weg mit den kleinen HIT bubbles

ESPmeshClass.prototype.deleteAllhitBubbleMeshGroupElements = function () {

    for (var i = 0; i < hitBubbleMeshGroup.length; ++i) {
        scene.remove(hitBubbleMeshGroup[i]);
    }
    hitBubbleMeshGroup = [];

    var toRemove = [];
    scene.traverse(function (e) {
        if (e instanceof THREE.Mesh) {
            //console.log("checked for delete: e.name " + e.name);  e.name.indexOf("hitBubbleXY") === -1
            if (e.name.indexOf("hitBubbleXY") !== -1) {
                toRemove.push(e);   // objekt kann nicht zugeordnet werden  ALSO LÖSCHEN   
                //deletedSceneCIs += 1;
            }
        }
    });

    toRemove.forEach(function (e) {
        scene.remove(e);
    });

};

// weg mit den Test Bobbles 

ESPmeshClass.prototype.deleteAll_TEST_BubbleMeshGroupElements = function () {
    for (var i = 0; i < _testBubbleMeshGroup.length; ++i) {
        scene.remove(_testBubbleMeshGroup[i]);
    }
    _testBubbleMeshGroup = [];
    var toRemove = [];
    scene.traverse(function (e) {
        if (e instanceof THREE.Mesh) {
            //console.log("checked for delete: e.name " + e.name);  e.name.indexOf("hitBubbleXY") === -1
            if (e.name.indexOf("hitBubbleXY") !== -1) {
                toRemove.push(e);   // objekt kann nicht zugeordnet werden  ALSO LÖSCHEN   
                //deletedSceneCIs += 1;
            }
        }
    });
    toRemove.forEach(function (e) {
        scene.remove(e);
    });
};


/*
        REMOVE: ESP0 + ESP1  + ESP2  //  PYLONE UND KREIS
*/

ESPmeshClass.prototype.removeESP0CircleAndTrigger = function () {

    scene.remove(ESP0circle);
    collidableMeshList.splice(collidableMeshList.indexOf(ESP0circle), 1);

    for (var i = 0; i < _ESP0_IntersectionObjectsMESH_BUFFER.length; ++i) {
        scene.remove(_ESP0_IntersectionObjectsMESH_BUFFER[i]);
    }
    _ESP0_IntersectionObjectsMESH_BUFFER = [];

    var toRemove = [];
    scene.traverse(function (e) {
        if (e instanceof THREE.Mesh) {
            //console.log("checked for delete: e.name " + e.name);  e.name.indexOf("hitBubbleXY") === -1
            if (e.name.indexOf("esp0Kegel_") !== -1) {
                toRemove.push(e);   // objekt kann nicht zugeordnet werden  ALSO LÖSCHEN   
                //deletedSceneCIs += 1;
            }
        }
    });
    toRemove.forEach(function (e) {
        scene.remove(e);
    });
};

ESPmeshClass.prototype.removeESP1CircleAndTrigger = function () {

    scene.remove(ESP1circle);
    collidableMeshList.splice(collidableMeshList.indexOf(ESP1circle), 1);

    for (var i = 0; i < _ESP1_IntersectionObjectsMESH_BUFFER.length; ++i) {
        scene.remove(_ESP1_IntersectionObjectsMESH_BUFFER[i]);
    }
    _ESP1_IntersectionObjectsMESH_BUFFER = [];

    var toRemove = [];
    scene.traverse(function (e) {
        if (e instanceof THREE.Mesh) {
            //console.log("checked for delete: e.name " + e.name);  e.name.indexOf("hitBubbleXY") === -1
            if (e.name.indexOf("esp1Kegel_") !== -1) {
                toRemove.push(e);   // objekt kann nicht zugeordnet werden  ALSO LÖSCHEN   
                //deletedSceneCIs += 1;
            }
        }
    });
    toRemove.forEach(function (e) {
        scene.remove(e);
    });
};

ESPmeshClass.prototype.removeESP2CircleAndTrigger = function () {

    scene.remove(ESP2circle);
    collidableMeshList.splice(collidableMeshList.indexOf(ESP2circle), 1);

    for (var i = 0; i < _ESP2_IntersectionObjectsMESH_BUFFER.length; ++i) {
        scene.remove(_ESP2_IntersectionObjectsMESH_BUFFER[i]);
    }
    _ESP2_IntersectionObjectsMESH_BUFFER = [];

    var toRemove = [];
    scene.traverse(function (e) {
        if (e instanceof THREE.Mesh) {
            //console.log("checked for delete: e.name " + e.name);  e.name.indexOf("hitBubbleXY") === -1
            if (e.name.indexOf("esp2Kegel_") !== -1) {
                toRemove.push(e);   // objekt kann nicht zugeordnet werden  ALSO LÖSCHEN   
                //deletedSceneCIs += 1;
            }
        }
    });
    toRemove.forEach(function (e) {
        scene.remove(e);
    });
};

/*
    simple Triangle ...http://jsfiddle.net/CoryG89/hyvng/10/
*/

ESPmeshClass.prototype.triangle4regularHits = function (Ax, Ay, Bx, By, Cx, Cy, rectName, col) {
    var geometry = new THREE.Geometry(200, 200, 200);
    var v1 = new THREE.Vector3(Ax, Ay, 0);   // Vector3 used to specify position
    var v2 = new THREE.Vector3(Bx, By, 0);
    var v3 = new THREE.Vector3(Cx, Cy, 0);   // 2d = all vertices in the same plane.. z = 0

    // Push vertices represented by position vectors
    geometry.vertices.push(v1);
    geometry.vertices.push(v2);
    geometry.vertices.push(v3);

    // Push face, defined with vertices in counter clock-wise order
    geometry.faces.push(new THREE.Face3(0, 2, 1));

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    // Create a material and combine with geometry to create our mesh
    var redMat = new THREE.MeshBasicMaterial({
        color: col,
        wireframe: false,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.5
    });
    _triangleMesh = new THREE.Mesh(geometry, redMat);
    _triangleMesh.name = rectName;
    scene.add(_triangleMesh);
};


// selbes DREIECK wie oben ...aber soll erst einmal stehen bleiben  ...für analyse ..
// geht um die Perlenkette bzw..den BOBBLE-Train...das da der richtige winkel-ausschnitt gewählt wird


ESPmeshClass.prototype.triangle4BobbleChain = function (Ax, Ay, Bx, By, Cx, Cy, rectName, col) {
    var geometry = new THREE.Geometry(200, 200, 200);
    var v1 = new THREE.Vector3(Ax, Ay, 0);   // Vector3 used to specify position
    var v2 = new THREE.Vector3(Bx, By, 0);
    var v3 = new THREE.Vector3(Cx, Cy, 0);   // 2d = all vertices in the same plane.. z = 0

    // Push vertices represented by position vectors
    geometry.vertices.push(v1);
    geometry.vertices.push(v2);
    geometry.vertices.push(v3);

    // Push face, defined with vertices in counter clock-wise order
    geometry.faces.push(new THREE.Face3(0, 2, 1));

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    // Create a material and combine with geometry to create our mesh
    var redMat = new THREE.MeshLambertMaterial({
        color: col,
        side: THREE.DoubleSide,
        wireframe: true
    });
    var Mesh = new THREE.Mesh(geometry, redMat);
    Mesh.name = rectName;
    scene.add(Mesh);
};


// Run Some TEST  button...ruft hier ein paar bobbles auf

ESPmeshClass.prototype.setSomeBobbels4Test = function (x, y) {
    var ESP_HitMesh = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 16), new THREE.MeshBasicMaterial({
        color: 'red'
    }));
    ESP_HitMesh.position.x = x;
    ESP_HitMesh.position.y = y;
    ESP_HitMesh.name = "testBubbel_" + x + "_" + y;
    _testBubbleMeshGroup.push(ESP_HitMesh);
    scene.add(ESP_HitMesh);
};