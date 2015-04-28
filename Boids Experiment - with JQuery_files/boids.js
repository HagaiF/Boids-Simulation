// we'll keep the boids in an array
// the first 4 numbers will be x,y,dx,dy

function createNewBoidsList(params)
{
	if (typeof(params) == "undefined") params = {};
	if (typeof(params.num) == "undefined") params.num = 50;
	if (typeof(params.radius) == "undefined") params.radius = 10;
	if (typeof(params.width) == "undefined") params.width = 500;
	if (typeof(params.height)== "undefined") params.height = 500;
	if (typeof(params.initV) == "undefined") params.initV = "random";
	if (typeof(params.vel)   == "undefined") params.vel = 10;
	if (typeof(params.bounce) == "undefined") params.bounce = 2;
	if (typeof(params.toward_force) == "undefined") params.toward_force = 0;
	if (typeof(params.freewill_force) == "undefined") params.freewill_force = 0;
	if (typeof(params.distance) == "undefined") params.distance = 75;
	if (typeof(params.separation_force) == "undefined") params.separation_force = .4;
	if (typeof(params.cohesion) == "undefined") params.cohesion = 150;
	if (typeof(params.cohesion_force) == "undefined") params.cohesion_force = 1;
	
	boidslist = new Array(params.num);
			
	for(var i=0; i<params.num; i++) {
		var bi = new Array(8); // X,Y,dx,dy,type,bn,sn,cn;
		boidslist[i] = bi;
	}
	boidslist.params = params;
	BoidType[selectedIndex].num += params.num;
	initVals(boidslist);
	
	return boidslist;
}

function NewBoid(boids,X,Y)
{
	var bi = new Array(8);
	var i = boids.length;
	bi[0] = X;
	bi[1] = Y;
	bi[2] = 20.0 * Math.random() - 10.0;
	bi[3] = 20.0 * Math.random() - 10.0;
	bi[4] = selectedIndex;
	bi[5] = []; // bounce neighbor list
	bi[6] = []; // separate neighbor list
	bi[7] = []; // cohesion neighbor list
	BoidType[selectedIndex].num++;
	boids.push(bi);
	$("#boids_box").text(BoidType[selectedIndex].num);
}

function initVals(boids)
{
	var p = boids.params;
	var diam = 2*p.radius;
	for(var i=0; i<boids.params.num; i++) {
		var bi = boids[i];
		bi[0] = p.radius + (p.width -diam)  * Math.random();
		bi[1] = p.radius + (p.height-diam)  * Math.random();
		switch (p.initV) {
			case "random":
				bi[2] = 20.0 * Math.random() - 10.0;
				bi[3] = 20.0 * Math.random() - 10.0;
				break;
			case "poles":
				switch( i%4 ) {
					case 1: bi[2]= 1; bi[3]= 0; break;
					case 2: bi[2]=-1; bi[3]= 0; break;
					case 3: bi[2]= 0; bi[3]= 1; break;
					case 0: bi[2]= 0; bi[3]=-1; break;
				}
				break;
			case "diag":
			default:
				bi[2] = 10;
				bi[3] = 10;				
		}
		bi[4] = selectedIndex;
		bi[5] = []; // bounce neighbor list
		bi[6] = []; // separate neighbor list
		bi[7] = []; // cohesion neighbor list
		boids[i] = bi;
	}
	normVel(boids);
}

function normVel(boids)
{
	var v = boids.params.vel;
	var tf = boids.params.toward_force;
	var ff = boids.params.freewill_force;
	var ntf = 1 - tf;
	var nff = 1 - ff;
	if (v>0) {
		for(var i=boids.length-1; i>=0; i--) {
			var b = boids[i];
			var force = Math.sqrt(b[2]*b[2]+b[3]*b[3]);
			var dir;
			if (tf != 0 && b[4]&0x10) {
			   var dx = mouseX - b[0];
			   var dy = mouseY - b[1];
			   dir = Math.atan2(dy, dx);
			   dx = force*Math.cos(dir);
			   dy = force*Math.sin(dir);
			   b[2] = tf*dx + ntf*b[2];
			   b[3] = tf*dy + ntf*b[3];
			}
			if (ff != 0 && b[4]&0x1) {
			   dir = 2*Math.PI*Math.random();
			   dx = force*Math.cos(dir);
			   dy = force*Math.sin(dir);
			   b[2] = ff*dx + nff*b[2];
			   b[3] = ff*dy + nff*b[3];
			}
			var z = v/force;
			b[2] *= z;
			b[3] *= z;
		}
	}
}

function bounce(boids)
{
	var p = boids.params;
	var rad = p.radius;
	var a90 = Math.PI/2;
	for(var i=boids.length-1; i>=0; i--) {
		var bi = boids[i];
		var blist = bi[5];
		var d = Math.sqrt(bi[2]*bi[2] + bi[3]*bi[3]);
		for(var j=blist.length-1; j>=0; j--) {
			var k = blist[j];
			var bk = boids[k];
			var dx = bi[0] - bk[0];
			var dy = bi[1] - bk[1];
			var angle = Math.atan2(dy, dx);
			bi[2] = rad*Math.cos(angle);
			bi[3] = rad*Math.sin(angle);
		}
	}
}

function tangent(boids)
{
	var p = boids.params;
	var rad = p.radius;
	var a90 = Math.PI/2;
	for(var i=boids.length-1; i>=0; i--) {
		var bi = boids[i];
		var blist = bi[5];
		var d = Math.sqrt(bi[2]*bi[2] + bi[3]*bi[3]);
		for(var j=blist.length-1; j>=0; j--) {
			var k = blist[j];
			if (k < i) {
				var bk = boids[k];
				var dx = bi[0] - bk[0];
			  	var dy = bi[1] - bk[1];
				var angle = Math.atan2(dy, dx);
				var ad = Math.atan2(bi[3], bi[2]);
				var pa = Math.sign(angle - ad);
				bi[2] = rad*Math.cos(angle - pa*a90);
				bi[3] = rad*Math.sin(angle - pa*a90);
			}
		}
	}
}


function separation(boids)
{	
	var p = boids.params;
	var dist = p.distance;
	var sf = p.separation_force;
	var nsf = 1-sf;
	var a90 = Math.PI;// /2;
	for(var i=boids.length-1; i>=0; i--) {
		var bi = boids[i];
		var bix = bi[0];
		var biy = bi[1];
		var bkdx = bi[2];
		var bkdy = bi[3];
		var d = Math.sqrt(bi[2]*bi[2] + bi[3]*bi[3]);
		var bkx = 0;
		var bky = 0;
		var blist = bi[6];
		for(var j=blist.length-1; j>=0; j--) {
			 var k = blist[j];
			 var bk = boids[k];
			 bkx += bk[0];
			 bky += bk[1];
		}
		if (blist.length>0) {
		   bkx /= blist.length;
		   bky /= blist.length;
		   var dx = bix - bkx;
		   var dy = biy - bky;
		   var force = (dist - dx*dx - dy*dy)/dist;
		   var angle = Math.atan2(dy, dx);
		   bkdx = force*d*Math.cos(angle-a90);
		   bkdy = force*d*Math.sin(angle-a90);
		   }
		
		if (bi[4]&0x2) {
		   bi[2] = sf*bkdx + nsf*bi[2];
		   bi[3] = sf*bkdy + nsf*bi[3];
		}
	}
}

function cohesion(boids)
{	
	var p = boids.params;
	var cf = p.cohesion_force;
	var ncf = 1-cf;
	var dist = p.distance;
	for(var i=boids.length-1; i>=0; i--) {
		var bi = boids[i];
		var bix = bi[0];
		var biy = bi[1];
		var bkdx = bi[2];
		var bkdy = bi[3];
		var d = Math.sqrt(bi[2]*bi[2] + bi[3]*bi[3]);
		var bkx = 0;
		var bky = 0;
		var blist = bi[7];
		for(var j=blist.length-1; j>=0; j--) {
			 var k = blist[j];
			 var bk = boids[k];
			 bkx += bk[0];
			 bky += bk[1];
		}
		if (blist.length>0) {
		   bkx /= blist.length;
		   bky /= blist.length;
		   var dx = bix - bkx;
		   var dy = biy - bky;
		   var force = Math.sqrt(dx*dx + dy*dy) - dist;
		   var angle = Math.atan2(dy, dx);
		   bkdx = force*d*Math.cos(angle-Math.PI);
		   bkdy = force*d*Math.sin(angle-Math.PI);
		   }
		
		if (bi[4]&0x4) {
		   bi[2] = cf*bkdx + ncf*bi[2];
		   bi[3] = cf*bkdy + ncf*bi[3];
		}
	}
}

function alignment(boids)
{	
	var p = boids.params;
	var af = p.alignment_force;
	var naf = 1-af;
	var dist = p.distance;

	for(var i=boids.length-1; i>=0; i--) {
		var bi = boids[i];
		var bix = bi[0];
		var biy = bi[1];
		//var d = Math.sqrt(bi[2]*bi[2] + bi[3]*bi[3]);
		var bkdx = 0;
		var bkdy = 0;
		
		var blist = bi[6].concat(bi[7]);
		for(var j=blist.length-1; j>=0; j--) {
			 var k = blist[j];
			 if (k < i) {
			 	var bk = boids[k];
				bkdx += bk[2];
			 	bkdy += bk[3];
				}
		}
		
		if (blist.length>0) {
		   bkdx /= blist.length;
		   bkdy /= blist.length;
		} else {
		   bkdx = bi[2];
		   bkdy = bi[3];
		}
		
		if (bi[4]&0x8) {
		   bi[2] = af*bkdx + naf*bi[2];
		   bi[3] = af*bkdy + naf*bi[3];
		}
	}
}

function advance(boids)
{
	var p = boids.params;
	var r  = p.radius;
	var a90 = Math.PI/2;
	var rb = p.width - r;
	var bb = p.height- r;
	var eb = EdgeMode ? 0 : 1;
	
	
	for(var i=boids.length-1; i>=0; i--) {
		var bi = boids[i];
		var nx = bi[0] + bi[2];
		var ny = bi[1] + bi[3];
		
		if (eb) {
			// bounce of the edge
			if (nx>rb) {
				nx = rb;
				bi[2] *= -1;
			}
			if (ny>bb) {
				ny = bb;
				bi[3] *= -1;
			}
			if (nx<r) {
				nx = r;
				bi[2] *= -1;
			}
			if (ny<r) {
				ny = r;
				bi[3] *= -1;
			}
		} else {
			// torus
			if (nx>rb) {
				nx -= (rb-r);
			}
			if (ny>bb) {
				ny -= (bb-r);
			}
			if (nx<r) {
				nx += (rb-r);
			}
			if (ny<r) {
				ny += (bb-r);
			}
		
		}
		
		bi[0] = nx;
		bi[1] = ny;
	}
}


function neighbors(boids)
{
 	var p = boids.params;
	var srange = p.distance*p.distance;
	var crange = p.cohesion*p.cohesion;
	var brange  = 4*p.radius*p.radius+18;
	var sf = p.separation_force;
	var r  = p.radius;
	
	for(var i=boids.length-1; i>=0; i--) {
			boids[i][5].splice(0,boids[i][5].length);
			boids[i][6].splice(0,boids[i][6].length);
			boids[i][7].splice(0,boids[i][7].length);
 			var bi = boids[i];
			var bix = bi[0];
			var biy = bi[1];
			for(var j=boids.length-1; j>=0; j--) {
				if (j == i)  { continue; }
 				var bj = boids[j];
 				var bjx = bj[0];
				var bjy = bj[1];
				var dx = bix - bjx;
				var dy = biy - bjy;
				var sqr_dis = dx*dx + dy*dy;
				if (sqr_dis < brange) {
			   	   bi[5].push(j);
				} else if (sqr_dis < srange) {
			   	   bi[6].push(j);
			   	} else if (sqr_dis < crange) {
			   	   bi[7].push(j);
			   	}
			}
 	}
}


