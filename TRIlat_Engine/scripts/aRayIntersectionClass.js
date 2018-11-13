/*
CLASS: RAY Collusion INTERSECT etc class

Beobachtung

RAY auf ein geschlossenes circle-objekt geht nicht so lange sich der trigger IN diesem objekt befindet, wird ein HIT ausgelöst!


*/

function RAYintersectionClass() {
     


}

RAYintersectionClass.constructor = RAYintersectionClass;

/*

Globale Mesh:

ESP0circle: das ist der Main ESP ( weisser Ring )
ESP1circle Links auf der X-Achse neben ESP0
ESP2circle oberhalb von ESP0 auf der Y-Achse



SEE:
// https://stackoverflow.com/questions/36580283/can-a-three-js-raycaster-intersect-a-group
*/



RAYintersectionClass.prototype.collisionDetectionRAY_MOUSE = function (collidableMeshArray) {   

   
    _raycaster_TrilatPoint.setFromCamera(mouse, camera);
    var collisionResults = _raycaster_TrilatPoint.intersectObjects(collidableMeshArray, true);         // so haben wir weniger scene-objekte..nur die paar ray-Kandidaten!!

    //if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
    if (collisionResults.length > 0) {
        var objectName = collisionResults[0].object.name;
        console.log("Mouse-Intersection()/ Mesh : " + objectName );

            // aus dem objekt die Infos auslesen
          /*
          var x = collisionResults[0].point.x.                      NO   gibt string toFixed(2);
         var y = collisionResults[0].point.y.                               toFixed(2);
                var z = 0;
              
                // IRGENDWAS anzeigen !!
                //console.log("Nehmen & Speichern/ Tabellen-Anfang: isBubbleInTheArray()/ Mesh : " + meshName + " newX= " + newX + " newY= " + newY);
             */           

     }   
}


RAYintersectionClass.prototype.collisionDetectionRAY = function (interSectionMeshArray,ownObjectName) {

    var originPoint = interSectionMeshArray.position.clone();

    for (var vertexIndex = 0; vertexIndex < interSectionMeshArray.geometry.vertices.length; vertexIndex++) {
        var localVertex = interSectionMeshArray.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(interSectionMeshArray.matrix);
        var directionVector = globalVertex.sub(interSectionMeshArray.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

        var collisionResults = ray.intersectObjects(collidableMeshList, true);         // so haben wir weniger scene-objekte..nur die paar ray-Kandidaten!!

        //if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
        if (collisionResults.length > 0) {
            var objectName = collisionResults[0].object.name;

            // EXCLUSION - nicht den eigenen Kreis INTERSECTEN
            if (objectName.indexOf(ownObjectName) === -1) {
                var x = Math.round(collisionResults[0].point.x * 100) / 100;         //  ACHTUNG toFixed Ist eine STRING-Funktion...das gibt hier einen STRING !!!  BÖSE :: collisionResults[0].point.x.toFixed(2)
                var y = Math.round(collisionResults[0].point.y * 100) / 100;    
                var z = 0;
                _esp.setTheESPMarkerMesh(x, y, 0);
                
                 //console.log("Nehmen & Speichern/ Tabellen-Anfang: isBubbleInTheArray()/ Mesh : " + meshName + " newX= " + newX + " newY= " + newY);
                 return
                
            }
        }
    }
}

// durch das ESP0 kegel-array loopen..alles mögliche intersections !!

RAYintersectionClass.prototype.collisionDetectionESP0_KegelArray = function () {

    for (var i = 0; i < _ESP0_IntersectionObjectsMESH_BUFFER.length; ++i) {
        this.collisionDetectionRAY(_ESP0_IntersectionObjectsMESH_BUFFER[i], "esp0MeshCircle");       // gibt eine RAY funktion
    }
}

RAYintersectionClass.prototype.collisionDetectionESP1_KegelArray = function () {

    for (var i = 0; i < _ESP1_IntersectionObjectsMESH_BUFFER.length; ++i) {
        this.collisionDetectionRAY(_ESP1_IntersectionObjectsMESH_BUFFER[i] , "esp1MeshCircle");
    }
}

RAYintersectionClass.prototype.collisionDetectionESP2_KegelArray = function () {

    for (var i = 0; i < _ESP2_IntersectionObjectsMESH_BUFFER.length; ++i) {
        this.collisionDetectionRAY(_ESP2_IntersectionObjectsMESH_BUFFER[i] , "esp2MeshCircle");
    }
}


