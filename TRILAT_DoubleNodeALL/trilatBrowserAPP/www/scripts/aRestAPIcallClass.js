/*
************************   CLASS  REST  API  / CORE   *************************************

Data provided by the REST-API:

23.12.18:
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
        console.log("xhr.responseText: " + text);

        _fkt.setNextESP_TRIO_fromJSON();

        //ACTION END
        
    };

    xhr.onerror = function () {
        console.log("Woops, there was an error making the request (AP).");
        document.getElementById("runState").innerHTML = "xhr.onerror / CORS(xHrsScan) /(AP)Err getting data from IIs";
    };
    xhr.send();

    return minutes;
};




