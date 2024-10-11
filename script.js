
const status_el = document.getElementById("status");
const connexion_button = document.getElementById("connexion_button");

const title = document.getElementById("title");
const content = document.getElementById("content");
const main = document.getElementById("main");

const breakin = document.getElementById("breakin")
const ad1 = document.getElementById("ad1");
const ad2 = document.getElementById("ad2");
const ad3 = document.getElementById("ad3");

const wall = document.getElementById("wall");
const safe_out = document.getElementById("safe_out");
const sun = document.getElementById("sun");
const seeya = document.getElementById("seeya")
const safe_open = document.getElementById("safe_open")

// connexion button
connexion_button.addEventListener("click", function() {
    console.log("Co button clicked!");
    initWebSocket();
});


// Logic part for the pickaxe
const pickaxe = document.getElementById('pickaxe');
let pickaxeCount = 0;

function pickaxeClick(){
    var etat_mur = window.getComputedStyle(wall);
    if (etat_mur.height !== "100%"){
        pickaxe.style.transform = `rotate(15deg) translateX(-50%)`;

        setTimeout(() => {
            pickaxe.style.transform = `rotate(0deg) translateX(-50%)`;
        }, 100);
        pickaxeCount++
        
        switch(pickaxeCount){
            case 3:
                ad1.style.cssText = "font-weight: 700; text-decoration: underline;";
                break;
            case 6:
                ad2.style.cssText = "font-weight: 700; text-decoration: underline;";
                break;
            case 9:
                ad3.style.cssText = "font-weight: 700; text-decoration: underline;";
                wall.src = "./img/wall_broken.png"
    
                setTimeout(() => {
                    toP3();
                    reset_breakin
                }, 1500);
                break;
        }
    }
}


// Logic part for the safe
const safe_in = document.getElementById('safe_in');
let steprota = 0; 
let valuerota = 0;
let sensRota = 1
let step = 1
let pin1 = -9 // ranging from -9 to 11
let pin2 = 6
let pin3 = -3

function safeRotation(cur_av){
    const av = parseInt(cur_av, 10);
    steprota = Math.floor((av / 4095) * 20) - 9; // Scale av to the range -10 to 10 +1 en plus pour plus proche réel
    valuerota = 15 * steprota
    safe_in.style.transform = `rotate(${valuerota}deg)`;
}

function verifBreaking(){
    var etat_safe = window.getComputedStyle(safe_out);
    if (etat_safe.height !== "100%"){
        if (steprota == pin1 && step == 1){
            ad1.style.cssText = "font-weight: 700; text-decoration: underline;";
            step += 1
        }
        
        if (steprota == pin2 && step == 2){
            ad2.style.cssText = "font-weight: 700; text-decoration: underline;";
            step += 1
        }
        
        if (steprota == pin3 && step == 3){
            ad3.style.cssText = "font-weight: 700; text-decoration: underline;";
            step = 1
            safe_in.style.cssText = "display: none;"
            safe_open.style.cssText = "height: 60%; display: block"
            
            setTimeout(() => {
                toP4();
                reset_breakin()
                safe_open.style.cssText = "height: 60%; display: none"
                }, 2000);
        }
    }
}

function reset_breakin(){
    ad1.style.cssText = "";
    ad2.style.cssText = "";
    ad3.style.cssText = "";
}


// logic part for the websocket
let socket;
function initWebSocket() {
    socket = new WebSocket('ws://10.1.224.104/');

    socket.onopen = function() {
        console.log('WebSocket connected');
        status_el.textContent = "esp32 : connected"
        connexion_button.style.cssText = "font-size: 30px; padding: 35px 0 0 380px;opacity: 0;"
    };

    socket.onmessage = function(event) {
        // console.log('Message from ESP32:', event.data);
        // System d'id de message de la carte avec le 1er char (1->potentiometre / 2->bouton)
        let id = event.data.charAt(0);
        resp = event.data.slice(1);

        switch (id) {
            case '1':
                safeRotation(resp);
                verifBreaking();
                break;
            case '2':
                pickaxeClick();
                break;
        } 

    };


    // non fonctionnel à améliorer
    socket.onclose = function() {
        console.log('WebSocket closed');
        status_txt.textContent = "esp32 : disconnected"
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
        status_txt.textContent = "esp32 : error"
    };
}


// function to "switch page" solution for not charging the js and breaking the web socket connexion
function toP1(){
    title.style.cssText = "all: unset; display: flex; justify-content: center; align-items: center; height: 80%; margin: 0; font-size: 96px;"
    main.style.cssText = "display: none;"
    breakin.style.cssText = "display: none;"
    seeya.style.cssText = "display: none;"
    socket.send("LED_OFF");
}

function toP2(){
    title.style.cssText = "display: none; "
    main.style.cssText = "display: flex; justify-content: center; align-items: center; margin: 50px; position: relative; height: 60vh;"
    breakin.style.cssText = "display: flex; justify-content: center; align-items: center; font-size: 70px; padding: 50px 0 25px 0;"
    seeya.style.cssText = "display: none;"
    wall.style.cssText = "height: 100%;"
    pickaxe.style.cssText = "height:65%; transform: translateX(-50%); transition: transform 50ms ease; transform-origin: bottom left;"
    safe_out.style.cssText = "display: none;"
    safe_in.style.cssText = "display: none;"
    sun.style.cssText = "display: none;"
    socket.send("LED_OFF");
}

function toP3(){
    title.style.cssText = "display: none; "
    main.style.cssText = "display: flex; justify-content: center; align-items: center; margin: 50px; position: relative; height: 60vh;"
    breakin.style.cssText = "display: flex; justify-content: center; align-items: center; font-size: 70px; padding: 50px 0 25px 0;"
    seeya.style.cssText = "display: none;"
    wall.style.cssText = "display: none;"
    pickaxe.style.cssText = "display: none;"
    safe_out.style.cssText = "height: 100%;"
    safe_in.style.cssText = "height: 60%; transition: transform 50ms ease;"
    sun.style.cssText = "display: none;"
    socket.send("LED_OFF");
}

function toP4(){
    title.style.cssText = "display: none; "
    main.style.cssText = "display: flex; justify-content: center; align-items: center; margin: 50px; position: relative; height: 60vh;"
    breakin.style.cssText = "display: none;"
    seeya.style.cssText = "display: flex; justify-content: center; align-items: center; font-size: 70px; padding: 50px 0 25px 0;"
    wall.style.cssText = "display: none;"
    pickaxe.style.cssText = "display: none;"
    safe_out.style.cssText = "display: none;"
    safe_in.style.cssText = "display: none;"
    sun.style.cssText = "height: 120%;"
    socket.send("LED_ON");
    console.log("send on")
}


// footer buttons
const p1 = document.getElementById("p1");
p1.addEventListener("click", function() {
    toP1();
});

const p2 = document.getElementById("p2");
p2.addEventListener("click", function() {
    toP2();
});

const p3 = document.getElementById("p3");
p3.addEventListener("click", function() {
    toP3()
});

const p4 = document.getElementById("p4");
p4.addEventListener("click", function() {
    toP4()
});

title.addEventListener("click", function() {
    toP2();
});