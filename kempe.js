var cvs;
var ctx;
var errordisplay;

var starttime = new Date().getTime();

var objs = [];
var ply = {};
var NUM_OBJECTS = 10;
var FPS = 60.0/3;
var PLY_SPEED = 100.0/FPS;
var TILE_WIDTH = 50;
var map = {};
var view = {};
var VIEW_WIDTH = 500;
var VIEW_HEIGHT = 500;
var VIEW_TILE_WIDTH = VIEW_WIDTH/TILE_WIDTH;
var VIEW_TILE_HEIGHT = VIEW_HEIGHT/TILE_WIDTH;
var VIEW_TILE_WIDTH_HALF = (VIEW_TILE_WIDTH/2)>>0;
var VIEW_TILE_HEIGHT_HALF = (VIEW_TILE_HEIGHT/2)>>0;
var data;
var selected;
var hilight;
var dragging;
var line_start, line_end;
var edit_mode;
var lastpos;
var RADIUS = 10;
var cx, cy, sx, sy;
var lines = {};

function kempeStart() {
    cvs = document.getElementById("graphics-canvas");
    errordisplay = document.getElementById("error-display");
    checkboxeditMode = document.getElementById("checkboxeditMode");
    ctx = cvs.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,500,500);
    ctx.fillStyle = "#000000";
    pos = [0,0];
    corners = [ [0,0],
                [500,0],
                [0,500]];

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    cvs.addEventListener('mousedown', handleMouseDown);
    cvs.addEventListener('mouseup', handleMouseUp);
    cvs.addEventListener('mousemove', handleMouseMove);
    cvs.addEventListener('mousewheel', handleMouseWheel);
    cvs.addEventListener('mousemove', handleMouseHover);
    cvs.addEventListener('mouseout', handleMouseOut);
    cvs.addEventListener('click', handleMouseClick);

    cvs.width = document.width;
    cvs.height = document.height;
    recalcViewDimentions();



    cvs.onselectstart = function () { return false; } // ie
    cvs.onmousedown = function () { return false; } // mozilla

    ctx.fillStyle = 'red';

    init();
    tick();
}

function recalcViewDimentions()
{
    VIEW_WIDTH = cvs.width;
    VIEW_HEIGHT = cvs.height;
}

function initProcessLinesAndPoints() {
    for (var i=0; i<data[1].length; i++)
    {
        if (data[1][i][0] == data[1][i][1])
            continue;

        if (data[1][i][0] < data[1][i][1])
            lines[data[1][i][0]+" "+data[1][i][1]] = true;
        else
            lines[data[1][i][1]+" "+data[1][i][0]] = true;

    }

    data[1] = [];
    for (var k in lines)
    {
        var s = k.split(" ");
        var p1 = parseInt(s[0]);
        var p2 = parseInt(s[1]);
        var x = data[0][p1][0]-data[0][p2][0];
        var y = data[0][p1][1]-data[0][p2][1];
        data[1].push([p1, p2, Math.sqrt(x*x+y*y)]);
    }

    for (var i=0; i<data[1].length; i++)
    {
        lines[data[1][i][0]+" "+data[1][i][1]] = i;
    }

    for (var i=0; i<data[0].length; i++)
    {
        for (var j=data[0][i].length; j<5; j++)
            data[0][i].push(0);
        if (data[0][i][2] === 0)
            data[0][i][2] = false;
    }
}

function hasLine(l) {
    if (l[0] < l[1])
        return lines[l[0]+" "+l[1]] !== undefined;
    else
        return lines[l[1]+" "+l[0]] !== undefined;
}

function addLine(l) {
    if (hasLine(l))
        return;
    if (l[0] < l[1])
        lines[l[0]+" "+l[1]] = data[1].length;
    else
        lines[l[1]+" "+l[0]] = data[1].length;
    data[1].push([l[0],l[1]]);
}

function removeLine(l) {
    if (!hasLine(l))
        return;
    var index = 0;
    if (l[0] < l[1])
    {
        index = lines[l[0]+" "+l[1]];
        lines[l[0]+" "+l[1]] = false;
        delete lines[l[0]+" "+l[1]];
    } else
    {
        index = lines[l[1]+" "+l[0]];
        lines[l[0]+" "+l[1]] = false;
        delete lines[l[1]+" "+l[0]];
    }

    if (index == data[1].length-1)
        data[1].splice(data[1].length-1,1);
    else
    {
        var old = data[1][data[1].length-1];
        data[1][index] = old;
        lines[old[0]+" "+old[1]] = index;
        data[1].splice(data[1].length-1,1);
    }
}

function init() {
    data = 
    [
        [
            [0  ,   0   ,   true],
            [0  ,   100 ,   false],
            [100,   0   ,   false],
            [100,   100 ,   false]
        ],
        [
            [0, 1,  1],
            [0, 2,  1],
            [0, 3,  Math.sqrt(2)],
            [1, 2,  Math.sqrt(2)],
            [1, 3,  1],
            [2, 3,  1]
        ]
    ];
    var data1 = 
    [
        [
            [0  ,   0   ,   true],
            [0  ,   100 ,   false]
        ],
        [
            [0, 1,  100],
        ]
    ];

    var data2 = 
    [
        [
            [0  ,   0   ,   true],
            [0  ,   100 ,   false],
            [100,   0   ,   false],
            [100,   100 ,   false]
        ],
        [
            [0, 1,  100],
            [0, 2,  100],
            [2, 3,  100],
            [1, 3,  100],
        ]
    ];

    data = data1;


    selected = false;
    dragging = false;
    hilight = false;
    edit_mode = false;
    sx = 30;
    sy = -30;
    cx = VIEW_WIDTH/2;
    cy = VIEW_HEIGHT/2;
    lastpos = [0,0];
    line_start = false;
    line_end = [0,0];

    // data = createAdditor(1, 2, 2, 1);
    parent = createParent(1,1,1);
    //document.write(JSON.stringify(parent));
    params = [5.4,1,0,Math.PI/4];
    mul = createLinkage(parent, params);
    data = mul;
    // data[0].push([0,0]);
    data[0].push([8,4]);
    data[0].push([4,8]);
    data[0].push([12,12]);
    data[1].push([0, data[0].length-3]);


    initProcessLinesAndPoints();
}


var LINE_BORDER_WIDTH = 4;
var LINE_WIDTH = 3;
function draw() {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'blue';

    
    for (var i=0; i<data[1].length; i++)
    {
        ctx.lineWidth = LINE_BORDER_WIDTH;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(cx+sx*data[0][data[1][i][0]][0],cy+sy*data[0][data[1][i][0]][1]);
        ctx.lineTo(cx+sx*data[0][data[1][i][1]][0],cy+sy*data[0][data[1][i][1]][1]);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = LINE_WIDTH;
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(cx+sx*data[0][data[1][i][0]][0],cy+sy*data[0][data[1][i][0]][1]);
        ctx.lineTo(cx+sx*data[0][data[1][i][1]][0],cy+sy*data[0][data[1][i][1]][1]);
        ctx.closePath();
        ctx.stroke();
    }

    if (line_start)
    {
        ctx.lineWidth = LINE_BORDER_WIDTH;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(cx+sx*data[0][line_start-1][0],cy+sy*data[0][line_start-1][1]);
        if (hilight && hilight!==line_start)
            ctx.lineTo(cx+sx*data[0][hilight-1][0],cy+sy*data[0][hilight-1][1]);
        else
            ctx.lineTo(cx+sx*line_end[0],cy+sy*line_end[1]);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = LINE_WIDTH;
        if (hilight && hilight!==line_start)
        {
            if (hasLine([hilight-1, line_start-1]))
                ctx.strokeStyle = '#ff4444';
            else
                ctx.strokeStyle = '#8888ff';
        } else
            ctx.strokeStyle = '#000066';
        ctx.beginPath();
        ctx.moveTo(cx+sx*data[0][line_start-1][0],cy+sy*data[0][line_start-1][1]);
        if (hilight && hilight!==line_start)
            ctx.lineTo(cx+sx*data[0][hilight-1][0],cy+sy*data[0][hilight-1][1]);
        else
            ctx.lineTo(cx+sx*line_end[0],cy+sy*line_end[1]);
        ctx.closePath();
        ctx.stroke();
    }

    for (var i=data[0].length-1; i>=0; i--)
    {

        if (selected == i+1 || hilight == i+1 || line_start == i+1)
            if (data[0][i][2])
                ctx.fillStyle = '#FF8888'
            else
                ctx.fillStyle = '#88FF88';
        else
            if (data[0][i][2])
                ctx.fillStyle = 'red'
            else
                ctx.fillStyle = 'green';
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc((cx+sx*data[0][i][0]), 
                (cy+sy*data[0][i][1]), 
                RADIUS/2, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

function update() {
    handleKeys();
    if (!edit_mode)
    {
        var forces = evalForces(data);
        timeStep(data, forces, 0.1);
    }
}

function handleMouseClick(e) {
    if (edit_mode)
    {
        // ctrl
        if (currentKeysDown[17]) {
            var mx = (e.offsetX-cx)/sx;
            var my = (e.offsetY-cy)/sy;

            data[0].push([mx, my, currentKeysDown[16]]);

            return;
        }
    } else 
    {

    }
}

function handleMouseHover(e) {
    if (edit_mode)
    {
        // ctrl
        if (currentKeysDown[17]) {
            return;
        }

        if (hilight == false)
        {
            var mx = (e.offsetX-cx)/sx;
            var my = (e.offsetY-cy)/sy;
            for (var i=0; i<data[0].length; i++)
            {
                if ((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy)))
                {
                    hilight = i+1;
                    lastpos[0] = mx;
                    lastpos[1] = my;
                    break;
                }
            }
        } else if (hilight != false)
        {
            i = hilight-1;
            if (!((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy))))
            {
                hilight = false;
            }
        }

    } else
    {
        if (selected == false && hilight == false)
        {
            var mx = (e.offsetX-cx)/sx;
            var my = (e.offsetY-cy)/sy;
            for (var i=0; i<data[0].length; i++)
            {
                if (data[0][i][2])
                    continue;
                if ((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy)))
                {
                    hilight = i+1;
                    lastpos[0] = mx;
                    lastpos[1] = my;
                    break;
                }
            }
        } else if (selected != false)
            hilight = selected;
        else if (hilight != false)
        {
            i = hilight-1;
            if (!((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy))))
            {
                hilight = false;
            }
        }
    }
}

function handleMouseWheel(e) {
    if (edit_mode)
    {
        if (e.wheelDelta)
        {
            var w = e.wheelDelta/120;
            // console.log(w);
            if (w>0)
            {
                for (var i=0; i<w; i++)
                {
                    sx /= 0.9;
                    sy /= 0.9;
                    cx = VIEW_WIDTH/2 + (cx-VIEW_WIDTH/2)/0.9
                    cy = VIEW_HEIGHT/2 + (cy-VIEW_HEIGHT/2)/0.9
                }
            } else
            {
                for (var i=0; i<-w; i++)
                {
                    sx *= 0.9;
                    sy *= 0.9;
                    cx = VIEW_WIDTH/2 + (cx-VIEW_WIDTH/2)*0.9
                    cy = VIEW_HEIGHT/2 + (cy-VIEW_HEIGHT/2)*0.9
                }
            }
        }
    } else
    {
        if (e.wheelDelta)
        {
            var w = e.wheelDelta/120;
            // console.log(w);
            if (w>0)
            {
                for (var i=0; i<w; i++)
                {
                    sx /= 0.9;
                    sy /= 0.9;
                    cx = VIEW_WIDTH/2 + (cx-VIEW_WIDTH/2)/0.9
                    cy = VIEW_HEIGHT/2 + (cy-VIEW_HEIGHT/2)/0.9
                }
            } else
            {
                for (var i=0; i<-w; i++)
                {
                    sx *= 0.9;
                    sy *= 0.9;
                    cx = VIEW_WIDTH/2 + (cx-VIEW_WIDTH/2)*0.9
                    cy = VIEW_HEIGHT/2 + (cy-VIEW_HEIGHT/2)*0.9
                }
            }
        }
    }
}

function handleMouseDown(e) {
    if (edit_mode)
    {
        // ctrl
        if (currentKeysDown[17]) {
            return;
        }

        // shift - create line
        if (currentKeysDown[16]) {
            var mx = (e.offsetX-cx)/sx;
            var my = (e.offsetY-cy)/sy;
            console.log(sx+" "+sy+" new line");
            for (var i=0; i<data[0].length; i++)
            {
                if ((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy)))
                {
                    line_start = i+1;
                    break;
                }
            }
            if (line_start)
            {
                line_end[0] = mx;
                line_end[1] = my;
            }
            return;
        }

        // no keys
        {
            var mx = (e.offsetX-cx)/sx;
            var my = (e.offsetY-cy)/sy;
            console.log(sx+" "+sy);
            for (var i=0; i<data[0].length; i++)
            {
                if ((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy)))
                {
                    selected = i+1;
                    lastpos[0] = mx;
                    lastpos[1] = my;
                    break;
                }
            }
            if (selected == false)
            {
                dragging = true;
                lastpos[0] = e.offsetX;
                lastpos[1] = e.offsetY;
            }
        }

    } else
    {
        var mx = (e.offsetX-cx)/sx;
        var my = (e.offsetY-cy)/sy;
        console.log(sx+" "+sy);
        for (var i=0; i<data[0].length; i++)
        {
            if (data[0][i][2])
                continue;
            if ((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy)))
            {
                selected = i+1;
                lastpos[0] = mx;
                lastpos[1] = my;
                break;
            }
        }
        if (selected == false)
        {
            dragging = true;
            lastpos[0] = e.offsetX;
            lastpos[1] = e.offsetY;
        }
    }
}

function handleMouseMove(e) {
    if (edit_mode)
    {
        // ctrl
        if (currentKeysDown[17]) {
            return;
        }

        // shift - create line
        if (currentKeysDown[16]) {
            if (line_start)
            {
                line_end[0] = (e.offsetX-cx)/sx;
                line_end[1] = (e.offsetY-cy)/sy;
            }
            return;
        }

        // no keys
        {
            if (selected != false)
            {
                var mx = (e.offsetX-cx)/sx;
                var my = (e.offsetY-cy)/sy;
                data[0][selected-1][0] += mx-lastpos[0];
                data[0][selected-1][1] += my-lastpos[1];
                lastpos[0] = mx;
                lastpos[1] = my;
                // call physics code here
            } else if (dragging)
            {
                var mx = e.offsetX;
                var my = e.offsetY;
                cx += mx-lastpos[0];
                cy += my-lastpos[1];
                lastpos[0] = mx;
                lastpos[1] = my;

            }
        }

    } else
    {
        if (selected != false)
        {
            var mx = (e.offsetX-cx)/sx;
            var my = (e.offsetY-cy)/sy;
            data[0][selected-1][0] += mx-lastpos[0];
            data[0][selected-1][1] += my-lastpos[1];
            lastpos[0] = mx;
            lastpos[1] = my;
            // call physics code here
        } else if (dragging)
        {
            var mx = e.offsetX;
            var my = e.offsetY;
            cx += mx-lastpos[0];
            cy += my-lastpos[1];
            lastpos[0] = mx;
            lastpos[1] = my;

        }
    }
}

function handleMouseUp(e) {
    if (edit_mode)
    {
        // ctrl
        if (currentKeysDown[17]) {
            return;
        }

        // shift - create line
        if (currentKeysDown[16]) {
            if (line_start)
            {
                var mx = (e.offsetX-cx)/sx;
                var my = (e.offsetY-cy)/sy;
                var endi = false;
                console.log(sx+" "+sy+" making new line");
                for (var i=0; i<data[0].length; i++)
                {
                    if (i == line_start-1)
                        continue;
                    if ((Math.abs(data[0][i][0]-mx) <= RADIUS/2.0/sx) && (Math.abs(data[0][i][1]-my) <= RADIUS/2.0/Math.abs(sy)))
                    {
                        endi = i+1;
                        break;
                    }
                }
                if (endi != false)
                {
                    var l;
                    if (line_start < endi)
                        l = [line_start-1, endi-1];
                    else
                        l = [endi-1, line_start-1];

                    if (hasLine(l))
                        removeLine(l);
                    else
                        addLine(l);
                }
            }
            line_start = false;
            return;
        }

        // no keys
        {
            selected = false;
            dragging = false;
        }
    } else
    {
        selected = false;
        dragging = false;
    }
}

function handleMouseOut(e) {
    if (edit_mode)
    {
        // ctrl
        if (currentKeysDown[17]) {
            return;
        }

        // shift - create line
        if (currentKeysDown[16]) {
            line_start = false;
            hilight = false;
        }

        // no keys
        {
            selected = false;
            dragging = false;
            hilight = false;
        }
    } else
    {
        selected = false;
        dragging = false;
        hilight = false;
    }
}

var currentKeysDown = {};
function handleKeyDown(event) {
    currentKeysDown[event.keyCode] = true;
    handleKeyPress(event);
    switch(event.keyCode){
        case 37:
        case 38:
        case 39:
        case 40:
            event.preventDefault();
            break;
    }
}

function handleKeyUp(event) {
    currentKeysDown[event.keyCode] = false;
    switch(event.keyCode){
        case 16:
        {
            line_start = false;
        } break;
        case 37:
        case 38:
        case 39:
        case 40:
            event.preventDefault();
            break;
    }
}

function handleKeyPress(event) {
    // shift
    if (event.keyCode == 16) {
        
    }

    // ctrl
    else if (event.keyCode == 17) {
        
    }

    // capslock
    else if (event.keyCode == 20) {
        edit_mode = !edit_mode;
        checkboxeditMode.checked = edit_mode;
        dragging = false;
        selected = false;
        line_start = false;
    }

    // left
    else if (event.keyCode == 37) {
    }

    // right
    else if (event.keyCode == 39) {
    }

    // up
    else if (event.keyCode == 38) {
        sx /= 0.9;
        sy /= 0.9;
    }

    // down
    else if (event.keyCode == 40) {
        sx *= 0.9;
        sy *= 0.9;
    }

    else if (event.keyCode == 'A'.charCodeAt()) {
        sx /= 0.9;
        sy /= 0.9;
        cx = VIEW_WIDTH/2 + (cx-VIEW_WIDTH/2)/0.9
        cy = VIEW_HEIGHT/2 + (cy-VIEW_HEIGHT/2)/0.9
    }

    else if (event.keyCode == 'Z'.charCodeAt()) {
        sx *= 0.9;
        sy *= 0.9;
        cx = VIEW_WIDTH/2 + (cx-VIEW_WIDTH/2)*0.9
        cy = VIEW_HEIGHT/2 + (cy-VIEW_HEIGHT/2)*0.9
    }
}

var angspeed = 0.01;
var speed = 0.1;
function handleKeys() {
    var m = deltaTime/(1000.0/60);
    // if (currentKeysDown['W'.charCodeAt()])
    // {
    // }

    // shift
    if (currentKeysDown[16]) {

    }

    // ctrl
    if (currentKeysDown[17]) {

    }

    // left
    if (currentKeysDown[37]) {
        // ply.x -= PLY_SPEED*m;
    }

    // right
    if (currentKeysDown[39]) {
        // ply.x += PLY_SPEED*m;
    }

    // up
    if (currentKeysDown[38]) {
        // ply.y -= PLY_SPEED*m;
    }

    // down
    if (currentKeysDown[40]) {
        // ply.y += PLY_SPEED*m;
    }
}

var lastTime = 0;
var deltaTime = 0;
function updateAll() {
    var timeNow = new Date().getTime();
    // console.log(timeNow+" "+lastTime+" "+deltaTime)
    if (lastTime != 0) {
        deltaTime = timeNow - lastTime;
    }
    lastTime = timeNow;

    update()
}


function tick() {
    requestAnimFrame(tick);
    updateAll();
    draw();
}


var checkboxeditMode;
function updateEditMode() {
    if (!checkboxeditMode) checkboxeditMode = document.getElementById("checkboxeditMode");
    edit_mode = checkboxeditMode.checked;
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
