//FIX FIND LINE, REFLECT
 
 function createParent(a,b,l){
    var points = [[0,0,true],[-8,-4,false],[-4,-8,false],[-12,-12,false]];
    var l = 4*Math.sqrt(5);
    var edges = [[0,1,l],[0,2,l],[1,3,l],[2,3,l]];
    return[points,edges];
 }

 /*
 INPUT: Terms in format alpha,beta,[c_1,ma_1,mb_1,d_1],
 [c_2,ma_2,mb_2,d_2]...]

 RETURNS: List of linkages for each cosine term 
 */
function createKempeLinkage(a,b,terms){
    var linkages = [];
    var parent = createParent(a,b,l);
    linkages.push(parent);
    for (var i = 2; i < terms.length; i++)
    {
        linkages.push(createLinkage(parent,terms[i]));
    }
    return linkages;
}

/*
INPUT: Angles a and b, Parent parallelogram p [[p_o,p_a,p_b,p_f],[o_a,o_b,a_f,b_f]] and  single linkage params [c_1,ma_1,mb_1,d_1]

RETURNS: list representation of the linkage[[p_1,p_2...],[e_1,e_2...]] where p_i is a point in format [x,y,bool], and e_i is of the form [p_s,p_e,length]
*/
function createLinkage(parent, params){
  var linkage = [];
  //Multiplicator terms, returns additional points,edges to be attached to parent
  var p_edge_length = parent[1][0][2];
  var mul_one = createMLinkage(params[1],parent[0][0],parent[0][1],p_edge_length);
  //var mul_two = createMLinkage(params[2],parent[0][0],parent[0][2],p_edge_length);
  //Additor terms
  //Scale by c
  //return linkage
  return mul_one;
}

/*
INPUT: The angle to be multiplied, the number of times to be multiplied n, the points of the parent edge to which all other edges are attached,the length of the parent edge.

RETURNS: list of additional points, and edges to be added to the linkage
*/

function createMLinkage(n,p1,p2,l){
    var pts = []
    var edges = []

    //Anchor contra-parallelogram
    var m_1 = [2.0*l,0.0,true];
    var line = findLine(p2,m_1);
    var n_1 = reflectPoint(line[0],line[1],[p2[0]+2.0*l,p2[1],false]);

    pts = pts.concat([p1,m_1,p2,n_1]);

    var e_1 = [0,1,2.0*l];
    var e_2 = [2,3,2.0*l];
    var e_3 = [1,3,l];

    edges = edges.concat([e_1,e_2,e_3]);

    //Multiplicative contra-parallelograms;
    var len = pts.length;
    var unit_l = l;
    var newpts;
    var newedges;
    for(var j = 1; j < n; j++){
        newpts = mulContraPara(pts[len-2],pts[len-1],unit_l/2.0);
        pts = pts.concat(newpts);

        //after 1 iter pts looks like [p1,m_1,p2,n_1,np_1,np_2]
        len = pts.length;
        e_1 = [len-1,len-2,unit_l];
        e_2 = [0,len-2,unit_l/2.0];

        //Edges to make sure point anchored on bar
        e_3 = [len-1,len-3,unit_l*(3/4.0)]; 
        e_4 = [len-1,len-4,unit_l*(1/4.0)];
        newedges = [e_1,e_2,e_3,e_4];
        edges = edges.concat(newedges);
        unit_l = unit_l/2.0;
    }
    //alert(JSON.stringify(edges));
    //edges[edges.length - 3][2] = 30;
    //alert(JSON.stringify(edges));
    //return [pts,[[0,1,unit_l],[0,2,unit_l],edges[edges.length-3]]];
    return [pts,edges];
}

/*
INPUT: 3 points on the anchor parallelogram, the length of the short side of the anchor 
*/
function mulContraPara(p1,p2,l){
    var x1 = p1[0];
    var y1 = p1[1];
    var x2 = p2[0];
    var y2 = p2[1];

    //Locate anchor point on long side of parent
    var nx2 = x1 + (x2-x1)*(1/4.0);
    var ny2 = y1 + (y2-y1)*(1/4.0);

    var np2 = [nx2,ny2,false];

    //Locate other anchor point
    var nx1 = nx2 - x1;
    var ny1 = ny2 - y1;
    var np1 = [nx1,ny1,false];
    var line = findLine([0,0,true],np2);
    np1 = reflectPoint(line[0],line[1],np1);

    return [np1,np2];
}

function findLine(p1,p2){
    var m = (p1[1]-p2[1])/(p1[0]-p2[0]);
    var b = p1[1] - m*p1[0];
    return [m,b];
}
function reflectPoint(m,b,point){
    var x = point[0];
    var y = point[1];
    var d = (x + (y - b)*m)/(1 + m*m);
    var x_f = 2*d - x;
    var y_f = 2*d*m -y + 2*b;
    return [x_f,y_f,point[2]];
}
function bracePara(angle,n,p1,p2){
}

function braceContraPara(angle,n,p1,p2){
}
function midPoint(angle,n,p1,p2){
}
$(document).ready(function(){
    parent = createParent(1,1,1);
    //document.write(JSON.stringify(parent));
    params = [1,2,0,0];
    mul = createMLinkage(params[1], parent[0][0],parent[0][1],parent[1][0][2]);
    document.write(JSON.stringify(mul));
});