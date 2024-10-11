#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsServer.h>

// Constants
const char* ssid = ""
const char* password = "" //don't share password on github ^^

// Globals
WebSocketsServer webSocket = WebSocketsServer(80);

// Called when receiving any WebSocket message
void onWebSocketEvent(uint8_t num,
                      WStype_t type,
                      uint8_t * payload,
                      size_t length) {

  // Figure out the type of WebSocket event
  switch(type) {

    // Client has disconnected
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;

    // New client has connected
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connection from ", num);
        Serial.println(ip.toString());
      }
      break;

    case WStype_TEXT:
    {
      String message = String((char*)payload);
      Serial.println(message);
      if (message == "LED_ON") {
        digitalWrite(6, HIGH);
        Serial.println("led on");
        webSocket.sendTXT(num, "LED allumée");
      } else if (message == "LED_OFF") {
        digitalWrite(6, LOW);
        Serial.println("led off");
        webSocket.sendTXT(num, "LED éteinte");
      }
    }

    // For everything else: do nothing
    case WStype_BIN:
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
    default:
      break;
  }
}

void setup() {

  // Start Serial port
  Serial.begin(115200);

  delay(5000);

  // Connect to access point
  Serial.println("Connecting");
  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED ) {
    delay(500);
    Serial.print(".");
  }

  // Print our IP address
  Serial.println("Connected!");
  Serial.print("My IP address: ");
  Serial.println(WiFi.localIP());

  // Start WebSocket server and assign callback
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);

  pinMode(2, INPUT);
  pinMode(3, INPUT);
  pinMode(6, OUTPUT);
}

int but = 0;
int pot = 0;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 100;

void loop() {

  webSocket.loop();
  but = digitalRead(2);
  pot = analogRead(3);

  if (millis() - lastSendTime > sendInterval){
    String msg = "1" + String(pot);
    webSocket.broadcastTXT(msg);
    lastSendTime = millis();
    delay(50);
  }

  if (but == 0){
    String msg = "2";
    webSocket.broadcastTXT(msg);
    delay(150);
  }

}
