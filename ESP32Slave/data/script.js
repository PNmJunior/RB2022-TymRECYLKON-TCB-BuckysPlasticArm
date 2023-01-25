// Complete project details: https://randomnerdtutorials.com/esp32-web-server-websocket-sliders/


//komunikační knihovna
const SouborZnak = ";";
const nahradaSouborZnak =" ///1||| ";
const SubSouborZnak =":";
const nahradaSubSouborZnak= " ///2||| " ;

const M_LED = 0;
const M_1 = 1;
const M_2 = 2;
const M_3 = 3;
const M_4 = 4;
const M_Kleste = 5;
const M_Levy = 6;
const M_Pravy = 7;


function balicekInt(a)
{
    if(a == -0)
    {
        a = 0;
    }
    else if(a == NaN)
    {

    }
    return String(a);
}


function balicekText(a)
{
    let str = String(a)
    str = str.replaceAll(SouborZnak, nahradaSouborZnak);
    str = str.replaceAll(SubSouborZnak, nahradaSubSouborZnak);
    return str;
}


function addSoubor(a)
{
    return SouborZnak + a;
}


function addSubSoubor(a)
{
    return SubSouborZnak + a;
}


function motorSend(mot,hod)
{
    return sendAuto(dataMotor(mot,hod));
}

function motorQestionSend(a)
{
    return sendAuto(dataMotorQestion(a));
}

function motorAllSend()
{
    return sendAuto(dataMotorAll());
}

function dataMotorAll()
{
    return ['A'];
}

function dataMotorQestion(mot)
{
    return ['M',balicekInt( mot)];
}

function  dataMotor(mot, hod)
{
    return ['m',balicekInt( mot),balicekInt( hod)];
}


function sendAuto(a)
{
    let str = addSoubor(a[0]);
    a.shift();
    for(const b of a) 
    {
        str = str + addSubSoubor(b);
    }
    return str;

}


function read(a)
{
    const str =  String(a);
    const soubor = str.split(SouborZnak);
    let pole = [];
    soubor.shift();
    for(const subsoubor of soubor) 
    {
        pole.push(subsoubor.split(SubSouborZnak));
    }
    console.log(pole);
    return pole;
}


function readInt(a)
{
    return Number(a);
}


function readText(a)
{
    let str = String(a)
    str=str.replaceAll( nahradaSouborZnak, SouborZnak);
    str=str.replaceAll( nahradaSubSouborZnak, SubSouborZnak);
    return str;
}


//work
var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onload);

var startTimeSend = performance.now();
var startTimeIn = performance.now();
var startTimeAll = performance.now();
var timeOldSend = performance.now();
var hodNow = [0,0,0,0,0,0,0,0]
var hodOld = [0,0,0,0,0,0,0,0]

function onload(event) {
    initWebSocket();
}

function getValues(){
    websocket.send(motorAllSend());
}

function initWebSocket() {
    console.log('Trying to open a WebSocket connection…');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    console.log('Connection opened');
    getValues();
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function updateSliderPWM(element) {
    startTimeSend = performance.now();
    startTimeAll = performance.now();
    var sliderNumber = element.id.charAt(element.id.length-1);
    var sliderValue = document.getElementById(element.id).value;
    //document.getElementById("sV"+sliderNumber).innerHTML = sliderValue;
    console.log(sliderValue);
    websocket.send(motorSend(sliderNumber, sliderValue));
    console.log(`Send time ${performance.now() - startTimeSend} milliseconds`);
}


function delay(delayInms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  }
  
async function sample() {
    console.log('a');
    console.log('waiting...')
    let delayres = await delay(3000);
    console.log('b');
  }


function updateSliderPWMnull(a) {
    websocket.send(motorSend(a, 0));
}

function reset123()
{
    location.href = "/reset";
    setTimeout(function(){ console.log("After 0.5 seconds!"); }, 500);
    location.href = "/";
    stisknuto();
}


function stisknuto()
{ 
    motorAllSend();
}


function onMessage(event) {
    startTimeIn = performance.now();
    console.log(event.data);

    var dataIn = read(event.data);
    for(const SoubIn of dataIn) 
    {
        console.log("SoubIn");
        console.log(SoubIn);
        switch (readText( SoubIn[0]))
        {
            case "m":
                let key = readInt( SoubIn[1]);
                let myObj = readInt( SoubIn[2]);
                console.log("key"); 
                console.log(key);
                
                console.log("myObj");
                console.log(myObj);
                console.log("slider"+ key.toString()+"="+myObj.toString());
                document.getElementById("slider"+ key.toString()).value = myObj;
                //document.getElementById(key.toString()).innerHTML = myObj;
                document.getElementById("sV"+key.toString()).innerHTML = myObj;
                break;
            default:
                break;
        }
    }
    console.log(`In time ${performance.now() - startTimeIn} milliseconds`);
    console.log(`All time ${performance.now() - startTimeAll} milliseconds`);
}


class JoystickController
{
	// stickID: ID of HTML element (representing joystick) that will be dragged
	// maxDistance: maximum amount joystick can move in any direction
	// deadzone: joystick must move at least this amount from origin to register value change
	constructor( stickID, maxDistance, deadzone )
	{
		this.id = stickID;
		let stick = document.getElementById(stickID);

		// location from which drag begins, used to calculate offsets
		this.dragStart = null;

		// track touch identifier in case multiple joysticks present
		this.touchId = null;
		
		this.active = false;
		this.value = { x: 0, y: 0 ,uhel:0, d:0}; 

		let self = this;

		function handleDown(event)
		{
		    self.active = true;

			// all drag movements are instantaneous
			stick.style.transition = '0s';

			// touch event fired before mouse event; prevent redundant mouse event from firing
			event.preventDefault();

		    if (event.changedTouches)
		    	self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
		    else
		    	self.dragStart = { x: event.clientX, y: event.clientY };

			// if this is a touch event, keep track of which one
		    if (event.changedTouches)
		    	self.touchId = event.changedTouches[0].identifier;
		}
		
		function handleMove(event) 
		{
		    if ( !self.active ) return;

		    // if this is a touch event, make sure it is the right one
		    // also handle multiple simultaneous touchmove events
		    let touchmoveId = null;
		    if (event.changedTouches)
		    {
		    	for (let i = 0; i < event.changedTouches.length; i++)
		    	{
		    		if (self.touchId == event.changedTouches[i].identifier)
		    		{
		    			touchmoveId = i;
		    			event.clientX = event.changedTouches[i].clientX;
		    			event.clientY = event.changedTouches[i].clientY;
		    		}
		    	}

		    	if (touchmoveId == null) return;
		    }

		    const xDiff = event.clientX - self.dragStart.x;
		    const yDiff = event.clientY - self.dragStart.y;
		    const angle = Math.atan2(yDiff, xDiff);
			const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
			const xPosition = distance * Math.cos(angle);
			const yPosition = distance * Math.sin(angle);

/*
            const xDiff = event.clientX - self.dragStart.x;
		    const yDiff = event.clientY - self.dragStart.y;
		    const angle = Math.atan2(yDiff, xDiff);
			let xPosition = 0;
			let yPosition = 0;
            if(xDiff > 0)
            {
                xPosition = Math.min(xDiff, maxDistance);
            }
            else if(xDiff < 0)
            {
                xPosition = Math.max(xDiff, -maxDistance);
            }

            if(yDiff > 0)
            {
                yPosition = Math.min(yDiff, maxDistance);
            }
            else if(yDiff < 0)
            {
                yPosition = Math.max(yDiff, -maxDistance);
            }

            const distance = Math.max(Math.abs(xPosition), Math.abs(yPosition));
            */
            
            //console.log(xPosition);
            //console.log(yPosition);


			// move stick image to new position
		    stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

			// deadzone adjustment
		    const xPercent = xPosition.toFixed(0);
		    const yPercent = yPosition.toFixed(0);
            
            

		    
		    self.value = { x: xPercent, y: yPercent , uhel: angle, d:distance};
		  }

		function handleUp(event) 
		{
		    if ( !self.active ) return;

		    // if this is a touch event, make sure it is the right one
		    if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

		    // transition the joystick position back to center
		    stick.style.transition = '.2s';
		    stick.style.transform = `translate3d(0px, 0px, 0px)`;

		    // reset everything
		    self.value = { x: 0, y: 0 , uhel: 0, d:0};
		    self.touchId = null;
		    self.active = false;
		}

		stick.addEventListener('mousedown', handleDown);
		stick.addEventListener('touchstart', handleDown);
		document.addEventListener('mousemove', handleMove, {passive: false});
		document.addEventListener('touchmove', handleMove, {passive: false});
		document.addEventListener('mouseup', handleUp);
		document.addEventListener('touchend', handleUp);
	}
}

let joystick1 = new JoystickController("stick1", 100, 10);
let joystick2 = new JoystickController("stick2", 100, 10);
let joystick3 = new JoystickController("stick3", 100, 10);
let joystick4 = new JoystickController("stick4", 100, 10);

function update()
{
	document.getElementById("status1").innerText = "Joystick 1: " + JSON.stringify(joystick1.value);
	document.getElementById("status2").innerText = "Joystick 2: " + JSON.stringify(joystick2.value);
    document.getElementById("status3").innerText = "Joystick 3: " + JSON.stringify(joystick3.value);
    document.getElementById("status4").innerText = "Joystick 4: " + JSON.stringify(joystick4.value);
    hodNow[M_LED] = joystick3.value.x;
    hodNow[M_1] = joystick2.value.x;
    hodNow[M_2] = (-1)*joystick2.value.y;
    hodNow[M_3] = (-1)*joystick3.value.y;
    hodNow[M_4] = (-1)*joystick4.value.y;
    hodNow[M_Kleste] = joystick4.value.x;
    var M_Levy_lokal  = joystick1.value.d * rozdilLevy((-1)*radians_to_degrees(joystick1.value.uhel));
    var M_Pravy_lokal = joystick1.value.d * rozdilPravy( (-1)*radians_to_degrees(joystick1.value.uhel));
    /*if(joystick1.value.x > 0)
    {
        console.log("kladne x");
        console.log(radians_to_degrees(joystick1.value.uhel));
        console.log(rozdil(radians_to_degrees(joystick1.value.uhel)));
        M_Pravy_lokal = M_Pravy_lokal * rozdil(radians_to_degrees(joystick1.value.uhel));
    }
    else
    {
        console.log("zaporne x");
        console.log(radians_to_degrees(joystick1.value.uhel));
        console.log(rozdil(radians_to_degrees(joystick1.value.uhel)));
        M_Levy_lokal = M_Levy_lokal * rozdil(radians_to_degrees(joystick1.value.uhel));
    }*/
    hodNow[M_Levy] =   M_Levy_lokal.toFixed(0);
    hodNow[M_Pravy] = M_Pravy_lokal.toFixed(0);
    console.log("M_Levy");
    console.log(hodNow[M_Levy]);
    console.log("M_Pravy");
    console.log(hodNow[M_Pravy]);    
    let stri = "";
    for(let i = 0; i < 8; i++)
    {
        if(hodNow[i] != hodOld[i])
        {
            hodOld[i] = hodNow[i];
            //websocket.send( motorSend(i,hodOld[i]));
            stri  = stri + motorSend(i,hodOld[i]);
        }
    } 
    if(stri != "")
    {
        websocket.send(stri);
        console.log(stri);
    }   
    setTimeout(arguments.callee, 100);
}

function rozdilPravy(uhel)
{
    console.log("uhel");
    console.log(uhel);
    var uhelRozdil = Number(uhel.toFixed(0));

    if(uhelRozdil < 0)
    {
        uhelRozdil = uhelRozdil + 360;
    }
    console.log("uhelRozdil");
    console.log(uhelRozdil);
    if(uhelRozdil == 0 )
    {
        console.log("vystup0");
        console.log(-1);
        return -1;
    }
    else if(uhelRozdil > 0 && uhelRozdil < 90)
    {
        console.log("vystup1");
        console.log((uhelRozdil-45)/45);
        return (uhelRozdil-45)/45;
    }
    else if(uhelRozdil >= 90 && uhelRozdil <= 180)
    {
        console.log("vystup2");
        console.log(1);
        return 1;
    }
    else if(uhelRozdil > 180 && uhelRozdil < 225)
    {
        console.log("vystup3");
        console.log((202.5 - uhelRozdil)/22.5);
        return (202.5 - uhelRozdil)/22.5;
    }
    else if(uhelRozdil >= 255 && uhelRozdil <= 270)
    {
        console.log("vystup4");
        console.log(-1);
        return -1;
    }
    else if(uhelRozdil > 270 && uhelRozdil <= 315)
    {
        console.log("vystup5");
        console.log((uhelRozdil-315)/45);
        return (uhelRozdil-315)/45;
    }
    else if(uhelRozdil > 315 && uhelRozdil <= 360)
    {
        console.log("vystup6");
        console.log((315 - uhelRozdil)/45);
        return (315 - uhelRozdil)/45;
    }
    return 0;
}


function rozdilLevy(uhel)
{
    console.log("uhel");
    console.log(uhel);
    var uhelRozdil = Number(uhel.toFixed(0));

    if(uhelRozdil < 0)
    {
        uhelRozdil = uhelRozdil + 360;
    }
    console.log("uhelRozdil");
    console.log(uhelRozdil);
    if((uhelRozdil >= 0 && uhelRozdil <= 90)|| uhelRozdil == 360)
    {
        console.log("vystup1");
        console.log(1);
        return 1;
    }
    else if(uhelRozdil > 90 && uhelRozdil < 180)
    {
        console.log("vystup2");
        console.log((135 - uhelRozdil)/45);
        return (135 - uhelRozdil)/45;
    }
    else if(uhelRozdil > 180 && uhelRozdil <= 225)
    {
        console.log("vystup3");
        console.log((uhelRozdil-225)/45);
        return (uhelRozdil-225)/45;
    }
    else if(uhelRozdil > 225 && uhelRozdil < 270)
    {
        console.log("vystup4");
        console.log((225 - uhelRozdil)/45);
        return (225 - uhelRozdil)/45;
    }
    else if(uhelRozdil >= 270 && uhelRozdil <= 315)
    {
        console.log("vystup5");
        console.log(-1);
        return -1;
    }
    else if(uhelRozdil > 315 && uhelRozdil <= 360)
    {
        console.log("vystup6");
        console.log((uhelRozdil-337.5)/22.5);
        return (uhelRozdil-337.5)/22.5;
    }
    return 0;
}


function radians_to_degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}


function loop()
{
	requestAnimationFrame(loop);
	//update();
    
}
//setTimeout(update(), 1000);
loop();
update();

function hideRow(element2) {
    let element = document.getElementById('t' + element2.id.toString());
    let hidden = element.getAttribute("hidden");

    if (hidden) {
        element.removeAttribute("hidden");
        //button.innerText = "Hide tr";
    } else {
        element.setAttribute("hidden", "hidden");
        //button.innerText = "Show tr";
    }
}


