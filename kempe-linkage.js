
 
 function createParent(terms){

 }

 /*
 INPUT: Terms in format [alpha,beta,[c_1,ma_1,mb_1,d_1],
 [c_2,ma_2,mb_2,d_2]...]

 RETURNS: List of linkages for each cosine term 
 */
function createKempeLinkage(terms){
	var linkages = [];
	var a = terms[0];
	var b = terms[1];
	var parent = createParent(terms);
	linkages.push(parent);
	for (var i = 2; i < terms.length; i++)
	{
		linkages.push(createLinkage(a,b,parent,terms[i]));
	}
	return linkages;
}

/*
INPUT: Angles a and b, Parent parallelogram p [[p_o,p_a,p_b,p_f],[o_a,o_b,a_f,b_f]] and  single linkage params [c_1,ma_1,mb_1,d_1]

RETURNS: list representation of the linkage[[p_1,p_2...],[e_1,e_2...]] where p_i is a point in format [x,y,bool], and e_i is of the form [p_s,p_e,length]
*/
function createLinkage(a,b,parent, params){
  var linkage = [[][]];
  //Multiplicator terms, returns additional points,edges to be attached to parent
  var p_edge_length = parent[1][0][2];
  var mul_one = createMLinkage(a,params[1],parent[0][0],parent[0][1],p_edge_length);
  var mul_two = createMLinkage(b,params[2],parent[0][0],parent[0][2],p_edge_length);
  //Additor terms
  //Scale by c
  return linkage
}

/*
INPUT: The angle to be multiplied, the number of times to be multiplied n, the points of the parent edge to which all other edges are attached,the length of the parent edge.

RETURNS: list of additional points, and edges to be added to the linkage
*/

function createMLinkage(angle,n,p1,p2,l){
	var pts = []
	var edges = []

	//Anchor contra-parallelogram
	var m_1 = [2.0*l,0.0,true];
	var line = findLine(p2,m_1);
	var n_1 = reflectPoint(line[0],line[1],[p2[0]+2.0*l,p2[1],false]);

	pts = pts.concat([p1,m_1,p2,n_1]);

	var e_1 = [0,2,2.0*l];
	var e_2 = [1,3,2.0*l];
	var e_3 = [2,3,l];

	edges = edges.concat([e_1,e_2,e_3]);

	//Multiplicative contra-parallelograms;
	var len = pts.length;
    var unit_l = l;
	for(var j = 0; j < n; j++){
		pts.concat(mulContraPara(pts[len-2],pts[len-1]));
		//after 1 iter pts looks like [p1,m_1,p2,n_1,np_1,np_2]
		//e_1 connects np_1 and 
		e_1 = [pts[len-1],pts[len-2],unit_l];
		e_2 = [pts[0],pts[len-2],unit_l/2.0];
		edges.concat([e_1,e_2]);
		unit_l = unit_l/2.0;
	}
}

/*
INPUT: 3 points on the anchor parallelogram, the length of the short side of the anchor 
*/
function mulContraPara(p1,p2,l){
	var x1 = p1[0];
	var y1 = p1[0];
	var x2 = p2[0];
	var y2 = p2[0];

	//Locate anchor point on long side of parent
	var nx2 = x1 + (x2-x1)*(1/4.0)*l;
	var ny2 = y1 + (y2-y1)*(1/4.0)*l;

	var np2 = [nx,ny,false];

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
	var b = p1[1] - slope*p1[0];
	return [m,b];
}
function reflectPoint(m,b,point){
	var x = point[0];
	var y = point[1];
	var d = (x + (y - b)*m)/(1 + m*m);
	var x_f = 2*d - x;
	var y_f = 2*d*a -y + 2*c;
	return [x_f,y_f,point[2]];
}
function bracePara(angle,n,p1,p2){
}

function braceContraPara(angle,n,p1,p2){
}
function midPoint(angle,n,p1,p2){
}