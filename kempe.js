var canvas;
var cx;
var errordisplay;

function draw() {
    cx.fillStyle = Colors.rand();
    cx.fillRect(pos[0],pos[1],1,1);
    
}

var pos;
var corners;
function update() {
    var tmp = corners[Math.floor(Math.random()*3)];
    pos[0] = (pos[0]+tmp[0])/2;
    pos[1] = (pos[1]+tmp[1])/2;
}


function kempeStart() {
    canvas = document.getElementById("graphics-canvas");
    errordisplay = document.getElementById("error-display");
    cx = canvas.getContext("2d");
    cx.fillStyle = "#FFFFFF";
    cx.fillRect(0,0,500,500);
    cx.fillStyle = "#000000";
    pos = [0,0];
    corners = [ [0,0],
                [500,0],
                [0,500]];

    tick();
}

var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

    }
    lastTime = timeNow;
    update();
}


function tick() {
    requestAnimFrame(tick);
    for (var x=0; x<100; x++)
    {
        draw();
        animate();
    }
}

// in case there's no console
fakeconsole = {};
fakeconsole.emptyConsole = {
    assert : function(){},  
    log : function(){},  
    warn : function(){},  
    error : function(){},  
    debug : function(){},  
    dir : function(){},  
    info : function(){}  
};

if (console && console.log);
else console = fakeconsole.emptyConsole;
