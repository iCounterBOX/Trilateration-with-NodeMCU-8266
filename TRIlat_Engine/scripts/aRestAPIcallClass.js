/*
************************   CLASS  REST  API  / CORE   *************************************

*/

function restApiClass() {

    // ARRAYS für CORE REST API-Calls

    this._currentMACdevices = [];                 // we get a long string from DB with MAC and info  SEPARATED by "|"
    this._currentAccessPts = [];                  // AP´s
    
}

/*

ToDo:
Javascript-Friendly REST API with CORS
https://coderwall.com/p/fqpuug/javascript-friendly-rest-api-with-cors


*/

restApiClass.constructor = restApiClass;

// Make the actual CORS request.  OK!! Arsch gerettet !! - https://www.html5rocks.com/en/tutorials/cors/ 
// Create the XHR object.

restApiClass.prototype.createCORSRequest = function (method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
};

/*
' **************  CoreRequest / GET THE TRILATERAL-DATA  *************************************************************************************
'
' this api is needed in the TRILATERATION  THREE JS APP
'
'So stehts in der MS SQL DB.... Gibt die Trilaterations-Trippel - PIVOT select / MS SQL Mangement Service
'scanTimeStamp	MAC	            esp0	            esp1	            esp2
11.2018 20:50	E8ABFA2D7F1F	0;-58.36;1399440	1;-68.43;1399445	2;-83.28;1399435
11.2018 20:51	E8ABFA2D7F1F	0;-58.51;1399490	1;-68.39;1399505	2;-83.36;1399517
11.2018 20:52	E8ABFA2D7F1F	0;-59.05;1399637	1;-68.58;1399643	2;-83.69;1399650
11.2018 20:53	E8ABFA2D7F1F	0;-57.86;1399742	1;-67.78;1399756	2;-84.52;1399760
11.2018 20:54	E8ABFA2D7F1F	0;-57.67;1399823	1;-65.00;1399833	2;-81.98;1399836
'
'so bekommen wir es von der REST API - NACH dem JSON PARSE
'
' lastScanDateX	            MAC	            esp1	                esp2	                    esp3
'[{"scanTimeStamp":"08.11.2018 20:59","MAC":"E8ABFA2D7F1F","esp0":"0;-57.34;1400260","esp1":"1;-64.01;1400264","esp2":"2;-79.96;1400256"},{"scanTimeStamp":"08.11.2018 21:29","MAC":"E8ABFA2D7F1F","esp0":"0;-58.78;1402921","esp1":"1;-68.60;1402938","esp2":"2;-84.80;1402934"}]
'
Das ist der JSON payload
[
   {
      "scanTimeStamp":"08.11.2018 20:59",
      "MAC":"E8ABFA2D7F1F",
      "esp0":"0;-57.34;1400260",
      "esp1":"1;-64.01;1400264",
      "esp2":"2;-79.96;1400256"
   },
   {
      "scanTimeStamp":"08.11.2018 21:29",
      "MAC":"E8ABFA2D7F1F",
      "esp0":"0;-58.78;1402921",
      "esp1":"1;-68.60;1402938",
      "esp2":"2;-84.80;1402934"
   }
]
'
CALL:
makeCorsRequest4TrilaterationData(2)      <<-- steht für alle Daten der letzten 20 Minuten...das (-) MINUS wird in der Funktion gesetzt!!
replace : "[{  mit '[{
replace }]"  mit }]'
*/

restApiClass.prototype.makeCorsRequest4TrilaterationData = function (minutes) {
        
    // in gui.dat its possible to give a time from now back ( e.g. 600 min)

    // minuteValue = parseInt(minutes);     // fehler  ist immer in den else zweig gelaufen
    // minuteValue = Math.abs(minuteValue);
    url = "http://" + HOST_IP + ":80/api/trilateral/" + "-" + minutes;       // must at the end a MINUS (-) value for the rest api
   // } else url = 'http://' + HOST_IP + ':80/api/trilateral/' + '-' + 3;       // OOB default 5 Minuten = 5 Minuten

    console.log("makeCorsRequest4TrilaterationData() / url= " + url);

    var xhr = this.createCORSRequest('GET', url);
    if (!xhr) {
        console.log("CORS not supported");
        return;
    }

    // Response handlers!  ACHTUNG !! Die Action NACHDEM wir daten bekommen :: MUSS HIER STATT FINDEN !!!!
       

    xhr.onload = function () {
        _trilaterationMAC_JSON = {};          // frisch auf 0 
        var text = xhr.responseText;
        // empfangenen String etwas säubern
        //console.log("JSON-RAW: " + text);
        text = text.replace("\"[{", "[{");     // Ersetzt die double Quota  durch NICHTS !!
        text = text.replace("}]\"", "}]");      // AM Anfang und am ENDE
        text = text.replace(/\\"/g, '"');       // Ersetzt \" im JSON text NUR durch "
        text = text.replace(/\"\[/g, '[');
        text = text.replace(/\]\"/g, ']');

        //console.log("JSON-FIT:: " + text);

        _trilaterationMAC_JSON = JSON.parse(text); //  MUSS jetzt als OBJECT zur Verfügung stehen

        
        document.getElementById("nrOfTriangulationnPoints").innerHTML = "";
       
        _fkt.setLoadMessage("ERASE");                                   // den AnzeigeBlock löschen

        //Jetzt sind die Daten im Array  ...abgearbeitet wird das dann im Main-Loop eines nach dem Anderen      
        console.log("Statistics:/ makeCorsRequest4TrilaterationData(minutes) /totalNrdeliveredCIs= " + _trilaterationMAC_JSON.length);
        console.log("xhr.responseText" + text);

        // ?????????????????  weshalb schon hier einen setzen???????????????????????????????????????????
        _fkt.setNextESP_TRIO_fromJSON();       // setzt die trilat kreise

        //ACTION END
        
    };

    xhr.onerror = function () {
        console.log("Woops, there was an error making the request (AP).");
        document.getElementById("runState").innerHTML = "xhr.onerror / CORS(xHrsScan) /(AP)Err getting data from IIs";
    };
    xhr.send();

    return minutes;
};




