/** WifiScan + OLED +  Pjon data Transfer 2 TXslave ODER 2 TxMaster  / F�r WEMOS oder MCU

S E L E C T :
WeMos D1 mini Pro V1 : COM PORT: Silicon Labs CP210x
LONIN D1 mini pro v2: CH340



LONIN D1 mini pro v2
https://wiki.wemos.cc/_media/products:d1:sch_d1_mini_pro_v2.0.0.pdf
https://projetsdiy.fr/nouvelle-wemos-lolin-d1-mini-pro-esp8266ex-16mb-connecteurs-ipex-i2c-batterie-lipo/

ACHTUNG wegen OLED Display
Wire.begin(D1, D2);				// F�R Wemos LoLin d1 mini Pro v2.0.0  ( der mit dem Stecker )  D1 = SDA  D2 = SCL

Scan-Result:

NodeID, Channel, peerMac,       RSSI
1,      5,       D4E6B7D51BD5, -55

Node ID�s:
0 = TxMaster
1 = TxSlave Nr1
2 = TxSlave Nr2

RSSI Statistics: http://www.gujarattourism.com/file-manager/ebrochure/thumbs/testing_e_brochure_3.pdf
+ Poison distribution

15.10.18 scanner2 OK: mini-Freeze!! l�uft mit: #define SWBB_MODE 1
15.10.18 scanner2:
+ sniffer data wird wird zum txSlave gesendet vi PJON-In dieser Version wird RSSI noch als String  weiter gegeben...das werden wir in V4 auf INT �ndern
24.10.18:Umstellen RSSI mit vorzeichen -"R":[-32,-33,-30,-88,-50]
1.11.18: Dieser knoten hat noch keinen broadcast - channel-synch-Das kommt nun in Version 5

15.06.19: REACTIVATION of TRILAT before the  MAGENTA-SHIFT Hackathon ( NEW WIN10! )
Issues and fixes during NEW-Complete-BUILD: D:\ALL_DEVEL\DOC\nodeMCU_V3\HOW2_VS_Community_BasicSettings_V03.docx

*/



/* Set SoftwareBitBang mode to _SWBB_FAST before PJON.h inclusion
(Transfer speed: 25.157kBd or 3.15kB/s) */
#define SWBB_MODE 1

/* Acknowledge latency maximum duration (1000 microseconds default).
Could be necessary to higher SWBB_LATENCY if sending long packets because
of the CRC computation time needed by receiver before transmitting its acknowledge  */
#define SWBB_LATENCY 2000

/* Set the back-off exponential degree */
//#define SWBB_BACK_OFF_DEGREE 4

/* Set the maximum sending attempts */
//#define SWBB_MAX_ATTEMPTS 20

/* The values set above are the default producing a 3.2 seconds
back-off timeout with 20 attempts. Higher SWBB_MAX_ATTEMPTS to higher
the back-off timeout, higher SWBB_BACK_OFF_DEGREE to higher the interval
between every attempt. */


#define PJON_PACKET_MAX_LENGTH 4096
#define PJON_MAX_PACKETS 1

#include <Arduino.h>
//PJON
#include <PJON.h>

//OLED DISPLAY I2C 
#include <Wire.h>		// 
#include <SSD1306Ascii.h>
#include <SSD1306AsciiWire.h>	// Original .h  zZ ein 64 Bit Display  - https://github.com/adafruit/Adafruit_SSD1306/issues/57

//4 the scanner:
#include <user_interface.h>


#define DISABLE 0
#define ENABLE 1

// <Strategy name> bus(selected device id)
PJON<SoftwareBitBang> bus(45);

const char _NODE_ID[] = "1";					//  Scounter 

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


//Timer
unsigned long displayTimer = 0;
float operatingTime_seconds = 0;
unsigned long interval_1s = 1000; // the time we need to wait
unsigned long previousMillis = 0; // millis() returns an unsigned long.

								  // TimeFrames Tick Tack
unsigned long CHANNEL_HOP_INTERVAL_MS = 1000;
unsigned long CHANNEL_HOP_previousMillis = 0;


// A Struct Array to keep the sniffed MAC devices - Payload

#define _RssiMAXelements  150
typedef struct {
	char peerMac[14];						// peerMac...unique
	char rssi[_RssiMAXelements] = { 0 };	// RSSI	..concat pro channel pro mac	-55,-57,-58,-58
} deviceRecordType;

#define MACdeviceDataMAXelements  20
deviceRecordType  _MACdeviceData[MACdeviceDataMAXelements];		// instead of EDB we try hier a STRUCT ARRAY
int _MACdeviceDataIndex = 0;	    // Index of this Struct Array

									//Momentan der gescannte channel
uint8  curr_channel = 1;

bool dataPackReady = false;
int _payloadMaxCounter = 0;

// 4 the scanner --the data-structure

// The setup function is called once at startup of the sketch
#define DATA_LENGTH 112
#define TYPE_MANAGEMENT 0x00
#define TYPE_CONTROL 0x01
#define TYPE_DATA 0x02
#define SUBTYPE_PROBE_REQUEST 0x04

struct RxControl
{
	signed rssi : 8; // signal intensity of packet
	unsigned rate : 4;
	unsigned is_group : 1;
	unsigned : 1;
	unsigned sig_mode : 2;       // 0:is 11n packet; 1:is not 11n packet;
	unsigned legacy_length : 12; // if not 11n packet, shows length of packet.
	unsigned damatch0 : 1;
	unsigned damatch1 : 1;
	unsigned bssidmatch0 : 1;
	unsigned bssidmatch1 : 1;
	unsigned MCS : 7; // if is 11n packet, shows the modulation and code used (range from 0 to 76)
	unsigned CWB : 1; // if is 11n packet, shows if is HT40 packet or not
	unsigned HT_length : 16; // if is 11n packet, shows length of packet.
	unsigned Smoothing : 1;
	unsigned Not_Sounding : 1;
	unsigned : 1;
	unsigned Aggregation : 1;
	unsigned STBC : 2;
	unsigned FEC_CODING : 1; // if is 11n packet, shows if is LDPC packet or not.
	unsigned SGI : 1;
	unsigned rxend_state : 8;
	unsigned ampdu_cnt : 8;
	unsigned channel : 4; // which channel this packet in.
	unsigned : 12;
};

struct scannerPacket
{
	struct RxControl rx_ctrl;
	uint8_t data[DATA_LENGTH];
	uint16_t cnt;
	uint16_t len;
};

// **********  CODE Section *********************************************************************

void error_handler(uint8_t code, uint16_t data, void *custom_pointer) {
	if (code == PJON_CONNECTION_LOST) {
		Serial.print("Connection lost with device ");
		Serial.println((uint8_t)bus.packets[data].content[0], DEC);
	}
	if (code == PJON_ID_ACQUISITION_FAIL) {
		Serial.print("Connection lost with device ");
		Serial.println(data, DEC);
	}
	if (code == PJON_DEVICES_BUFFER_FULL) {
		Serial.print("Master devices buffer is full with a length of ");
		Serial.println(data);
	}
};

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

// device MAC without :
static void getMAC(char* addr, uint8_t* data, uint16_t offset)
{
	sprintf(addr, "%02x%02x%02x%02x%02x%02x", data[offset + 0], data[offset + 1], data[offset + 2], data[offset + 3], data[offset + 4], data[offset + 5]);
}



// das struct bei(struct scannerPacket* hatte gefehlt !!deshalb compile fehler !!
static void showMetadata(struct scannerPacket* scannerPacket)
{
	unsigned int frameControl = ((unsigned int)scannerPacket->data[1] << 8) + scannerPacket->data[0];
	// uint8_t version      = (frameControl & 0b0000000000000011) >> 0;
	uint8_t frameType = (frameControl & 0b0000000000001100) >> 2;
	uint8_t frameSubType = (frameControl & 0b0000000011110000) >> 4;
	// uint8_t toDS         = (frameControl & 0b0000000100000000) >> 8;
	// uint8_t fromDS       = (frameControl & 0b0000001000000000) >> 9;

	// Only look for probe request packets
	if (frameType != TYPE_MANAGEMENT || frameSubType != SUBTYPE_PROBE_REQUEST)
	{
		//Serial.println("showMetadata() - bedingung nicht erf�llt: frameType != TYPE_MANAGEMENT || frameSubType != SUBTYPE_PROBE_REQUEST --- RETURN ");
		return;
	}

	//RAMfree("showMetadata()");

	char newRSSI[4] = "";										// rssi 
	sprintf(newRSSI, "%d", scannerPacket->rx_ctrl.rssi);

	char deviceMacAddr[] = "000000000000";
	getMAC(deviceMacAddr, scannerPacket->data, 10);
	strupr(deviceMacAddr);												//show what we have 

	Serial.print("RSSI: "); Serial.print(newRSSI);
	Serial.print("   Ch: "); 	Serial.print(curr_channel);
	Serial.print("   Peer MAC: "); Serial.print(deviceMacAddr);

	//Prefilter auf sonstige bzw. bekannte Ger�te-MAC�s ...e.g  router, esp�s, 

	char *pos = strstr(deviceMacAddr, "000");		// myEspMAC: 2C:3A:E8:42:16:68 RSSI: -77 Ch: 2 Peer MAC: 000740000100 SSID: @EAKP?^@GCKP?^@
	if (pos) {
		Serial.print("\nfound ["); Serial.print(deviceMacAddr); Serial.print("] at Pointer-pos / ignore! might be a router oder NAS ");
		return;
	}
	//kick ESP MAC adresses
	pos = strstr(deviceMacAddr, "2C3AE8");		// espressif - 2C:3A:E8:FF:FF:FF 
	if (pos) return;


	//RANDOM MAC - we will filter it out later in DB ...depending on the UseCase
	if (deviceMacAddr[1] == '2' || deviceMacAddr[1] == '6' || deviceMacAddr[1] == 'A' || deviceMacAddr[1] == 'E') {
		Serial.print("\nRandomization! (2,6,A,E)-------------> MAC: "); Serial.print(deviceMacAddr); Serial.print(" Rnd: "); Serial.println(deviceMacAddr[1]);
	}


	int idx = findMACdeviceInDeviceArray(deviceMacAddr);	// FIRST we check if this MAC was Stored before within this SCAN-CYCLE ( e.g 20 SEC for 14 Cgannel ) -- Gives the Index or -1
	if (idx == -1) {		// Hurray - a NEW Wifi Device
		if (_MACdeviceDataIndex < MACdeviceDataMAXelements) {				// In MACdeviceDataMAXelements MUSS Immer der aktuelle Index stehen			
			strcat(_MACdeviceData[_MACdeviceDataIndex].peerMac, strupr(deviceMacAddr));
			strcat(_MACdeviceData[_MACdeviceDataIndex].rssi, newRSSI);
			strcat(_MACdeviceData[_MACdeviceDataIndex].rssi, ",");
			Serial.print("  RSSI: "); Serial.println(_MACdeviceData[_MACdeviceDataIndex].rssi);
			_MACdeviceDataIndex += 1;
			//Serial.print(" INSERTed - NEW Device  in Struct-array"); Serial.println(_MACdeviceData[_MACdeviceDataIndex].deviceMacAddr);			
		}
		else
		{
			Serial.print(" ALERT!! - MACdeviceData / Limit Reached!!:  "); Serial.print(MACdeviceDataMAXelements);
			return;
		}
	}
	else {	//  ***  UPDATE EXISTING WiFi DEVICE
			//Serial.print("Element Found at Position: "); Serial.println( idx + 1);
			//Serial.print("  UPDATE - MAC (or better the SSID )  in Struct-Array: "); Serial.println(deviceMacAddr);	

		if (strlen(_MACdeviceData[_MACdeviceDataIndex].rssi) <= sizeof(_MACdeviceData[_MACdeviceDataIndex].rssi) - 10) {
			strcat(_MACdeviceData[idx].rssi, newRSSI);
			strcat(_MACdeviceData[idx].rssi, ",");
			Serial.print("  RSSI: "); Serial.println(_MACdeviceData[idx].rssi);
		}
	}

}

int findMACdeviceInDeviceArray(char *newPeerMAC) {
	//Serial.print("findMACdeviceInDeviceArray() nElements : ");	Serial.print(_MACdeviceDataIndex); Serial.print(" MAC to search for : ");	Serial.println(newPeerMAC);
	for (int i = 0; i <= _MACdeviceDataIndex; i++)
	{
		if (strcmp(_MACdeviceData[i].peerMac, newPeerMAC) == 0) {					// the function returns 0 when the strings are equal			
																					//Serial.print("findMACdeviceInDeviceArray() FOUND it : ");	Serial.println(MACdeviceData[i].deviceMacAddr);
			return i;
		}
	}
	return -1;
}



/**
* Callback for promiscuous mode
*Meaning of ICACHE_FLASH_ATTR : http://bbs.espressif.com/viewtopic.php?t=1183
*Die bedeutung ist wohl nicht ganz klar!?
*/
static void ICACHE_FLASH_ATTR scanner_callback(uint8_t* buffer, uint16_t length)
{
	//Serial.print("scanner_callback()/length: "); Serial.println(length);
	struct scannerPacket* scannerPacket = (struct scannerPacket*)buffer;
	showMetadata(scannerPacket);
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

void CheckOledProgress() {
	//Display  ** Display  ** Dosplay ************************
	if (oledProgressPoints >= 20) {	//bei 128 x 32  sind das 4   or bei 128 x 64  sind das 8
		oledProgressPoints = 0;
		oled.println();
		++oledRowCount;
		CheckOledMessage();
	}
	++oledProgressPoints;	// jedes CRLF ist eine Zeile und z�hlt als rowCount	
}


/*
PJON serial transfer to TX node

DECLARE @json NVARCHAR(MAX)
SET @json =
N'[
{ "I":"1", "T":"12345" , "C":"12", "M":"12345", "R":"20,70,75" },
{ "I":"1", "T":"12345" , "C":"12", "M":"12345", "R":"20,70,75"  }
]'

SELECT * FROM OPENJSON ( @json )
WITH (
I varchar(10) '$.I' ,
T varchar(20) '$.T',
C varchar(20) '$.C',
M varchar(20) '$.M',
R varchar(300) '$.R'
)
*/



bool sendPayload2TXnode() {

	//Show Data from Struct-Array
	char jsonPayload[2000] = { 0 };
	int currMacDeviceStructLength = sizeof(deviceRecordType) * _MACdeviceDataIndex;

	for (int i = 0; i < _MACdeviceDataIndex; i++) {
		Serial.print(" MAC: "); Serial.print(_MACdeviceData[i].peerMac); Serial.print(" RSSI: "); Serial.println(_MACdeviceData[i].rssi);

	}
	Serial.print("\npayload-Length: "); Serial.println(currMacDeviceStructLength);

	unsigned long  msMeasureStart = millis();		// Start der ZeitMessung													

	Serial.flush();
	//int packet = bus.send(44, _MACdeviceData, sizeof(_MACdeviceData));		//  TEST
	// ok::  int packet = bus.send(44, "Hallo", 5);

	// Write basically the content of the first Element of the stack  -- TEST ONLY

	strcat(jsonPayload, "{\"D\":[");
	for (int i = 0; i < _MACdeviceDataIndex; i++) {
		if (strlen(jsonPayload) < sizeof(jsonPayload) - 50) {	// relativ kleiner Buffer
			strcat(jsonPayload, "{\"I\":@I");
			//strcat(jsonPayload, _NODE_ID);		// ID dieses Knotens  id wird im TX / Master gesetzt
			strcat(jsonPayload, ",\"T\":@T");	// Platzhalter f�r den TimeStamp
			strcat(jsonPayload, ",\"M\":\"");
			strcat(jsonPayload, _MACdeviceData[i].peerMac);
			strcat(jsonPayload, "\",\"R\":[");				//  "R":[-32,-33,-30,-88,-50]
			_MACdeviceData[i].rssi[strlen(_MACdeviceData[i].rssi) - 1] = 0;	// elemeniert das letzte  KOMMA
			strcat(jsonPayload, _MACdeviceData[i].rssi);
			strcat(jsonPayload, "]},");
		}
		else {
			Serial.print("\nTo many Data. Only a part will be transferred: "); Serial.println(strlen(jsonPayload));
		}
	}
	if (strlen(jsonPayload) > 10) {
		jsonPayload[strlen(jsonPayload) - 1] = ']';
		strcat(jsonPayload, "}");
		bus.send(44, jsonPayload, strlen(jsonPayload));
		bus.update();
	}




	memset(jsonPayload, 0, sizeof(jsonPayload));

	oled.print(betriebsStundenCounter()); oled.println(" TX done!"); CheckOledMessage();		// check after each oled.println

	Serial.print(F("Done / TOTAL TransferTime ESP -> VS/IIs (ms): ")); Serial.println(millis() - msMeasureStart);
	return true;
}

//RECEIVE PJON data from TX

void receiver_function(uint8_t *payload, uint16_t length, const PJON_Packet_Info &packet_info) {

	// Packet content  -  nochmal checken  die Verzahnung ESP0  zu ESP X
	//Serial.print("\nGot something: ");
	/*
	for (int i = 0; i < length; i++) {
		Serial.print((char)payload[i]);		
	}
	*/
	if ((char)payload[0] == 'S') {
		curr_channel = 13;
		Serial.println("<<----------------------------------- SYNCH");
		//Serial.print("curr_channel: ");  Serial.print(curr_channel,DEC);   Serial.println(" <-  vom Receiver");
	}
	else
	{
		Serial.println("CHANNEL-SYNCH ISSUE - GOT no S for synch!! ");
	}
}



void setup() {

	Serial.begin(115200);
	Serial.println("\nHI..THIS is SCANNER-Node!");
	RAMfree("setup");

	// OLED  
	Wire.begin(D3, D4);		//fr�gere setups: Wire.begin(D1, D2);	 F�R Wemos LoLin d1 mini Pro v2.0.0  ( der mit dem Stecker )
	Wire.setClock(400000L);
	oled.begin(&Adafruit128x64, I2C_ADDRESS);
	oled.setFont(Adafruit5x7);
	oled.clear();
	oled.set1X();
	oledRowCount = 0;
	oled.clear();
	oled.print("n"); oled.print(_NODE_ID); oled.print(" ");  oled.print((float)betriebsStundenCounter(), 2); oled.print(" H"); oled.print(system_get_free_heap_size()); oled.print(" !_");	oled.println(_ESP_ERROR_COUNTER);
	CheckOledMessage();

	// PJON -   https://github.com/esp8266/Arduino/issues/2735
	Serial.println("setup(): PJON INIT..");

	pinMode(D7, INPUT); //d7 is RX, receiver, so define it as input    set_pins(uint8_t input_pin , uint8_t output_pin )
	pinMode(D8, OUTPUT); //d8 is TX, transmitter, so define it as output

						 //bus.strategy.set_pin(15);   // war so alleine ok  muss also NICHT 12 sein
	bus.strategy.set_pins(D7, D8);	//  set_pins(uint8_t input_pin , uint8_t output_pin )
	bus.set_receiver(receiver_function);  // https://github.com/gioblu/PJON/wiki/Receive-data
	bus.set_error(error_handler);
	bus.begin();
	Serial.print("PJON - Device id: ");	Serial.println(bus.device_id());
	Serial.print("I AM THE SCANNER OF THE DOUBLE-NODE: ");  Serial.println(" <- I receive the Channel from the Master or SLAVE TX");


	// WatchDog
	IoT_WatchDog(true);
	Serial.printf("ESP8266 OWN MAC getChipId(): ESP_%08X\n", ESP.getChipId());  // https://github.com/esp8266/Arduino/issues/2309


																				//----------------  The scanner SETUP SECTOR -------------------------------------------------------------------------

	Serial.println("setup(): start & set Station_Mode & wifi_promiscuous...");

	wifi_set_opmode(STATION_MODE);
	wifi_set_channel(1);
	wifi_promiscuous_enable(DISABLE);
	delay((unsigned long)10);
	wifi_set_promiscuous_rx_cb(scanner_callback);
	delay((unsigned long)10);
	wifi_promiscuous_enable(ENABLE);
	Serial.println("setup(): start & set Station_Mode wifi_promiscuous_enable(ENABLE)... - DONE!");
	delay((unsigned long)10);


	// ----  HEAP -----------------------------------------------------------------------------------------------------

	RAMfree("setup");
	oled.print(betriebsStundenCounter()); oled.println("STUP/FINI-OK-");   CheckOledMessage();
}



void loop() {

	unsigned long currentMillis = millis(); // grab current time  -  check if "interval" time has passed (eg. some sec to do something )

											//f�r den betriebsstunden-Z�hler

	if ((unsigned long)(currentMillis - previousMillis) >= interval_1s) {
		operatingTime_seconds += 1;
		previousMillis = millis();		// save the "current" time
	}

	// CORE-LOOP The new Channel Hop Timer  --  hoping channels 1-14  --- ersetzen durch den FREMD-Trigger f�r den Channel-HOP

	if ((unsigned long)(currentMillis - CHANNEL_HOP_previousMillis) >= CHANNEL_HOP_INTERVAL_MS) {
		curr_channel = curr_channel + 1;
		//Serial.print("channelHopCallBack(): "); Serial.println(curr_channel);

		if (_MACdeviceDataIndex >= _payloadMaxCounter) _payloadMaxCounter = _MACdeviceDataIndex;
		//oled.print("C");  oled.print(curr_channel);	oled.print(" ["); oled.print((String)_MACdeviceDataIndex); oled.print("] Max "); oled.println(_payloadMaxCounter); CheckOledMessage();

		if (curr_channel >= 14)
		{
			wifi_promiscuous_enable(DISABLE);		// SNIFF PAUSE
			curr_channel = 1;
			dataPackReady = true;	//26.12.17 / sendData HIER st�rtzte ab!  aber unten im loop ok	- Serial.print("set back to 1..channelHopCallBack(): "); Serial.print(curr_channel);	
		}

		if (curr_channel > 0 && curr_channel <= 14)   wifi_set_channel(curr_channel);
		delay((unsigned long)10);
		Serial.print("["); Serial.print(wifi_get_channel()); Serial.print("]");

		CHANNEL_HOP_previousMillis = millis();// save the "current" time
	}


	if (dataPackReady == true) {
		wifi_promiscuous_enable(DISABLE);		// SNIFF PAUSE
		dataPackReady = false;
		Serial.print(F("\nIts time to send DATA / _MACdeviceDataIndex:...")); 	Serial.println(_MACdeviceDataIndex);

		// ---  Transfer to webservice ---------------------------------------------------

		sendPayload2TXnode();

		// ---  E N D    Transfer to webservice ---------------------------------------------

		//refresh the jsonBuffer
		memset(_MACdeviceData, 0, sizeof(_MACdeviceData));  //clearMACdeviceDataStuct();
		_MACdeviceDataIndex = 0;

		wifi_set_channel(curr_channel);		// wichtig sonst durchl�uft der nicht mehr alle channel, da die connection sich irgeinen nimmt
	}

	wifi_promiscuous_enable(ENABLE);		// S N I F I N G   ACTIVE  A G A I N 
	Check_ESP_ErrCounter();					// if errCounter exceed RESET the MCU
											// RESET vom WD Timer bzw - Watchdog Timer zur�cksetzen delay(1);  Alternativ kann man auch 1 ms. warten, kostet aber CPU
	ESP.wdtFeed();							// https://www.brickrknowledge.de/content/uploads/2017/12/AllnetLibDokumentation.pdf

											//Der Kanal wird jetzt im Receiver Teil empfangen  und umgeschaltet: 	receiver_function (...)
											//TRANSMITTER des DoppelNode ist immer pasiv und empf�ngt NUR vom RECEIVER ( LAN-Node ) den Kanal

	bus.update();
	bus.receive(1000);

}



