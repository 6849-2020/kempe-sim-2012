//FIX FIND LINE, REFLECT
 
 function createParent(a,b,l){
    var points = [[0,0,true],[8,4,false],[4,8,false],[11,11,false]];
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
  var mul_two = createMLinkage(params[2],parent[0][0],parent[0][2],p_edge_length);

  // var additor = createALinkage(parent[0][0], mul_one[0][mul_one[0].length-1], mul_two[0][mul_two[0].length-1], params[3], params[0]);
  var additor = createALinkage(parent[0][0], normalize(parent[0][1]), normalize(parent[0][2]), params[3], params[0]);
  //Additor terms
  //Scale by c
  //return linkage
  return additor;
}

/*
INPUT: The angle to be multiplied, the number of times to be multiplied n, the points of the parent edge to which all other edges are attached,the length of the parent edge.

RETURNS: list of additional points, and edges to be added to the linkage

last point is the resulting multiplied point, scaled to length 1.0
*/

function createMLinkage(n,p1,p2,l){
    var pts = []
    var edges = []

    //Anchor contra-parallelogram
    var m_1 = [2.0*l,0.0,true];
    var n_1 = reflect(p2[0]+2.0*l, p2[1], p2[0], p2[1], 2.0*l, 0.0);
    n_1.push(false);

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

    var lastpoint = pts[pts.length-2];
    var ll = Math.sqrt((lastpoint[0]-p1[0])*(lastpoint[0]-p1[0])+(lastpoint[1]-p1[1])*(lastpoint[1]-p1[1]));
    lastpoint = [(lastpoint[0]-p1[0])/ll+p1[0], (lastpoint[1]-p1[1])/ll+p1[1]];
    pts.push(lastpoint);
    edges.push([0, pts.length-1]);
    edges.push([pts.length-3,pts.length-1]);

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

    var np1 = reflect(nx1, ny1, 0, 0, nx2, ny2);
    np1.push(false);
    return [np1,np2];
}

function createALinkage(root, p1, p2, angle, length)
{
    var mp = [p1[0]+p2[0], p1[1]+p2[1]];
    var mplen = Math.sqrt(mp[0]*mp[0]+mp[1]*mp[1]);
    mp = [mp[0]/mplen, mp[1]/mplen, false];

    var pts = [
                [root[0], root[1], true],
                [p1[0], p1[1], false],
                [p2[0], p2[1], false]
                ];
    var edges = [
                    [0, 1],
                    [0, 2],
                ];

    var np1 = [p1[0]*2.0, p1[1]*2.0, false];
    var np2 = [p2[0]/2.0, p2[1]/2.0, false];
    pts.push(np1);
    pts.push(np2);
    edges.push([0,3]);
    edges.push([1,3]);
    edges.push([0,4]);
    edges.push([2,4]);

    pts.push(mp);
    edges.push([0,5]);

    var np3 = [np1[0]+mp[0], np1[1]+mp[1], false];
    np3 = reflect(np3[0], np3[1], mp[0], mp[1], np1[0], np1[1]);
    np3.push(false);
    pts.push(np3);
    edges.push([3,6]);
    edges.push([5,6]);

    var np4 = [(np3[0]-mp[0])*0.25+mp[0],(np3[1]-mp[1])*0.25+mp[1], false];
    pts.push(np4);
    edges.push([5,7]);
    edges.push([6,7]);
    edges.push([4,7]);

    pts.push([2,0, true]);
    var p9 = reflect(mp[0]+2, mp[1], mp[0], mp[1], 2, 0);
    p9.push(false);
    pts.push(p9);
    edges.push([0,8]); // optional
    edges.push([8,9]);
    edges.push([5,9]);

    pts.push([(p9[0]-mp[0])*0.25+mp[0], (p9[1]-mp[1])*0.25+mp[1], false]);
    edges.push([9,10]);
    edges.push([5,10]);

    var p11 = reflect(pts[10][0]-pts[5][0], pts[10][1]-pts[5][1], 0, 0, pts[10][0], pts[10][1]);
    p11.push(false);
    pts.push(p11);
    edges.push([0,11]);
    edges.push([10,11]);

    var p12 = [p11[0]*Math.cos(angle)-p11[1]*Math.sin(angle), p11[0]*Math.sin(angle)+p11[1]*Math.cos(angle), false];
    pts.push(p12);
    edges.push([0,12]);
    edges.push([11,12]);

    var p12len = Math.sqrt(p12[0]*p12[0]+p12[1]*p12[1]);
    pts.push([p12[0]/p12len*length, p12[1]/p12len*length, false]);
    edges.push([0,13]);
    edges.push([12,13]);

    console.log(pts);
    return [pts, edges];
}

function normalize(p)
{
    var pl = Math.sqrt(p[0]*p[0] + p[1]*p[1]);
    return [p[0]/pl, p[1]/pl];
}

function reflect(ax, ay, x1, y1, x2, y2)
{
    var ans = perpendicular(ax, ay, x1, y1, x2, y2);
    console.log(ans)
    return [2*ans[0]-ax, 2*ans[1]-ay];
}

function perpendicular(ax, ay, x1, y1, x2, y2)
{
    var dx = x2-x1;
    var dy = y2-y1;
    var dd = dx*dx + dy*dy;
    var q = ((ax-x1)*dx+(ay-y1)*dy)/dd;
    return [x1+q*dx, y1+q*dy];
}

function bracePara(angle,n,p1,p2){
}

function braceContraPara(angle,n,p1,p2){
}

function midPoint(angle,n,p1,p2){
}

// $(document).ready(function(){
//     parent = createParent(1,1,1);
//     //document.write(JSON.stringify(parent));
//     params = [1,2,0,0];
//     mul = createMLinkage(params[1], parent[0][0],parent[0][1],parent[1][0][2]);
//     document.write(JSON.stringify(mul));
// });