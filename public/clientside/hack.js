var timer = new Timer();
var socket = io();

function flash() {
    socket.emit('flash');
}
function radar() {
    socket.emit('radar');
}
function glow() {
    socket.emit('glow');
}
function inject() {
    socket.emit('inject');
}
function trigger() {
    socket.emit('trigger');
}
function faceit_esea() {
    socket.emit('faceit_esea');
}
socket.on('injected', function (toggle) {
  if (toggle.injected == true) {
    $("#output").text("PHOENIXWARE Has been injected into CS:GO");
  } else {
    $("#output").text("PHOENIXWARE Has not yet been injected");
  }
});

socket.on('error', function () {
  $("#output").text("Start CS:GO before injecting");
});

socket.on('status', function (toggle) {
  if (toggle.flash == true) {
    $("#flashBtn").addClass( "enabled" );
  } else {
    $("#flashBtn").removeClass( "enabled" );
  }
  if (toggle.radar == true) {
    $("#radarBtn").addClass( "enabled" );
  } else {
    $("#radarBtn").removeClass( "enabled" );
  }
  if (toggle.glow == true) {
    $("#glowBtn").addClass( "enabled" );
  } else {
    $("#glowBtn").removeClass( "enabled" );
  }
  if (toggle.trigger == true) {
    $("#triggerBtn").addClass( "enabled" );
  } else {
    $("#triggerBtn").removeClass( "enabled" );
  }
  if (toggle.faceit_esea == true) {
    $("#faceit_eseaBtn").addClass( "enabled" );
  } else {
    $("#faceit_eseaBtn").removeClass( "enabled" );
  }
});

socket.on('status', function (toggle) {
  if (toggle.injected == true) {
    $("#injectBtn").addClass( "enabled" );
    $("#injectBtn").text( "PHOENIXWARE is injected" );
  } else {
    $("#injectBtn").removeClass( "enabled" );
  }
});
