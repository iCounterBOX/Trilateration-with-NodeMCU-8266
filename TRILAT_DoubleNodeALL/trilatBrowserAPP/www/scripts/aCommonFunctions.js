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
    var hexString = 'white';

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




/*
TRI-Lateration Point From The DB via REST-API / muss noch verriegelt werden!! AS A JSON !!
_trilatDataAvailableAfterRestApiCall == true wird in REST api call gesetzt wenn daten empfangen wurden
_trilaterationMAC_JSON

[
   {
      "TS":"23.12.2018 06:30",
      "MAC":"E81F1F1F1F1F",
      "esp0":1.050000,
      "esp1":6.790000,
      "esp2":9.240000,
      "a0":0.00,
      "b0":0.00,
      "a1":-150.00,
      "b1":-3.20,
      "a2":-29.10,
      "b2":-28.30
   }
]

*/


function convertRSSI2Meter(rssiKALMAN, CalibrateDB_power) {
    var RATIO_linear;

    // kommt in abs() aber da DB  machen ihne MINUS
    rssiKALMAN = CalibrateDB_power - rssiKALMAN;
    RATIO_linear = Math.pow(10, rssiKALMAN / 10);
    return Math.sqrt(RATIO_linear);
}

/*

Wird vom CallBack des HTTP request DIREKT aufgerufen und sofort abgearbeitet!

ABER: der x/y wert sollte noch in der DB berechnet werden...Hatte versucht diese Pivot in einem CURSOR zu verwursten,
was auf die Schnelle NICHT gelang ..
Deshalb ist die Formel nun hier

*/

commonFktClass.prototype.setNextESP_TRIO_fromJSON = function () {
    var i = 0;
    document.getElementById("nrOfTriangulationnPoints").innerHTML = _trilaterationMAC_JSON.length;
    if (_trilaterationMAC_JSON !== "ERR:NoData" && _trilaterationMAC_JSON.length > 0 && _trilaterationMAC_JSON[i] !== "undefined") {                     // wenn VS keine Daten Hat..sendet VS  ."ERR:NoData"

        removeAllPoints();      // REMOVE ALL Spline Points before we draw them 

        for (i = 0; i < _trilaterationMAC_JSON.length; i++) {

                _currentTriPointFromArrayInScan = _trilaterationMAC_JSON[i];      // wird später der Name des roten bobbels
                _currentpeerMACinScan = _trilaterationMAC_JSON[i].MAC;   

                var x = Number(_trilaterationMAC_JSON[i].X);       // Schnittpunkt  --- TRILTERATIONS_PUNKT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                var y = Number(_trilaterationMAC_JSON[i].Y); 

                var r0 = _trilaterationMAC_JSON[i].esp0;
                var r1 = _trilaterationMAC_JSON[i].esp1;
                var r2 = _trilaterationMAC_JSON[i].esp2;


            /*
                Formula 2 - war in der  simulation https://www.desmos.com/calculator/mlfauoxx6h  sehr gut
                https://stackoverflow.com/questions/20416218/understanding-ibeacon-distancing/20434019#20434019
                wir gehen mit dem geglätteten RSSI (KALMAN) rein..: -->  @KalmanA
            */

                           

                var a0 =  Number(_trilaterationMAC_JSON[i].a0);    //_esp0CurrPosX;      //Position Master -- KreisMittelPunkte
                var b0 =  Number(_trilaterationMAC_JSON[i].b0);
                var a1 =  Number(_trilaterationMAC_JSON[i].a1);
                var b1 =  Number(_trilaterationMAC_JSON[i].b1);
                var a2 =  Number(_trilaterationMAC_JSON[i].a2);     //ESP2  x,y pos des Kreise!
                var b2 =  Number(_trilaterationMAC_JSON[i].b2);

                //Interim: hier kommen die  coordinaten der 3 sniffer vin der APP ( bzw. aus der DB!  die APP speichert diese werte via Node-RED in der DB )
                _esp0CurrPosX = a0;          // GLOBAL !!
                _esp0CurrPosY = b0;
                _esp1CurrPosX = a1;
                _esp1CurrPosY = b1;
                _esp2CurrPosX = a2;
                _esp2CurrPosY = b2;                

                //Die Positionen der Kreise kommen von der Main

              /*

                var A = (a1 - a0) * (Math.pow(a2, 2) + Math.pow(b2, 2) - Math.pow(r2, 2));
                var B = (a0 - a2) * (Math.pow(a1, 2) + Math.pow(b1, 2) - Math.pow(r1, 2));
                var C = (a2 - a1) * (Math.pow(a0, 2) + Math.pow(b0, 2) - Math.pow(r0, 2));

                y = [A + B + C] / [2 * (b2 * (a1 - a0) + b1 * (a0 - a2) + b0 * (a2 - a1))];
                x = [Math.pow(r1, 2) + Math.pow(a0, 2) + Math.pow(b0, 2) - Math.pow(r0, 2) - Math.pow(a1, 2) - Math.pow(b1, 2) - 2 * (b0 - b1) * y] / [2 * (a0 - a1)];
                */
                // dann die Kreise genau positionieren:

                _esp.createESP0_WRAPPER_and_BUFFER_MESH(r0, _esp0CurrPosX, _esp0CurrPosY, _esp0CurrPosZ, 'yellow');                    // ESP0 Circle and point
                _esp.createESP1_WRAPPER_and_BUFFER_MESH(r1, _esp1CurrPosX, _esp1CurrPosY, _esp1CurrPosZ, 'yellow');
                _esp.createESP2_WRAPPER_and_BUFFER_MESH(r2, _esp2CurrPosX, _esp2CurrPosY, _esp2CurrPosZ, 'yellow');


                var bubbleColor = _fkt.colorCodeFromLast2DigitsFromAmacAddress(_currentpeerMACinScan);       // Color of "RED-BUTTON" depend from MAC
                _esp.setTriAngulationPoint(x, y, 0, bubbleColor);

                addPoint(x,y);

                console.log("setNext Trilat X Y direct from JSON ( Formula ) X: " + x.toFixed(2) + "  Y: " + y.toFixed(2));   // Direkt die Koordinaten berechnet!!
                document.getElementById("triPeerMAC").innerHTML = _trilaterationMAC_JSON[0].MAC;
                document.getElementById("espDist_0").innerHTML = r0.toFixed(2);
                document.getElementById("espDist_1").innerHTML = r1.toFixed(2);
                document.getElementById("espDist_2").innerHTML = r2.toFixed(2);
                document.getElementById("esp0PosXY").innerHTML = "X=" + _esp0CurrPosX + " Y=" + _esp0CurrPosY;
                document.getElementById("esp1PosXY").innerHTML = "X=" + _esp1CurrPosX + " Y=" + _esp1CurrPosY;
                document.getElementById("esp2PosXY").innerHTML = "X=" + _esp2CurrPosX + " Y=" + _esp2CurrPosY;
                // console.log("setNextESP_TRIO_fromJSON(): " + JSON.stringify(_trilaterationMAC_JSON, null, 4));   // beautifier !! gibt den json sauber raus
                // zeige den aktuellen Datensatz in der Text-AREA  --  Text-AREA  --- Text-AREA ---  Text-AREA
                var m1 = _trilaterationMAC_JSON[0].TS + " M: " + _currentpeerMACinScan + "\n(0): " + r0.toFixed(2) + " (1): " + r1.toFixed(2) + " (2):" + r2.toFixed(2) + " X=" + x.toFixed(1) + " Y=" + y.toFixed(1) +  "\n..............................";
                _fkt.setLoadMessage(m1);
        }
        
        _trilaterationMAC_JSON = {};
    }
};


