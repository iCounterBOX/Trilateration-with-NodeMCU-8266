/*
CLASS: fkts for the ESP MESH


*/

function ESPmeshClass() {
              
}

ESPmeshClass.constructor = ESPmeshClass;

/*
ESP0 - Kreis mit Mittel-Punkt
*/

ESPmeshClass.prototype.createESP0_WRAPPER_and_BUFFER_MESH = function (r, posOnX, posOnY, posOnZ, circleColor) {

    //remove OLD ESP Circle AND Point
   
    while (_ESPOrootGroup.children.length > 0) {
        var object = _ESPOrootGroup.children[0];
        object.parent.remove(object);
    }
    


    var axisHelper = new THREE.AxesHelper(50);
    axisHelper.name = 'esp0AxisHelper';
    _ESPOrootGroup.add(axisHelper);     
   

    
    //DRAW ESP0 KREIS
    var segmentCount = 30, geometry = new THREE.Geometry(), material = new THREE.LineBasicMaterial({ color: circleColor });
    for (i = 0; i <= segmentCount; i++) {
        var theta = i / segmentCount * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos(theta) * r,
                Math.sin(theta) * r,
                0));
    }
    var ESP0circle = new THREE.Line(geometry, material);
     ESP0circle.position.x = posOnX;
     ESP0circle.position.y = posOnY;
     ESP0circle.position.z = posOnZ;
     ESP0circle.name = "esp0MeshCircle";         // fix, da an diese klasse gebunden     
     _ESPOrootGroup.add(ESP0circle);
          
    //some Text with CSS2DObject  - https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_pdb.html
     var espDIV = document.createElement('div');
    espDIV.className = 'label';
    espDIV.textContent = 'ESP0';
    //espDIV.style.marginTop = '-10em';
    var espLabel = new THREE.CSS2DObject(espDIV);
    espLabel.position.set(posOnX + r + 3, posOnY + r + 3, 0);
    espLabel.name = 'esp0Label';
    
   _ESPOrootGroup.add(espLabel);


    //DRAW ESP0 Center-Point
    var esp0CenterMesh = new THREE.Mesh(new THREE.SphereGeometry(_centerPointSize, 32, 16), new THREE.MeshBasicMaterial({
        color: circleColor
    }));
    esp0CenterMesh.name = 'esp0CenterMesh';
    esp0CenterMesh.position.x = posOnX;
    esp0CenterMesh.position.y = posOnY;
    esp0CenterMesh.position.z = posOnZ;
    _ESPOrootGroup.add(esp0CenterMesh);
        
};


/*
ESP1 - Kreis mit Mittel-Punkt
*/

ESPmeshClass.prototype.createESP1_WRAPPER_and_BUFFER_MESH = function (r, posOnX, posOnY, posOnZ, circleColor) {

    //remove OLD ESP Circle AND Point
    while (_ESP1rootGroup.children.length > 0) {
        var object = _ESP1rootGroup.children[0];
        object.parent.remove(object);
    }

    //DRAW ESP1 KREIS
    var segmentCount = 30, geometry = new THREE.Geometry(), material = new THREE.LineBasicMaterial({ color: circleColor });
    for (i = 0; i <= segmentCount; i++) {
        var theta = i / segmentCount * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos(theta) * r,
                Math.sin(theta) * r,
                0));
    }
    var ESP1circle = new THREE.Line(geometry, material);
    ESP1circle.position.x = posOnX;
    ESP1circle.position.y = posOnY;
    ESP1circle.position.z = posOnZ;
    ESP1circle.name = "esp1MeshCircle";         // fix, da an diese klasse gebunden   
    _ESP1rootGroup.add(ESP1circle);

    //some Text with CSS2DObject  - https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_pdb.html
    var espDIV = document.createElement('div');
    espDIV.className = 'label';
    espDIV.textContent = 'ESP1';
    // espDIV.style.marginTop = '-1em';
    var espLabel = new THREE.CSS2DObject(espDIV);
    espLabel.position.set(posOnX -r + 10, posOnY + r - 5, 0);
    _ESP1rootGroup.add(espLabel);

    //DRAW ESP1 Center-Point
    var esp1CenterMesh = new THREE.Mesh(new THREE.SphereGeometry(_centerPointSize, 32, 16), new THREE.MeshBasicMaterial({
        color: circleColor
    }));
    esp1CenterMesh.position.x = posOnX;
    esp1CenterMesh.position.y = posOnY;
    esp1CenterMesh.position.z = posOnZ;
    _ESP1rootGroup.add(esp1CenterMesh);
};


/*
ESP2 - Kreis mit Mittel-Punkt
*/

ESPmeshClass.prototype.createESP2_WRAPPER_and_BUFFER_MESH = function (r,  posOnX, posOnY, posOnZ, circleColor) {

    //remove OLD ESP Circle AND Point
    while (_ESP2rootGroup.children.length > 0) {
        var object = _ESP2rootGroup.children[0];
        object.parent.remove(object);
    }

   
    //DRAW ESP2 KREIS
    var segmentCount = 30, geometry = new THREE.Geometry(), material = new THREE.LineBasicMaterial({ color: circleColor });
    for (i = 0; i <= segmentCount; i++) {
        var theta = i / segmentCount * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos(theta) * r,
                Math.sin(theta) * r,
                0));
    }
    var ESP2circle = new THREE.Line(geometry, material);
    ESP2circle.position.x = posOnX;
    ESP2circle.position.y = posOnY;
    ESP2circle.position.z = posOnZ;
    ESP2circle.name = "esp2MeshCircle";         // fix, da an diese klasse gebunden   
    _ESP2rootGroup.add(ESP2circle);

    //some Text with CSS2DObject  - https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_pdb.html
    var espDIV = document.createElement('div');
    espDIV.className = 'label';
    espDIV.textContent = 'ESP2';
    // espDIV.style.marginTop = '-1em';
    var espLabel = new THREE.CSS2DObject(espDIV);
    espLabel.position.set(posOnX - r+10, posOnY - r +10 , 0);
    _ESP2rootGroup.add(espLabel);

    //DRAW ESP2 Center-Point
   var esp2CenterMesh = new THREE.Mesh(new THREE.SphereGeometry(_centerPointSize, 32, 16), new THREE.MeshBasicMaterial({
        color: circleColor
    }));
    esp2CenterMesh.position.x = posOnX;
    esp2CenterMesh.position.y = posOnY;
    esp2CenterMesh.position.z = posOnZ;
    _ESP2rootGroup.add(esp2CenterMesh);

};




// Das Ist der ROTE BUBBLE   / ROTE PUNKT / XPOINT / TRI POINT  ***********************************************
// This will set the mesh where we finally found the Tri-Angulation-Point..a voxel or a re point etc.
// The Bubble/Bubbel is RAY !!  the name: "triPoint/noCannel;11.02.2018 06:42:39;E4:F8:EF:53:77:9D;/23.00/2C:3A:E8:14:C8:EF;/9.00/5C:CF:7F:1C:26:FD;/3.00/68:C6:3A:97:A5:89/X-cor/Y-COR
/*

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






