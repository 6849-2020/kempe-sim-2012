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
  //document.write(JSON.stringify(mul_one));
  //document.write(JSON.stringify(mul_two));


  //Combine mul_one and mul_two, first item in the pts[] of the linkage is the shared root.
  var mul_two_pts = mul_two[0].slice();
  mul_two_pts.shift();
  var shift = mul_one[0].length -1 ;
  for(var i = 0; i < mul_two[1].length; i++){
    var newp1 = mul_two[1][i][0];
    var newp2 = mul_two[1][i][1];
    if(newp1 != 0){
        newp1 = shift + newp1;
    }
    if(newp2 != 0){
        newp2 = shift + newp2;
    }
    mul_one[1].push([newp1,newp2,mul_two[1][i][2]]);
  }
  var combined_pts = mul_one[0].concat(mul_two_pts);
  var combined_edges = mul_one[1];
  
  //Put them through the additor;
  var additor = createALinkage(combined_pts[0], combined_pts[mul_one[0].length-1], combined_pts[combined_pts.length-1], params[3], params[0]);

  var additor_pts = additor[0].slice();
  additor_pts.splice(0,3);
  var shift = combined_pts.length - 3;
  var p1_pos = mul_one[0].length-1;
  var p2_pos = combined_pts.length-1
  for(var i = 0; i < additor[1].length; i++){
    var newp1 = additor[1][i][0];
    var newp2 = additor[1][i][1];
    if(newp1 != 0){
        if (newp1 == 1){
            newp1 = p1_pos;
        }
        else if(newp1 == 2){
            newp1 = p2_pos;
        }
        else{
            newp1 = shift + newp1;
        }
    }
    if(newp2 != 0){
        if (newp2 == 1){
            newp2 = p1_pos;
        }
        else if(newp2 == 2){
            newp2 = p2_pos;
        }
        else{
            newp2 = shift + newp2;
        }
    }
    combined_edges.push([newp1,newp2,additor[1][i][2]]);
  }
  var combined_pts_2 = combined_pts.concat(additor_pts);
  var combined_edges_2 = combined_edges;
  //var additor = createALinkage(parent[0][0], normalize(parent[0][1]), normalize(parent[0][2]), params[3], params[0]);
  //Additor terms
  //Scale by c
  //return linkage
  //return mul_two;
  //return additor;
  return [combined_pts_2,combined_edges_2];
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

    pts = pts.concat([p1,p2,m_1,n_1]);

    var e_0 = [0,1,l];
    var e_1 = [0,2,2.0*l];
    var e_2 = [1,3,2.0*l];
    var e_3 = [2,3,l];

    edges = edges.concat([e_0,e_1,e_2,e_3]);

    //Multiplicative contra-parallelograms;
    var len = pts.length;
    var unit_l = l;
    var newpts;
    var newedges;
    if( n > 1 ){
        newpts = mulContraPara(pts[len-3],pts[len-1],unit_l/2.0);
        pts = pts.concat(newpts);
        len = pts.length;
        e_1 = [len-2,len-1,unit_l];
        e_2 = [0,len-1,unit_l/2.0];
        e_3 = [len-2,len-3,unit_l*(3/4.0)]; 
        e_4 = [len-2,len-5,unit_l*(1/4.0)];
        newedges = [e_1,e_2,e_3,e_4];
        edges = edges.concat(newedges);
        unit_l = unit_l/2.0;   
    }
    for(var j = 2; j < n; j++){
        newpts = mulContraPara(pts[len-1],pts[len-2],unit_l/2.0);
        pts = pts.concat(newpts);

        //after 1 iter pts looks like [p1,p2,m_1,n_1,np_1,np_2]
        len = pts.length;
        e_1 = [len-2,len-1,unit_l];
        e_2 = [0,len-1,unit_l/2.0];

        //Edges to make sure point anchored on bar
        e_3 = [len-2,len-3,unit_l*(3/4.0)]; 
        e_4 = [len-2,len-4,unit_l*(1/4.0)];
        newedges = [e_1,e_2,e_3,e_4];
        edges = edges.concat(newedges);
        unit_l = unit_l/2.0;
    }

    var lastpoint = pts[pts.length-1];
    var ll = Math.sqrt((lastpoint[0]-p1[0])*(lastpoint[0]-p1[0])+(lastpoint[1]-p1[1])*(lastpoint[1]-p1[1]));
    lastpoint = [(lastpoint[0]-p1[0])/ll+p1[0], (lastpoint[1]-p1[1])/ll+p1[1],false];
    pts.push(lastpoint);
    edges.push([0, pts.length-1]);
    edges.push([pts.length-2,pts.length-1]);
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
    return [np2,np1];
}

function createALinkage(root, p1, p2, angle, length)
{
    var mp = [p1[0]+p2[0], p1[1]+p2[1]];
    mp = normalize(mp);

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

    if(angle != 0){
        var p12 = [p11[0]*Math.cos(angle)-p11[1]*Math.sin(angle), p11[0]*Math.sin(angle)+p11[1]*Math.cos(angle), false];
        pts.push(p12);
        edges.push([0,12]);
        edges.push([11,12]);
    }

    p_last = pts[pts.length-1];
    var p_lastlen = Math.sqrt(p_last[0]*p_last[0]+p_last[1]*p_last[1]);
    pts.push([p_last[0]/p_lastlen*length, p_last[1]/p_lastlen*length, false]);

    edges.push([0,pts.length-1]);
    edges.push([pts.length-2,pts.length-1]);

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
// $(document).ready(function(){
//     parent = createParent(1,1,1);
//     //document.write(JSON.stringify(parent));
//     params = [1,2,0,0];
//     mul = createMLinkage(params[1], parent[0][0],parent[0][1],parent[1][0][2]);
//     document.write(JSON.stringify(mul));
// });