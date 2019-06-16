/** TX (SLAVE) + OLED +  IIs  / WEMOS or MCU

S E L E C T :
WeMos D1 mini Pro V1 : COM PORT: Silicon Labs CP210x
LONIN D1 mini pro v2: CH340


LONIN D1 mini pro v2
https://wiki.wemos.cc/_media/products:d1:sch_d1_mini_pro_v2.0.0.pdf
https://projetsdiy.fr/nouvelle-wemos-lolin-d1-mini-pro-esp8266ex-16mb-connecteurs-ipex-i2c-batterie-lipo/

ACHTUNG wegen OLED Display
Wire.begin(D1, D2);				// F�R Wemos LoLin d1 mini Pro v2.0.0  ( der mit dem Stecker )  D1 = SDA  D2 = SCL
Neuere Nodes haben das display auf D1, D2!!

Wenn der DHCP h�ngt bzw wir NIcht auf den IIs kommen: How2_TP-LINK_SpeedPort_Icams_V01.docx
gerade getestet-OK::
ipconfig /release
ipconfig /renew
...danach ..connected to REST server..ok

Damit der MSI/SQLEXPRESS im netz sichtbar wird:

services/standardview...alles auf automatic setzen:
DNS client
Funktions Suchanbieter fdHost
FunktionsSuchanbieter-Host ( Function DiscoveryResource / fdResPub )
SSDP discovery
UPnP Device Host


15.10.18 TxSlave OK: mini-Freeze!! l�uft mit: #define SWBB_MODE 1
15.10.18 TxSlave2:
+ sniffer data wird wird vom scanner via pjon empfangen

ToDo�s:

mit der googleApi die geo-location bekommen:
https://www.youtube.com/watch?v=QhdvIJ_qlFQ

20.10.18:

21.10.18: next version: IIS und dort dann folgende sequenz::

DECLARE @json2 NVARCHAR(MAX);
SET @json2 = '{
  "D":[
	{
	  "I":0,
	  "T":0,
	  "M":"A4C49440E714",
	  "R":[
		-61,-63
	  ]
	},
	{
	  "I":0,
	  "T":0,
	  "M":"E8ABFA2D7F1F",
	  "R":[
		-78, -77, -74
	  ]
	}
  ]
}'
callback: http.post(url, headers, body, callback)
https://nodemcu.readthedocs.io/en/latest/en/modules/http/
beisp m httClient: https://arduino.stackexchange.com/questions/50931/how-to-post-http-post-requests-on-my-website

26.10.18:  altes format war ok  -ABER bei manchen devices reich es nicht auf HH:mm ( ohne sec ) zu groupen f�r die Filter.
werden einen group counter ( e.g. 150 hits ) dem json  mitgeben..

1.11.18: Dieser knoten hat noch keinen broadcast - channel-synch  Das kommt nun in Version 5 / THIS VERSION
3.11.18: aktivierung der OLED displays

02.01.19: SELBE Version wie TxSlave5   ABER mit AP+STA funktion!!  Wir messen darüber die Abstände der MCU´s zueinander.
Die RSSI-Abstände!!  nicht die physikalischen.. Die RSSI-Distances fließen in die Formel mit ein!!
-ESP bekommt einen eigenen HostName   AP_ESP_1  oder AP_ESP_2
-Eigene MAC: 
ESP0: 0xA8, 0xD9, 0x00, 0x00, 0x0E, 0x00
ESP1: 0xA8, 0xD9, 0x00, 0x00, 0x0E, 0x01
ESP2: 0xA8, 0xD9, 0x00, 0x00, 0x0E, 0x02
AP..wenn der ESP AP ist, dann TAUCHT der natürlich N I C H T im scan selbst auf ( Kontrolle auf dem TABLET!! )
COOL funktioniert..Die AP sind im Netz Sichtbar und der ESP0 kann den RSSI dort abgreifen
ENDE Hier!
TxSlave5.2  wird diese Daten dann zu Shiftr und zur DB übertragen

*/


#define SWBB_MODE 1
#define SWBB_LATENCY 2000
#define PJON_PACKET_MAX_LENGTH 4096
#define PJON_MAX_PACKETS 1

#include <Arduino.h>
#include <time.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <WiFiUdp.h>
#include <ESP8266WebServer.h>
#include "osapi.h"
#include "os_type.h"
#include "user_config.h"
#include <PJON.h>

#include <Wire.h>		// 
#include <SSD1306Ascii.h>
#include <SSD1306AsciiWire.h>	// Original .h  zZ ein 64 Bit Display  - https://github.com/adafruit/Adafruit_SSD1306/issues/57


PJON<SoftwareBitBang> bus(44);


//4 the scanner:
//#include <user_interface.h>

#define DISABLE 0
#define ENABLE 1

const uint8_t _NODE_ID = 2;		//  TxMaster = 0  TxSlave = 1   TxSlave = 2

//AP4Distance same Time   A C H T U N G  !! die Node_ID  hier stets mit verwursten!!
uint8_t espMAC[6] = { 0xA8, 0xD9, 0x00, 0x00, 0x0E, 0x02 }; 		// ESP0= 0x00 .. 01...02
const char *APssid = "AP_ESP_2";    // JE nach ESP anpassen!! Active AP  ONLY ESP1 and 2
const char *APpw = "12345678";
ESP8266WebServer server(80);


int oledRowCount = 0;
int oledProgressPoints = 0;
float _BetrStdZaehler = 0;		// 0X3C+SA0 - 0x3C or 0x3D
#define I2C_ADDRESS 0x3C		// Define proper RST_PIN if required.
#define RST_PIN -1
SSD1306AsciiWire oled;

// ERROR - COUNTER

#define _ESP_ERR_COUNT_LIMIT 50		// Ausl�ser f�r den Reset wenn dieser Schwellwert erreicht ist
uint16 _ESP_ERROR_COUNTER = 0;

//>>>>>>> Configure the scanner Stuff  ++  Configure the scanner Stuff  ++  Configure the scanner Stuff  <<<<<<<<<
//char ssid[] = "NTGRck";
//char pass[] = "mypowerlaser005**";

//wlanRouter @ Home
char ssid[] = "WLAN-H8VRFB";
char pass[] = "2183004109318938";

//IIs SERVER

const char* fingerprint = "bbdfd6880048abfea98f294f0b0084da4eb233a0";
//char iisServer[] = "192.168.1.69";		// NTGR   MSI  192.168.1.69
char iisServer[] = "192.168.2.102";   // MSI    name address for Google (using DNS)
									  //int iisServerPort = 443;
int iisServerPort = 80;

WiFiClient client;



// UDP + UDP + UDP + UDP + UDP + UDP + UDP + UDP + UDP + UDP + UDP + UDP + UDP + UDP

IPAddress udpBroadCastIP;   // wird unten gebildet aus der localIP und .255
WiFiUDP Udp;
unsigned int localUdpPort = 8888;
#define MAXSbuffer 100
char incomingPacket[MAXSbuffer];  // buffer for incoming packets
int incommingUDPpacketSize = 0;   // siehe MainLoop..wenn Udp rein kommt ..ist hier paketGr??drin

//f�r die time.h
int timezone = 0;		// 2 w�re genau passend f�r D-land...wird aber in der cloud gemacht deshalb 0
int dst = 0;
struct tm * timeinfo;
time_t now;


char currentEpocheTime[13];	// wird im loop gesetzt und als Epoche TimeStamp dem DatenSatz mitgegen

//Timer
unsigned long displayTimer = 0;
float operatingTime_seconds = 0;
unsigned long interval_1s = 1000; // the time we need to wait
unsigned long previousMillis = 0; // millis() returns an unsigned long.

// TimeFrames Tick Tack
uint8  curr_channel = 1;
unsigned long CHANNEL_HOP_INTERVAL_MS = 1000;
unsigned long CHANNEL_HOP_previousMillis = 0;

bool _weAreBusyWithDataTransfer = false;


// A Struct Array to keep the sniffed MAC devices - Payload


// **********  CODE Section *********************************************************************

void IoT_WatchDog(bool active) 	// Schaltet	den IoT	-	Brick	-	Watchdog ein(true) oder aus(false)
{
	ESP.wdtFeed();
	// Watchdog Timer zur�cksetzen
	if (active)
	{
		ESP.wdtEnable(65535);		// Watchdog Timer einschalten auf 5 Sekunden (5000 ms	.)
	}
	else
	{
		ESP.wdtDisable();		// Watchdog Timer ausschalten
	}
	ESP.wdtFeed();	// Watchdog Timer zur�cksetzen
}


// gibt die BetriebsStunden als decimal wert zur�ck
float betriebsStundenCounter() {
	return (float)((operatingTime_seconds / 60.0) / 60.0);
}


long RAMfree(const char *str)
{
	//ESP.getVcc()  uu die Betriebspannung �berwachen
	long s, h;
	Serial.printf("\n %s - Heap free = \'%d\' \n", str, system_get_free_heap_size());

}




/* Pr�fen ob der ErrorCounter den kritischen Schwellwert �berschriffen hat
ESP.reset() is a hard reset and can leave some of the registers in the old state which can lead to problems, its more or less like the reset button on the PC.
ESP.restart() tells the SDK to reboot, so its a more clean reboot, use this one if possible.
the boot mode:(1,7) problem is known and only happens at the first restart after serial flashing.
if you do one manual reboot by power or RST pin all will work more info see: #1017
*/
void Check_ESP_ErrCounter() {
	if (_ESP_ERROR_COUNTER >= _ESP_ERR_COUNT_LIMIT) {
		Serial.print("_ESP_ERROR_COUNTER exeed the limit: "); Serial.println(_ESP_ERR_COUNT_LIMIT);
		Serial.print("WE RESTART THE ESP - NOW !!!!!!!!!!!!!! ");
		oled.println("ESP_ERR_COUNTER! - REST NOW");  CheckOledMessage();		// check after each oled.println
		oled.println("ESP_ERR_COUNTER! - REST NOW");  CheckOledMessage();		// check after each oled.println
																				// ???? https://github.com/esp8266/Arduino/issues/1722
		wdt_reset(); ESP.restart(); while (1)wdt_reset();		//ESP.restart();
	}
}


void CheckOledMessage() {
	//Display  ** Display  ** Dosplay ************************
	if (oledRowCount >= 8) {	//bei 128 x 32  sind das 4   or bei 128 x 64  sind das 8
		oledRowCount = 0;
		oled.clear();		//oled.set1X();  //  alles ist auf 1 ..	
		oled.print("n"); oled.print(_NODE_ID); oled.print(" ");  oled.print((float)betriebsStundenCounter(), 2); oled.print(" H"); oled.print(system_get_free_heap_size()); oled.print(" !_");	oled.println(_ESP_ERROR_COUNTER);	// check after each oled.println		
	}
	++oledRowCount;	// jedes CRLF ist eine Zeile und z�hlt als rowCount	
}

//UDP  + UDP  + UDP +UDP  + UDP  + UDP + UDP  + UDP  + UDP + UDP  + UDP  + UDP 

void responseBackString(String reponseMsg, IPAddress ip, uint16_t port) {

	if (reponseMsg.length() < 100) {
		//Serial.printf("responseBackString / BroadCastIP %d.%d.%d.%d\n", ip[0], ip[1], ip[2], ip[3]);
		Udp.beginPacket(ip, port);
		char replyPack[100];  // a reply string to send back
		reponseMsg.toCharArray(replyPack, 100); //  ACHTUNG : Der satz hier darf NUR 100 Byte lang sein !!
		Udp.write(replyPack);
		Udp.endPacket();
	}
	// SEND to ESP 1 and  ESP2  / a reply, to the IP address and port we got the packet from
}


// we use this to BROADCAST the channel  e.g.
void responseBackChar(char reponseMsg, IPAddress ip, uint16_t port) {
	//Serial.printf("responseBackChar / BroadCastIP %d.%d.%d.%d\n", ip[0], ip[1], ip[2], ip[3]);
	Udp.beginPacket(ip, port);
	Udp.write(reponseMsg);
	Udp.endPacket();

	// SEND to ESP 1 and  ESP2  / a reply, to the IP address and port we got the packet from
}



//PJON  + PJON  + PJON  + PJON + PJON  + PJON  + PJON  + PJON + PJON  + PJON  + PJON  

void error_handler(uint8_t code, uint16_t data, void *custom_pointer) {
	if (code == PJON_CONNECTION_LOST) {
		Serial.print("Connection lost with device ");
		Serial.println((uint8_t)bus.packets[data].content[0], DEC);
		++_ESP_ERROR_COUNTER;
	}
	if (code == PJON_ID_ACQUISITION_FAIL) {
		Serial.print("Connection lost with device ");
		Serial.println(data, DEC);
		++_ESP_ERROR_COUNTER;
	}
	if (code == PJON_DEVICES_BUFFER_FULL) {
		Serial.print("Master devices buffer is full with a length of ");
		Serial.println(data);
		++_ESP_ERROR_COUNTER;
	}
};

/*
PJON - Receiver Call Back

Payload wird vom scanner gesendet
Payload wird aufbereitet ( sendWifiDevicesToRestAPI(jsonPayload); )
PayLoad wird zum IIs gesendet ( )
*/

void pjonReceiverFkt(uint8_t *payload, uint16_t length, const PJON_Packet_Info &packet_info) {


	_weAreBusyWithDataTransfer = true;

	String jsonPayload = "";

	// Packet content
	Serial.print("Got PJON Data: ");
	//for (uint8_t i = 0; i < length; i++) {  SO bl??das teil geht nur bis 255 :-(
	for (int i = 0; i < length; i++) {
		//Serial.print((char)payload[i]);
		jsonPayload += (char)payload[i];
		//if (payload[i] == '@') ++msCurrDeviceCounter;
	}

	jsonPayload.replace("@T", "0");		// obsolete
	jsonPayload.replace("@I", (String)_NODE_ID);
	Serial.println(jsonPayload);

	sendWifiDevicesToRestAPI(jsonPayload);
	delay((uint32_t)100);

	_weAreBusyWithDataTransfer = false;
}


//AP4Distance /  AP scan   MASTER ONLY !!
void printAP_ScanResult(int networksFound)
{
	Serial.printf("%d network(s) found\n", networksFound);
	for (int i = 0; i < networksFound; i++)
	{
		if (WiFi.SSID(i) == "AP_ESP_1" || WiFi.SSID(i) == "AP_ESP_2") {
			Serial.printf("%d: %s, Ch:%d (%ddBm) %s\n", i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i), WiFi.encryptionType(i) == ENC_TYPE_NONE ? "open" : "");
			break;
		}
	}
}

bool sendWifiDevicesToRestAPI(String jsonPayload) {
	boolean transFerWasOK = false;

	if (WiFi.status() != WL_CONNECTED) {
		WIFI_Connect();   //  ***************   WIFI CONNECT AGAIN  **********************************
	}

	if (WiFi.status() == WL_CONNECTED) {
		Serial.println("\nWiFi.status(): WL_CONNECTED - OK");

		/*  WE NEED QUOTES!! \"   without VS will not accept the string !!
		[{"I":1,"T":1540109204,"M":"74F06D34E400","R":"80,83,79,82,78,84,81,85"},{"I":1,"T":1540109204,"M":"645D8638AAC7","R":"93,90,92,93,92,93,92"}]
		ben�tige NUR die single quotes..die """ macht VS beim import!!   supi		*/


		jsonPayload = "'" + jsonPayload + "'";
		Serial.println(jsonPayload);

		// ---  Transfer to webservice ---------------------------------------------------
		postDataToRestAPI(iisServer, iisServerPort, "/api/scanner", jsonPayload);
		// ---  E N D    Transfer to webservice ---------------------------------------------
				
	}
	else {
		Serial.printf("WiFi / not connected !!");
	}
	transFerWasOK = true; // true or false

	//AP4Distance  /  NEW 02.01.19 - MASTER NODE will check the Distance of ESP1 and 2   TRILAT slaves...provisorisch mal hier angetriggert
	//später mal per ZeitSteuerung!!

	if (_NODE_ID == 0 ) {		
		Serial.print("\nStart the AP scan -- !! TimeConsuming !! "); Serial.print(_NODE_ID);	
		WiFi.scanNetworksAsync(printAP_ScanResult);
	}
		


	return transFerWasOK;
}


/*


*/

bool postDataToRestAPI(char* iisServ, int sPort, String restAPI, String PostData) {
	bool weGotGoodData = false;
	bool gotResultFromVS = false;


	if (!client.connected()) {
		Serial.print("postDataToRestAPI() / connecting to "); Serial.println(iisServ);
		// Use WiFiClient class to create TCP connections
		if (!client.connect(iisServ, sPort)) {
			Serial.println("connection failed");
			oled.println("IIS connect ERR!");    CheckOledMessage();
			++_ESP_ERROR_COUNTER;
			return false;
		}
	}

	unsigned long  msMeasureStart = millis();		// Start der ZeitMessung

	if (client.connected()) {
		Serial.println("connected to REST server..established");
		String postStr = "POST " + restAPI + " HTTP/1.1";
		client.println(postStr);    // Make a HTTP request: /posts..ok: "POST /api/scanner  HTTP/1.1"
		client.println("Host: MSI");                    //client.println("Host: jsonplaceholder.typicode.com");
		client.setNoDelay(true);
		client.println("Connection: close");
		client.println("Cache-Control: no-cache");
		client.println("Content-Type: application/json");
		client.print("Content-Length: ");  client.println(PostData.length());
		client.println();
		client.println(PostData);

		Serial.println("[IIs Response:]");
		oled.print("->IIS ("); oled.print(PostData.length()); oled.println(")");   CheckOledMessage();
		String line = "";
		while (client.connected())
		{
			line = client.readStringUntil('\n'); // we get several lines back from server  line by line
			Serial.print(line);
			if (line.indexOf("200") != -1) {
				oled.print("<-IIS ("); oled.print("200"); oled.println(")");   CheckOledMessage();
			}
			if (client.available())
			{
				String line = client.readStringUntil('\n'); // we get several lines back from server  line by line
				Serial.println(line);

				if (line.indexOf("200") != -1) weGotGoodData = true;	// es kommen einzelne Lines ! die 200 kommt schnell...der Rest braucht ewig - OBWOHL die Verarbeitung in VS SEHR schnell IST  ca. 130 ms   VS Total ca 15 SEKUNDEN !!
				if (line.indexOf("201") != -1) weGotGoodData = true;
				if (line.indexOf("202") != -1) weGotGoodData = true;
				//if (line.indexOf("HTTP") != -1) Serial.print(line);
				//if (line.indexOf("title") != -1) Serial.print(line);
				if (line.indexOf("VS_") != -1) {
					gotResultFromVS = true;
				}
				if (weGotGoodData == true && gotResultFromVS == true) break;
			}
		}
		client.stop();
		Serial.print("\nDISCONNECTED / TOTAL TransferTime ESP -> VS/IIs (ms): ");  Serial.println(millis() - msMeasureStart);


	}
	else
	{
		Serial.println("connection failed!- no connection to IIs");
		client.stop();
	}

	return weGotGoodData;

}

//AP4Distance /  We give this ESP a Unique MAC
void makeNonUniqueMac(uint8_t mac[6])
{
	//Serial.print("MAC before makeNonUniqueMac(): "); Serial.println(mac[0],HEX);
	mac[0] = mac[0] & ~0x01;
	//Serial.print("MAC AFTER makeNonUniqueMac(): "); Serial.println(mac[0], HEX);
}
bool changeMac(const uint8_t mac[6])
{	
	return wifi_set_macaddr(SOFTAP_IF, const_cast<uint8*>(mac));		// !!! cause we use softAP STATION_IF
}


void Stat_WiFi() {
	Serial.println();
	WiFi.printDiag(Serial);
	Serial.print(F("IP: "));
	Serial.println(WiFi.localIP());
	Serial.println();
	//ESP OWN MAC
	Serial.print("MAC of THIS ESP8266-Module: "); Serial.println(WiFi.macAddress());
}


void WIFI_Connect()
{
	int wifiCounter = 0;
	if (WiFi.status() != WL_CONNECTED) { // FIX FOR USING 2.3.0 CORE (only .begin if not connected) - 										 
		
		delay((uint32_t)1000);
		WiFi.begin(ssid, pass);		// connect to the network
		Serial.print(F("IF / login into AP/HotSpot.Wifi-State: "));	Serial.println(WiFi.status());
	}
	//oled.print("\n");  oled.println(ssid);  CheckOledMessage();
	while (WiFi.status() != WL_CONNECTED) {
		delay((uint32_t)500);
		Serial.print(F("550erLoop/Waiting for connection/ new Wifi-State: "));
		Serial.println(WiFi.status());
		//12.12.17/ nach 200 Versuchen Resetten wir den chip
		if (++wifiCounter >= 200) {
			Serial.println("WIFI_Connect()/ NO WIFI  !! wifiVounter >= 500 - ESP wird neu gestartet!");
			wifiCounter = 0;
			++_ESP_ERROR_COUNTER;  //https://github.com/esp8266/Arduino/issues/1722
			oled.print("NOwifi! ");  oled.print(ssid);  oled.print(" !_");  oled.println(_ESP_ERROR_COUNTER); CheckOledMessage();
			break;
		}
	}
}

void handleRoot() {
	server.send(200, "text/html", "<h1>Connected</h1>");
}




void setup() {

	Serial.begin(115200);
	Serial.println("\nHI..THIS is TX-SLAVE-Node!");
	RAMfree("setup");

	// OLED

	Wire.begin(D3, D4);		//bisher Wire.begin(D1, D2); -- F�R Wemos LoLin d1 mini Pro v2.0.0  ( der mit dem Stecker )
	Wire.setClock(400000L);
	oled.begin(&Adafruit128x64, I2C_ADDRESS);
	oled.setFont(Adafruit5x7);
	oled.clear();
	oled.set1X();
	oledRowCount = 0;
	oled.clear();
	oled.print("n"); oled.print(_NODE_ID); oled.print(" ");  oled.print((float)betriebsStundenCounter(), 2); oled.print(" H"); oled.print(system_get_free_heap_size()); oled.print(" !_");	oled.println(_ESP_ERROR_COUNTER);
	CheckOledMessage();

	//AP4Distance  /  WIFI - Part - WIFI - Part WIFI - Part WIFI - Part WIFI - Part WIFI - Part WIFI - Part 
	//Change the MAC & Name  -- !! ACHTUNG ISSUE  DAS kann wohl NUR für STATION so gesetzt werden !?
	//NICHT bei AP?   wird zwar aber so ausgeführt ..aber der AP meldet immer die alte Geräte-MAC

	if (_NODE_ID == 1 || _NODE_ID == 2) {
		WiFi.mode(WIFI_AP_STA);			// NEW we operate in AP and STA
		WiFi.disconnect();
		makeNonUniqueMac(espMAC);
		changeMac(espMAC);
		Serial.print("NEW MAC address is "); Serial.println(WiFi.macAddress());
		char MacCharAddr[18];	// give me this MAC without :
		sprintf(MacCharAddr, "%02x%02x%02x%02x%02x%02x", espMAC[0], espMAC[1], espMAC[2], espMAC[3], espMAC[4], espMAC[5]);
		String strMAC(MacCharAddr);
		strMAC.toUpperCase();
		Serial.print("ESP-Mac as String = "); 	Serial.println(strMAC);
		WiFi.hostname(APssid);
		oled.print(strMAC); oled.print(":");	oled.println(APssid); CheckOledMessage();
	}
	else
	{
		WiFi.mode(WIFI_STA);			//AP4Distance  /  ESP0 Master  wie immer NO AP !!
	}
		
	
		
	// REGULAR WIFI connect

	WIFI_Connect();
	WiFi.setAutoConnect(false);                                                               // Make sure auto connect is set for next boot;
	WiFi.setAutoReconnect(false);
	Stat_WiFi();
	oled.print("mySSID: ");  oled.println(ssid);  CheckOledMessage();
	oled.print(betriebsStundenCounter()); oled.print(" stup/WI: "); oled.println(WiFi.status());  CheckOledMessage();

	Serial.println("Connected to wifi");
	Serial.println("\nStarting connection to the IIS...");
	// if you get a connection, report back via serial:
	if (client.connect("192.168.2.102", 80)) {
		Serial.println("connected");
		// Make a HTTP request:
		client.println("GET /search?q=arduino HTTP/1.0");
		client.println();
	}

	// UDP - PART  - WIFI steht !! jetzt UDP klar machen

	// soll mit pjon gemacht werden

	// UDP - PART  - WIFI steht !! jetzt UDP klar machen

	char broadCastIP[10] = { 0 };
	uint8_t mac[6];
	WiFi.macAddress(mac);
	Serial.printf("UDP / Now listening at  MAC %02x:%02x:%02x:%02x:%02x:%02x  IP %s, UDP port %d\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], WiFi.localIP().toString().c_str(), localUdpPort);
	udpBroadCastIP = WiFi.localIP();    // local IP als Array
	udpBroadCastIP[3] = 255;            // 192.168.1.255   sollte dann die BroadCast IP sein
	sprintf(broadCastIP, "%d.%d.%d.%d", udpBroadCastIP[0], udpBroadCastIP[1], udpBroadCastIP[2], udpBroadCastIP[3]);
	Serial.printf("UDP / BroadCast IP%s\n", broadCastIP);
	Udp.begin(localUdpPort);
	oled.print(broadCastIP); oled.print(":");	oled.println(localUdpPort); CheckOledMessage();

	//AP4Distance  /  Make ESP1 e.g. ESP2 to an AP same TIME  -- For distance Measure between the 3 TRILAT Nodes  ESP0 is still MASTER!! 

	if (_NODE_ID == 1 || _NODE_ID == 2) {		
		
		WiFi.softAP(APssid, APpw);
		IPAddress myIP = WiFi.softAPIP();
		Serial.print("\nConfiguring: "); Serial.print(_NODE_ID);	Serial.print(" as ACCESS-POINT.. "); Serial.print("AP IP: "); Serial.println(myIP);
		server.on("/", handleRoot);
		server.begin();
		Serial.println("HTTP Server started!\n");
	}else
		WiFi.scanNetworksAsync(printAP_ScanResult);


	//PJON  - PJON  - PJON   - PJON  - PJON  -  https://www.pjon.org/

	pinMode(D7, INPUT); //d7 is RX, receiver, so define it as input    set_pins(uint8_t input_pin , uint8_t output_pin )
	pinMode(D8, OUTPUT); //d8 is TX, transmitter, so define it as output

	bus.strategy.set_pins(D7, D8);	 // RECEIVE/TRANSMIT with TRANSMITTER - DataTransfer of SnifferData / set_pins(uint8_t input_pin , uint8_t output_pin )  
	bus.set_receiver(pjonReceiverFkt);  // https://github.com/gioblu/PJON/wiki/Receive-data
	bus.set_error(error_handler);
	bus.begin();
	Serial.print("PJON - Device id: ");	Serial.println(bus.device_id());
	Serial.print("I AM THE TXslave OF THE DOUBLE-NODE: ");  Serial.println(" <- I receive feedbackData from the Scanner");

	// WatchDog
	IoT_WatchDog(true);
	Serial.printf("ESP8266 OWN MAC getChipId(): ESP_%08X\n", ESP.getChipId());  // https://github.com/esp8266/Arduino/issues/2309

																				// TIMER  - Set Timer Start of Operating-Time   Set timer   BetriebsStunden-Z�hler

	Serial.println("Set the NTP Time Server");
	configTime(timezone * 3600, dst * 0, "pool.ntp.org", "time.nist.gov");
	Serial.println(F("\nWaiting for time"));
	while (!time(nullptr)) {
		Serial.print(".");
		delay((unsigned long)2000);
	}
	delay((unsigned long)2000);


	// Timer for the timeStamp
	Serial.println("Get the local Time..");
	now = time(nullptr);	//LOGLN(ctime(&now));

	time(&now);
	timeinfo = localtime(&now);
	Serial.print(timeinfo->tm_mday); Serial.print("."); Serial.print(timeinfo->tm_mon + 1);  Serial.print("."); Serial.print(1900 + timeinfo->tm_year); Serial.print(" ");
	Serial.print(timeinfo->tm_hour); Serial.print(":"); Serial.print(timeinfo->tm_min);  Serial.print(":"); Serial.println(timeinfo->tm_sec);
	Serial.print("Epoch-Time: "); Serial.print(time(&now));
	delay((unsigned long)2000);


	// ----  HEAP -----------------------------------------------------------------------------------------------------

	RAMfree("setup");
	oled.print(betriebsStundenCounter()); oled.println("SETUP/FINI-OK-");   CheckOledMessage();
}




void loop() {

	unsigned long currentMillis = millis(); // grab current time  -  check if "interval" time has passed (eg. some sec to do something )

	//f�r den betriebsstunden-Z�hler

	if ((unsigned long)(currentMillis - previousMillis) >= interval_1s) {
		operatingTime_seconds += 1;
		previousMillis = millis();		// save the "current" time
	}

	// NUR Master /CORE-LOOP / Channel Hop Timer /channels 1-14 
	if (_NODE_ID == 0) {
		if ((unsigned long)(currentMillis - CHANNEL_HOP_previousMillis) >= CHANNEL_HOP_INTERVAL_MS) {
			curr_channel = curr_channel + 1;
			//Serial.print("channelHopCallBack(): "); Serial.println(curr_channel);

			if (curr_channel >= 14)
			{
				curr_channel = 1;
				//zum eigen node Channel-Resynch vi PJON serial bus:
				Serial.println("channel Trigger  via BroadCast zu allen Slaves UND zum eigenen SNIFFER - Start with Channel 1 ");
				oled.println("CH ---->> SYNCH");   CheckOledMessage();
				bus.send(45, "S", 1);
				bus.update();
				//---und gleich Broadcasten../SYNCH the DoubleNode-sniffer-CHANNEL  + Broadcast zu den anderen / siehe auch :  D:\PROJECT\VS_vMicro_ESP\esp8266_DoubleNode\Archive\RECEIVER_PJON_JSON_lastMileStone
				responseBackString("SYNCH", udpBroadCastIP, localUdpPort);
			}
			delay((unsigned long)10);
			CHANNEL_HOP_previousMillis = millis();// save the "current" time
		}
	}



	/*
	UDP Broadcast-Transmission  -  LIEGT eine UDP Msg an?
	Master sendet NUR
	*/

	incommingUDPpacketSize = Udp.parsePacket();
	if (incommingUDPpacketSize > 0 && _NODE_ID != 0)
	{
		memset(incomingPacket, 0, sizeof(incomingPacket));
		int len = Udp.read(incomingPacket, MAXSbuffer);
		if (len > 0)
		{
			incomingPacket[len] = 0;    // ende des Strings Markieren
			char *pos = strstr(incomingPacket, "SYNCH");		// Master node0 sendet einfach ein BroadCast-SYNCH
			if (pos) {
				Serial.printf("Received %d bytes from %s, port %d\n", incommingUDPpacketSize, Udp.remoteIP().toString().c_str(), Udp.remotePort());
				oled.println("<<<----- SYNCH");   CheckOledMessage();
				bus.send(45, "S", 1);
				bus.update();
			}
		}
	}


	/*
	AP4Distance
	Only ESP 2 and 2  will work also as AP - The Master will scan for Those known AP to determin the Position ( distance / meters ) of those AP´s
	*/

	if (_NODE_ID == 1 || _NODE_ID == 2) {
		server.handleClient();					// SLAVES  simulate AP´s
	}

	/*
	* Wait for PJON data from SCANNER  - callback to TX data to API
	*/

	bus.update();       // vom transmitter kommen alle 20 sec ca die sniffer-Daten
	bus.receive(1000);

	Check_ESP_ErrCounter();					// if errCounter exceed RESET the MCU

											// RESET vom WD Timer bzw - Watchdog Timer zur�cksetzen delay(1);  Alternativ kann man auch 1 ms. warten, kostet aber CPU
	ESP.wdtFeed();							// https://www.brickrknowledge.de/content/uploads/2017/12/AllnetLibDokumentation.pdf
		

}



