var memory = require('memoryjs'),
    keyboard = require("asynckeystate"),
    sleep = require('sleep'),
    jsonfile = require('jsonfile'),
    open = require('opener'),
    request = require('request'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

var offset = {
  dwlocalPlayer: 0x00A9C0DC,
  flashMaxAlpha: 0xA2F4,
  lifeState: 0x0000025B,
  entityList: 0x04A78EE4,
  bSpotted: 0x00000939,
  entLoopDist: 0x10,
  iCrosshair: 0x0000B2A4,
  iTeamNum: 0x000000F0,
  Ihealth: 0xFC,
  forceAttack: 0x02EBB25C
};

var clientDLL_base, engineDLL_base, clientModule, engineModule;


//Toggle buttons
var toggle = {
  injected: false,
  flash: false,
  radar: false,
  trigger: false
};

var flashInterval;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INJECTION
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function inject() {

  var processName = "csgo.exe";
  var processObject = memory.openProcess(processName);

    clientModule = memory.findModule("client.dll", processObject.th32ProcessID);
    if (toggle.injected == false) {
      console.log(processObject.szExeFile + " found, starting Injection");
      clientDLL_base = clientModule.modBaseAddr;
      toggle.injected = true;
      console.log(clientDLL_base);
      console.log("Injected PHOENIXWARE LEGIT CHEAT, ENJOY ;)");
      io.emit('injected', toggle);

//    engineModule = memory.findModule("engine.dll", processObject.th32ProcessID);
//    engineDLL_base = engineModule.modBaseAddr;

  };
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CHEAT FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function noFlash() {

  var dwlocalPlayer = memory.readMemory(clientDLL_base + offset.dwlocalPlayer, "int");
  var flashMaxAlpha = memory.readMemory(dwlocalPlayer + offset.flashMaxAlpha, "float");
  console.log(dwlocalPlayer);

  if (flashMaxAlpha > 0.0) {
    memory.writeMemory(dwlocalPlayer + offset.flashMaxAlpha, 0.0, "float");
  }

};

function radar() {
  for (var i = 1; i < 65; i++){
      var entity =  memory.readMemory(clientDLL_base +  offset.entityList + ( i - 1) * offset.entLoopDist,"int");
      memory.writeMemory(entity + offset.bSpotted, 1, "int");
  }
}


function trigger() {

  var DwLocalPlayer = memory.readMemory(clientDLL_base + offset.dwlocalPlayer,"int"); //122763800
  var LocalPlayerTeam = memory.readMemory(DwLocalPlayer + offset.iTeamNum,"int"); //2
  var iCrosshair = memory.readMemory(DwLocalPlayer + offset.iCrosshair,"int"); //0
  var dwEntity =  memory.readMemory(clientDLL_base +  offset.entityList + ( iCrosshair - 1) * offset.entLoopDist,"int"); //0
  var iEntityHealth = memory.readMemory(dwEntity + offset.Ihealth,"int");//66772588
  var iEntityTeam = memory.readMemory(dwEntity + offset.iTeamNum,"int"); //66772588

  if (LocalPlayerTeam != iEntityTeam && iEntityHealth > 0 && iCrosshair >= 1 && iCrosshair < 65){

      if (keyboard.getAsyncKeyState(0x04)){
          sleep.usleep(20);
          memory.writeMemory(clientDLL_base + offset.forceAttack, 5, "int");
          sleep.usleep(5);
          if(!keyboard.getAsyncKeyState(0x01))
              memory.writeMemory(clientDLL_base + offset.forceAttack, 4, "int");
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CHEAT TOGGLE FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function enableNoFlash() {

    flashInterval = setInterval(function(){
      if (toggle.flash = true) {
        noFlash();
      }
    },2);
}

function disableNoFlash() {
  clearInterval(flashInterval);
}

function enableRadar() {
    radarInterval = setInterval(function(){
      if (toggle.radar = true) {
        radar();
      }
    },20);
}

function disableRadar() {
  clearInterval(radarInterval);
}

function enableGlow() {
    radarInterval = setInterval(function(){
      if (toggle.glow = true) {
        glow();
      }
    },20);
}

function disableGLow() {
  clearInterval(glowInterval);
}

function enableTrigger() {
    triggerInterval = setInterval(function(){
      if (toggle.trigger = true) {
        trigger();
      }
    },1);
}

function disableTrigger() {
  clearInterval(triggerInterval);
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SOCKET AND WEBVIEW
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
res.sendFile(__dirname + '/views/hack.html');
});

io.on('connection', function(socket){
  console.log('Web interface opened');
  socket.on('disconnect', function(){
    console.log('Web inteface closed');
  });

  //TOGGLES
  socket.on('flash', function() {
    if (toggle.flash == false) {
      toggle.flash = true;
      enableNoFlash();
    }
    else {
      toggle.flash = false;
      disableNoFlash();
    }
  });

  socket.on('radar', function() {
    if (toggle.radar == false) {
      toggle.radar = true;
      enableRadar();
    }
    else {
      toggle.radar = false;
      disableRadar();
    }
  });

  socket.on('trigger', function() {
    if (toggle.trigger == false) {
      toggle.trigger = true;
      enableTrigger();
    }
    else {
      toggle.trigger = false;
      disableTrigger();
    }
  });
  socket.on('inject', function () {
    if (toggle.injected == false) {
      inject();

      statusInterval = setInterval(function(){
        io.emit('status', toggle);
      },100);
    }

  });

});
http.listen(3000, function(){
  console.log("Cheat booted up");
});
