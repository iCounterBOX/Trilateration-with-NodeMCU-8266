/*
CLASS: common functions
 Wald und Wiesen-Funktionen
*/

function commonFktClass() {

    
}

// ---------------------------  Formula´s      ------------------------------------------------------------------


commonFktClass.constructor = commonFktClass;

// Build radar screen circle 
commonFktClass.prototype.isNumber = function (val) {
    return Number(parseFloat(val));
};

commonFktClass.prototype.setLoadMessage = function (msg) {

    var col = _fkt.colorCodeFromLast2DigitsFromAmacAddress(_currentpeerMACinScan);     // die funktion gebt eine Number/Zahl zurück als farbe ..zB.: https://www.mathsisfun.com/hexadecimal-decimal-colors.html
    // var hexString = "#" + col.toString(16);                                           // daraus machen wir ne HEX für den style : https://www.w3schools.com/jsref/prop_style_color.asp
    var hexString = 'black';

    if (msg === "ERASE") {
        document.getElementById("txtAreaLog").value = '';
        document.getElementById("txtAreaLog").style.color = "red";
    } else {
        document.getElementById("txtAreaLog").value += msg + "\n";
        document.getElementById("txtAreaLog").style.color = hexString;

    }

};

commonFktClass.prototype.generateRandomNumber = function() {
    var min = 30,
        max = 50,
        highlightedNumber = Math.random() * (max - min) + min;
    return highlightedNumber;
};


/*****  wir machen die Gefunden-Bobbel  ** farbabhängig von der der gerade gescannten PeerMAC
Das ist keine Random color!! so können wir MAC unterscheiden

*/

commonFktClass.prototype.colorCodeFromLast2DigitsFromAmacAddress = function (MACaddy) {
    var colorCodeFromLast2DigitsFromAmacAddress = 0xffffff;

    if (typeof MACaddy !== 'undefined' && MACaddy !== "") {

        var partOfThisMAC = MACaddy.substr(MACaddy.length - 2);
        var intFromHex = parseInt(partOfThisMAC, 16);
        if (typeof intFromHex !== 'undefined' && intFromHex > 0) {
            colorCodeFromLast2DigitsFromAmacAddress = Number("0." + intFromHex) * 0xffffff;
            colorCodeFromLast2DigitsFromAmacAddress = Number(colorCodeFromLast2DigitsFromAmacAddress.toFixed(0));           // ok ...aber aufpassen  toFixed ist eigentlich für strings
        }

    } else {
        console.log("colorCodeFromLast2DigitsFromAmacAddress() / FAILS: macAddy= " & MACaddy);
    }

    return colorCodeFromLast2DigitsFromAmacAddress;
};


commonFktClass.prototype.storeCoordinate = function (xVal, yVal, array) {
    array.push({ x: xVal, y: yVal });
};


//https://stackoverflow.com/questions/20916953/get-distance-between-two-points-in-canvas

commonFktClass.prototype.getDistance = function (x1, y1, x2, y2) {
    var c = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    return c;
};

//Gib die FLÄCHE eines Dreieck :  https://www.mathopenref.com/coordtrianglearea.html
commonFktClass.prototype.getTriangleArea = function (x1, y1, x2, y2, x3, y3) {
    // grundlinie: g=xb−xa=5−(−1)=5+1=6LE   + Die Differenzen müssen immer Positiv sein, da sonst ein nicht positiver Flächeninhalt berechnet wird
    A = 0.5 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
    return A;
};

// Gib das Zentrum eines Dreiecks: https://www.mathopenref.com/coordcentroid.html

commonFktClass.prototype.getCentroidOfTriangle = function (x1, y1, x2, y2, x3, y3) {

    var C = [];
    C[0] = (Number(x1) + Number(x2) + Number(x3)) / 3;
    C[1] = (Number(y1) + Number(y2) + Number(y3)) / 3;

    return C;
};



// ---------------------------   Array-Funktions ------------------------------------------------------------------

commonFktClass.prototype.isCoordStoredInArray = function (meshName, triArray, newX, newY, minimalDistance) {

    var foundItInTheArray = false;

    // Tabelle war leer - speichern
    if (triArray.length === 0) {
        //console.log("Nehmen & Speichern/ Tabellen-Anfang: isCoordStoredInArray(newX, newY)/ Mesh : " + meshName + " newX= " + newX + " newY= " + newY);
        this.storeCoordinate(newX, newY, triArray);
        return false;       // brauchen wir garnicht weiter machen dieser punkt muss gesetzt werden
    }

    // wenn der punkt mit einer minimalen Distanz schon drin ist - NICHT nehmen

    for (var i = 0; i < triArray.length; i++) {
        var x = triArray[i].x;
        var y = triArray[i].y;

        var dist = this.getDistance(newX, newY, x, y);
        dist = Math.abs(dist);            // tofixed weg genommen  unsinn ist eine string funktion

        if (dist <= minimalDistance) {
            //console.log("WegWerfen: isCoordStoredInArray(newX, newY): meshName: " + meshName + "  DIST=  " + dist + " newX= " + newX + " newY= " + newY + " storedX= " + x  + " storedY= " + y );
            foundItInTheArray = true;
        }
    }
    //wenn punkt nicht im array ist, dann den punkt setzen

    if (foundItInTheArray === false) {
        this.storeCoordinate(newX, newY, triArray);     // schreiben ins array
        // console.log("Nehmen & Speichern: isCoordStoredInArray(newX, newY): meshName: " + meshName + " DIST=  " + dist + " newX= " + newX + " newY= " + newY + " storedX= " + x + " storedY= " + y);
    }

    return foundItInTheArray;	// scheint noch nicht drin zu sein

};






/* ***  Finde den Schnittpunkt ** Roter Punkt ** bubble ** Kreuzpunkt ** Intersection  ** BruteForce

https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value

closestPair:
http://js-algorithms.tutorialhorizon.com/2015/10/06/closest-pair-of-numbers/
https://en.wikipedia.org/wiki/Closest_pair_of_points_problem

ABER:
Ich wende mein REDUKTIONS-Verfahren an...wir suchen die am WEITESTEN voneinander liegenden punkte!
Die werden BEIDE gelöscht...wenn nur noch 4 oder 5 im array sind höre ich damit auf!
Ich gehe dann davon aus, DAS die restlichen nahe beieinander liegen ( ANNAHME !! ).

Dann wird ein Roter Punkt gesetzt

*/

/* ***  Finde den Schnittpunkt ** Roter Punkt ** bubble ** Kreuzpunkt ** Intersection  ** BruteForce

https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value

closestPair:
http://js-algorithms.tutorialhorizon.com/2015/10/06/closest-pair-of-numbers/
https://en.wikipedia.org/wiki/Closest_pair_of_points_problem

ABER:
Ich wende mein REDUKTIONS-Verfahren an...wir suchen die am WEITESTEN voneinander liegenden punkte!
Die werden BEIDE gelöscht...wenn nur noch 4 oder 5 im array sind höre ich damit auf!
Ich gehe dann davon aus, DAS die restlichen nahe beieinander liegen ( ANNAHME !! ).

Dann wird ein Roter Punkt gesetzt - 
startDist zB auf 4 setzen alles was dann größer ist führt an den rand des universums

*/

// DIE Perlentte ...der Bobble-Train

commonFktClass.prototype.DeletePointWithLargestDistance = function (aMeshArray, startDist) {
    var foundSomething = false;
    var dist = 0;
    var toDeleteThisMesh1;
    var toDeleteThisMesh2;

    // Brute-Force :  MaxDistance-Point Reduction .. Die 3 letzten lassen wir stehen


    if (typeof aMeshArray !== 'undefined') {

        while (aMeshArray.length > 3) {
            for (var i = 0; i < aMeshArray.length; ++i) {
                for (var j = i + 1; j < aMeshArray.length; ++j) {
                    var bubbleMesh_i = aMeshArray[i];
                    var ix = bubbleMesh_i.position.x;
                    var iy = bubbleMesh_i.position.y;
                    var bubbleMesh_j = aMeshArray[j];
                    var jx = bubbleMesh_j.position.x;
                    var jy = bubbleMesh_j.position.y;

                    dist = this.getDistance(ix, iy, jx, jy);
                    dist = Math.abs(dist);                   //

                    if (dist >= startDist) {
                        startDist = dist;
                        toDeleteThisMesh1 = bubbleMesh_i;       // sammeln und das limit suchen 
                        toDeleteThisMesh2 = bubbleMesh_j;
                        foundSomething = true;
                    }
                }
            }
            // die beiden Objekte mit der hösten distanz löschen - so lange durchlaufen, bis nur noch 3 drinnen sind

            if (foundSomething === true) {
                scene.remove(toDeleteThisMesh1);
                aMeshArray.splice(hitBubbleMeshGroup.indexOf(toDeleteThisMesh1), 1);
                scene.remove(toDeleteThisMesh2);
                aMeshArray.splice(hitBubbleMeshGroup.indexOf(toDeleteThisMesh2), 1);
                console.log("LÖSCHEN: DeletePointWithLargestDistance(): meshName1: " + toDeleteThisMesh1.name + "  meshName2: " + toDeleteThisMesh2.name + "  DIST=  " + dist);
            }
        }

        // für diese 3 dann ein Dreieck setzen  - UND unseren ROTEN BOBBLE !!
        if (foundSomething === true && aMeshArray.length === 3) {
            _esp.triangle4BobbleChain(aMeshArray[0].position.x, aMeshArray[0].position.y, aMeshArray[1].position.x, aMeshArray[1].position.y, aMeshArray[2].position.x, aMeshArray[2].position.y, "dieKetteDreiEck", 'yellow');
            // Mittelpunkt
            var triXY = this.getCentroidOfTriangle(aMeshArray[0].position.x, aMeshArray[0].position.y, aMeshArray[1].position.x, aMeshArray[1].position.y, aMeshArray[2].position.x, aMeshArray[2].position.y);
            var bubbleColor = _fkt.colorCodeFromLast2DigitsFromAmacAddress(_currentpeerMACinScan);       // Color of "RED-BUTTON" depend from MAC
            _esp.setTriAngulationPoint(triXY[0], triXY[1], -25, bubbleColor);

        }
        return aMeshArray;
    }

};





/*
Nimmt die DoppelDecker raus - jeder Knoten darf nur einen Bobbel haben...für das Dreieck

wenn die 3 kreise sich zentrisch am rand treffen..dann gibt es die "perlen-Kette
erkennbar zT 15 Bobbles im buffer ( TROTZ ständigem aufräumen ! )---UND mit geringem Abstand

ck / 12.11.18 /ToDo:  FIX?? prüfen!! garnicht erst in die BoubleMesh eintragen, wenn da schon so ein Kandidat drin ist!!??

*/

commonFktClass.prototype.DeleteMultiPoints = function (aMeshArray, minDist) {

    var foundSomething = false;
    var dist = 0;
    // perlenKettenLaenge = 0;    // wenn unter gesamt 50 bei ca 15 bobbles - dann Perlenkette !!
    var toDeleteThisMesh1;
    var toDeleteThisMesh2;

    // Brute-Force :  MaxDistance-Point Reduction     

    for (var i = 0; i < aMeshArray.length; ++i) {
        for (var j = i + 1; j < aMeshArray.length; ++j) {
            var bubbleMesh_i = aMeshArray[i];
            var ix = bubbleMesh_i.position.x;
            var iy = bubbleMesh_i.position.y;
            var bubbleMesh_j = aMeshArray[j];
            var jx = bubbleMesh_j.position.x;
            var jy = bubbleMesh_j.position.y;

            dist = this.getDistance(ix, iy, jx, jy);
            dist = Math.abs(dist);                       // Nicht nehmen...gibt string zurück uU          

            if (dist <= minDist) {      // wenn der bubble zb nur 0.5 weg ist, dann ist das ein doppelter  - dann muss einer weg
                minDist = dist;
                scene.remove(bubbleMesh_i);
                aMeshArray.splice(aMeshArray.indexOf(bubbleMesh_i), 1);
            }
        }
    }

    // Spezial-Fall Der TRAIN...viele BOBBLES wie eine Kette hintereinander 

    if (aMeshArray.length >= 12) {
        //Brauch ne IDEEE  !!
        //  _esp.triangle4BobbleChain(aMeshArray[0].position.x, aMeshArray[0].position.y, aMeshArray[1].position.x, aMeshArray[1].position.y, aMeshArray[2].position.x, aMeshArray[2].position.y, "dieKetteDreiEck", 'yellow'); 
        console.log("DeleteMultiPoints() / Circle-PerlenKette!! aMeshArray.length: " + aMeshArray.length + " OverAll Dist: " + minDist);
    }

    return aMeshArray;
};




/* TASK: Dreieck: Fläche, Dreieck mit kleiner Fläche, Dreieck mit kleinstem Umfang
// https://de.serlo.org/mathe/geometrie/analytische-geometrie/flaechen-volumenberechnung/flaechenberechnung-der-analytischen-geometrie/flaecheninhalte-volumen-kartesischen-koordinatensystem

In einer Punkte-Schar das kleinste Dreieck finden ( FLÄCHE / AREA ):

Wir machen brute force auf 3 mesh-Punkte!!  bilden je über die 3 eine dreiecks-fläche...das kleinste 3eck merken wir uns pro loop!
Die Formel für den Flächeninhalt eines Dreiecks ist  A=1/2⋅h⋅g
Prinzipiell OK...aber es gibt auch fast linienFlache Dreiecke...Kleinste Fläche...aber nicht was wir brauchen
Gibt den globalen parameter: _nearestNeighborDistX

*/
commonFktClass.prototype.getThe3nearest3PointsArea = function (aMeshArray) {

    var A = 0;              // berechnete Fläche
    var threeNearestBubbleMesh1;
    var threeNearestBubbleMesh2;
    var threeNearestBubbleMesh3;
    var minA = 1000000;        // kleinste gefundene Fläche

    // Doppeldecker entfer
    // this.DeleteMultiPoints();

    for (var i = 0; i < aMeshArray.length; ++i) {
        for (var j = i + 1; j < aMeshArray.length; ++j) {
            for (var k = j + 1; k < aMeshArray.length; ++k) {

                var bubbleMesh_i = aMeshArray[i];
                var ix = Number(bubbleMesh_i.position.x);
                var iy = Number(bubbleMesh_i.position.y);
                var bubbleMesh_j = aMeshArray[j];
                var jx = Number(bubbleMesh_j.position.x);
                var jy = Number(bubbleMesh_j.position.y);
                var bubbleMesh_k = aMeshArray[k];
                var kx = Number(bubbleMesh_k.position.x);
                var ky = Number(bubbleMesh_k.position.y);

                A = this.getTriangleArea(ix, iy, jx, jy, kx, ky);
                A = Math.abs(A);                                // tofixed weg genommen  unsinn ist eine string funktion

                if (A <= minA && A !== 0) {
                    minA = A;
                    threeNearestBubbleMesh1 = bubbleMesh_i;
                    threeNearestBubbleMesh2 = bubbleMesh_j;
                    threeNearestBubbleMesh3 = bubbleMesh_k;
                }
            }
        }
    }
    // zur kontrolle ein DreiEck Zeichnen
    _esp.triangle4regularHits(threeNearestBubbleMesh1.position.x, threeNearestBubbleMesh1.position.y, threeNearestBubbleMesh2.position.x, threeNearestBubbleMesh2.position.y, threeNearestBubbleMesh3.position.x, threeNearestBubbleMesh3.position.y, "distanzDreiEck", 'red');
    minA = 1000000;
};


/*
 Finde Das Dreieck über die kleinste Kantenlänge ( UMFANG bzw. Distanz-Summe )
 Bringt SEHR gute Ergebnisse
 Läuft wie die Volumen-Berechnung vom LOOP her....aber statt A wird U gemessen - Gute Tests
*/
commonFktClass.prototype.getThe3nearest3PointsDistance = function (aMeshArray) {

    var TriangeleIsSetOk = false;
    var U = 0;                      // berechnete Fläche
    var threeNearestBubbleMesh1;
    var threeNearestBubbleMesh2;
    var threeNearestBubbleMesh3;
    var minU = 1000000;             // kleinste gefundene Fläche


    for (var i = 0; i < aMeshArray.length; ++i) {
        for (var j = i + 1; j < aMeshArray.length; ++j) {
            for (var k = j + 1; k < aMeshArray.length; ++k) {
                var bubbleMesh_i = aMeshArray[i];
                var ix = Number(bubbleMesh_i.position.x);
                var iy = Number(bubbleMesh_i.position.y);
                var bubbleMesh_j = aMeshArray[j];
                var jx = Number(bubbleMesh_j.position.x);
                var jy = Number(bubbleMesh_j.position.y);
                var bubbleMesh_k = aMeshArray[k];
                var kx = Number(bubbleMesh_k.position.x);
                var ky = Number(bubbleMesh_k.position.y);

                U = this.getDistance(ix, iy, jx, jy) + this.getDistance(jx, jy, kx, ky);
                U = Math.abs(U);                                                                //  // tofixed weg genommen  unsinn ist eine string funktion

                if (U <= minU && U !== 0) {
                    minU = U;
                    threeNearestBubbleMesh1 = bubbleMesh_i;
                    threeNearestBubbleMesh2 = bubbleMesh_j;
                    threeNearestBubbleMesh3 = bubbleMesh_k;
                    TriangeleIsSetOk = true;
                }
            }
        }
    }


    if (TriangeleIsSetOk === true) {
        // zur kontrolle ein DreiEck Zeichnen
        var Area = this.getTriangleArea(threeNearestBubbleMesh1.position.x, threeNearestBubbleMesh1.position.y, threeNearestBubbleMesh2.position.x, threeNearestBubbleMesh2.position.y, threeNearestBubbleMesh3.position.x, threeNearestBubbleMesh3.position.y);
        Area = Math.abs(Area);            // tofixed weg genommen  unsinn ist eine string funktion

        if (Area >= _nearestNeighborDistX) {
            _esp.triangle4regularHits(threeNearestBubbleMesh1.position.x, threeNearestBubbleMesh1.position.y, threeNearestBubbleMesh2.position.x, threeNearestBubbleMesh2.position.y, threeNearestBubbleMesh3.position.x, threeNearestBubbleMesh3.position.y, "distanzDreiEck", 'red');
            // Mittelpunkt
            var triXY = this.getCentroidOfTriangle(threeNearestBubbleMesh1.position.x, threeNearestBubbleMesh1.position.y, threeNearestBubbleMesh2.position.x, threeNearestBubbleMesh2.position.y, threeNearestBubbleMesh3.position.x, threeNearestBubbleMesh3.position.y);
            var bubbleColor = _fkt.colorCodeFromLast2DigitsFromAmacAddress(_currentpeerMACinScan);       // Color of "RED-BUTTON" depend from MAC
            _esp.setTriAngulationPoint(triXY[0], triXY[1], -25, bubbleColor);
        } else {
            console.log("getThe3nearest3PointsDistance() / Ein extrem FLACHES DreiEck?? :: " + Area);
        }

    }

    // platz für sonderfälle

    return aMeshArray;
};

/*
TRI-Lateration Point From The DB via REST-API / muss noch verriegelt werden!!
_trilatDataAvailableAfterRestApiCall == true wird in REST api call gesetzt wenn daten empfangen wurden

DAS ist das JSON, welches wir via REST mit den MAC´s befüllen   -   _trilaterationMAC_JSON

[   {
      "scanTimeStamp":"09.11.2018 13:37",
      "MAC":"E8ABFA2D7F1F",
      "esp0":[
         0,
         -56.76,
         1551539
      ],
      "esp1":[
         1,
         -66.33,
         1551560
      ],
      "esp2":[
         2,
         -77.32,
         1551556
      ]
   },
   {
      "scanTimeStamp":"09.11.2018 13:38",
      "MAC":"E8ABFA2D7F1F",
      "esp0":[
         0,
         -55.61,
         1551598
      ],
      "esp1":[
         1,
         -65.75,
         1551752
      ],
      "esp2":[
         2,
         -72.98,
         1551672
      ]
   }
]

*/

/*
12.11.18 / FIX..fehler ..hier kein LOOP!! es soll ein DS abgearbeitet werden und DANN das element AUS der Table gelöscht werden
original:
if (typeof singleDataSet !== 'undefined' && singleDataSet !== "") {
und nicht:
for (var i = 0; i < _trilaterationMAC_JSON.length; i++) {

*/

commonFktClass.prototype.setNextESP_TRIO_fromJSON = function () {
    if (_trilaterationMAC_JSON !== "ERR:NoData") {                     // wenn VS keine Daten Hat..sendet VS  ."ERR:NoData"

        //get distances from data     - wenn ein punkt gesetzt ist, wird der aus dem buffer geworfen !!..Buffer wird mit jedem cycle kleiner
                
        if (typeof _trilaterationMAC_JSON[0].esp0 !== 'undefined' && typeof _trilaterationMAC_JSON[0].esp1 !== 'undefined' && typeof _trilaterationMAC_JSON[0].esp2 !== 'undefined') {

            // Punkt-Objekt aus dem JsonPayload
            /*
            console.log(_trilaterationMAC_JSON[0].scanTimeStamp);
            console.log(_trilaterationMAC_JSON[0].MAC);
            console.log(_trilaterationMAC_JSON[0].esp0);        //
            console.log(_trilaterationMAC_JSON[0].esp1);
            console.log(_trilaterationMAC_JSON[0].esp2);
            */

                // attribute aus dem string auslesen
                _currentTriPointFromArrayInScan = _trilaterationMAC_JSON[0];      // wird später der Name des roten bobbels
                _currentpeerMACinScan = _trilaterationMAC_JSON[0].MAC;
                
                var dist0 = Number(_trilaterationMAC_JSON[0].esp0[1]);      // esp0 - RSSI
                var dist1 = Number(_trilaterationMAC_JSON[0].esp1[1]);      // esp1 - RSSI
                var dist2 = Number(_trilaterationMAC_JSON[0].esp2[1]);      // esp2 - RSSI
               
                //if (peerMAC == "E8:AB:FA:2D:7F:1F") {

                if (dist0 > 0 && dist1 > 0 && dist2 > 0) {

                    _esp.setEsp0Esp1Esp2DistanceDIRECT(dist0, dist1, dist2);                    // 3 MessKreise positionieren

                    document.getElementById("triPeerMAC").innerHTML = _trilaterationMAC_JSON[0].MAC;
                    document.getElementById("espDist_0").innerHTML = dist0;
                    document.getElementById("espDist_1").innerHTML = dist1;
                    document.getElementById("espDist_2").innerHTML = dist2;

                   // console.log("setNextESP_TRIO_fromJSON(): " + JSON.stringify(_trilaterationMAC_JSON, null, 4));   // beautifier !! gibt den json sauber raus

                    // zeige den aktuellen Datensatz in der Text-AREA  --  Text-AREA  --- Text-AREA ---  Text-AREA
                    var m1 = _trilaterationMAC_JSON[0].scanTimeStamp + " MAC: " + _currentpeerMACinScan + "\n(0): " + dist0 + "  (1): " + dist1 + "  (2):" + dist2 + "\n..........................";
                    _fkt.setLoadMessage(m1);
                }
           
            // nächster im nächsten MainLoop - Dieses Array-Element ist jetzt GESETZT!! ( 3 TRILAT-CIRCLES )     //Kann NUR gesetzt werden WENN EIN HIT BOBBEL ( ROTER PUNKT ) gestzt wird..
            // jetzt muss ja erst einmal geloopt werden!!      
             
            //console.log(_trilaterationMAC_JSON);        // alternative:  console.log(JSON.stringify(_trilaterationMAC_JSON)); strigify gives back the original String of this object
            _trilaterationMAC_JSON.splice(0, 1);        // <<<<<<<<=====   REMOVE instead von delete...keine undefined   keine Lücke - item [0] will be removed <<<<<<<=======
            //console.log(_trilaterationMAC_JSON);        // this gives back the object as a tree!

            document.getElementById("nrOfTriangulationnPoints").innerHTML = _trilaterationMAC_JSON.length ;
        }
    }
};

