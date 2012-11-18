/*
function ParticleSystem() {
        particles = new Array();
        particles[0] = new Particle(100,100);
        particles[1] = new Force(0,0);


        this.evalF = function(state) {
                var f = new Array();
                for (var i = 0; i < state.length; i++) {
                        if (i % 2 === 0) {
                                // x' = v
                                f[i] = new Velocity(state[i+1].x, state[i+1].y);
                        } else {
                                // x'' = v'
                                f[i] = new Force(-state[i-1].y, state[i-1].x);
                        }
                }
                return f;

        };

        
        this.getState = function() {
                return particles;
        };

        this.setState = function(newState) {
                particles = newState;
        };
        

}
*/


function evalForces(data) {
    var state = data[0];
    var edges = data[1];
    var f = new Array();
    var node;

    var kdrag = 5;
    for (var i = 0; i < state.length; i++) {
        node = state[i];


        // drag force
        f[i] = [node[3], node[4], node[2], -kdrag*node[3], -kdrag*node[4]];
        

        // nulify force and velocity on fixed nodes
        if (node[2]) {
            f[i] = [0, 0, node[2], 0, 0];
        }
        
    }

    //spring forces
    var kspring = 10;
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i]; 
        var pt1 = state[edge[0]];
        var pt2 = state[edge[1]];
        var r = edge[2]
        var d = Math.sqrt(Math.pow(pt1[0]-pt2[0],2) + Math.pow(pt1[1] - pt2[1],2));
        var fx = kspring*(d - r) * (pt2[0] - pt1[0])/d;
        var fy = kspring*(d - r) * (pt2[1] - pt1[1])/d;

        // add spring force to pt1
        f[edge[0]][3] += fx;
        f[edge[0]][4] += fy;

        // add spring force to pt2
        f[edge[1]][3] -= fx;
        f[edge[1]][4] -= fy;
    }
    
    



    return f;

}

function timeStep(data, forces, t) {
   var state = data[0]; 
   var node;
   var nodeF;

   for (var i = 0; i < state.length; i++) {
       node = state[i];
       nodeF = forces[i];
       
       node[0] = node[0] + t*nodeF[0];
       node[1] = node[1] + t*nodeF[1];
       node[3] = node[3] + t*nodeF[3];
       node[4] = node[4] + t*nodeF[4];
       
   }
};


/*
function RK4step(data, forces, t) {
    var state = data[0];
    var node;
    var nodeF;

    for (var i = 0; i < state.length; i++) {
        node = state[i];
        nodeF = forces[i];

        var k1x = t*nodeF[0];
        var k1y = t*nodeF[1]
        var k1vx = t*nodeF[3];
        var k1vy = t*nodeF[4];

        var k2x = 
    }

}
*/