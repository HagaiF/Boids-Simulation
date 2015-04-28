var theCanvas;
var theContext;
var theBoids;
var theBarrier;
var reqFrame;
var running;
var debug;
var EdgeMode;
var nlist, blist;


var selectedIndex;

  
function start(numboids)
{
	if (typeof(numboids)=="undefined") numboids=50;
	theCanvas = document.getElementById("mycanvas");
	
	theContext = theCanvas.getContext("2d");
	
	theBoids = createNewBoidsList( {num:numboids, radius:5, initV:"random",
									vel:5, width:theCanvas.width, height:theCanvas.height} );
	theBarrier = createNewBarrierList(50);

	// shim layer with setTimeout fallback
	reqFrame =window.requestAnimationFrame ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame ||
	          window.oRequestAnimationFrame ||
	          window.msRequestAnimationFrame ||
	          function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element){
	            window.setTimeout(callback, 1000 / 60);
				};
	running = 1;
	debug = 0;
	EdgeMode = 0;
	BarrierMode = 0;
	reqFrame(animLoop,theCanvas);
}
function setclicks()
{
	theCanvas.onclick = function() { if (!running) {running=1; reqFrame(animLoop,theCanvas);}};
	document.getElementById("stopbutton").onclick = function() {running=0;};
	//document.getElementById("debugbutton").onclick = function() {debug=1;};
}

function drawBoids()
{
	theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
	var circ = Math.PI*2;
	var rad = theBoids.params.radius;

	var cent = {x:0, y:0};	   
	for(var i=theBoids.length-1; i>=0; i--) { 
		
		var bi = theBoids[i];
		var blist = bi[5];
		cent.x = bi[0];
		cent.y = bi[1];
		/*
		for(var j=blist.length-1; j>=0; j--) {
				var k = blist[j];
				if (k < i) {
				   var bk = theBoids[k];
				   var dx = cent.x - bk[0];
			  	   var dy = cent.y - bk[1];
				   var angle = Math.atan2(dy, dx);
				   cent.x += rad*Math.cos(angle);
				   cent.y += rad*Math.sin(angle);
				}
		}
	    */
		theContext.beginPath();
		theContext.arc(cent.x,cent.y,rad,0,circ,true);   // Boids Arc
		theContext.closePath();
		theContext.fillStyle = BoidType[theBoids[i][4] & 0x1f].color;
		theContext.stroke();  
		theContext.fill();
		
		theContext.beginPath();
		theContext.moveTo(cent.x,cent.y);
		theContext.lineTo(cent.x+theBoids[i][2]*rad,cent.y+theBoids[i][3]*rad);	
		theContext.closePath();
		theContext.strokeStyle="black";
		theContext.stroke();
		//theContext.fill();
		
		if (debug) {
		   if (theBoids[i][4] & 0x40) {
		   	  var X = theBoids[i][0];
			  var Y = theBoids[i][1];
			  var Dx = theBoids[i][2];
			  var Dy = theBoids[i][3];
			  var force = (Dx*Dx + Dy*Dy)*rad;
			  var angle = Math.atan2(Dy, Dx);
		   	  theContext.beginPath();
		   	  theContext.moveTo(X+Dx*rad,Y+Dy*rad);
		   	  theContext.lineTo(X+Dx*force+3*rad*Math.cos(angle-0.5),Y+Dy*force+3*rad*Math.sin(angle-0.5));
		   	  theContext.lineTo(X+Dx*force+3*rad*Math.cos(angle+0.5),Y+Dy*force+3*rad*Math.sin(angle+0.5));	
		   	  theContext.closePath();
		   	  theContext.strokeStyle=BoidType[theBoids[i][4] & 0x1f].color;
			  theContext.fillStyle=BoidType[theBoids[i][4] & 0x1f].color;
		   	  theContext.stroke();
		   	  theContext.fill();
			  print_param(1,"Boid character = ",BoidType[theBoids[i][4] & 0x1f].color);
			  print_param(2,"Boid Index = ",i);
			  print_param(3,"Boid x = ",Math.floor(X));
			  print_param(4,"Boid y = ",Math.floor(Y));
			  print_param(5,"Boid dx = ",Math.floor(Dx*100)/100);
			  print_param(6,"Boid dy = ",Math.floor(Dy*100)/100);
			  print_param(7,"Boid Type = ",theBoids[i][4]);
			  print_param(8,"Bounce Neighbors = ",theBoids[i][5].length);
			  print_param(9,"Separate Neighbors = ",theBoids[i][6].length);
			  print_param(10,"Cohesion Neighbors = ",theBoids[i][7].length);
			  print_param(11,"k = ",theBoids[i][5][0]);
		   	  if (theBoids[i][4] & 0x2) {
		   	  	 var distance = theBoids.params.distance;
		   	  	 theContext.beginPath();
		   	  	 theContext.arc(theBoids[i][0],theBoids[i][1],distance,0,circ,true);   // Boids Separation
		   	  	 theContext.closePath();
		   	  	 theContext.strokeStyle="red";
		   	  	 theContext.stroke();
			  }
		   	  if (theBoids[i][4] & 0x4) {
		   	  	 var cohesion = theBoids.params.cohesion;
		   	  	 theContext.beginPath();
		   	  	 theContext.arc(theBoids[i][0],theBoids[i][1],cohesion,0,circ,true);   // Boids Cohesion
		   	  	 theContext.closePath();
		   	  	 theContext.strokeStyle="blue";
		   	  	 theContext.stroke();
			  }
		   }
		}
	}
	for(var i=barrier-1; i>=0; i--) { // draw line
		theContext.beginPath();
		theContext.arc(theBarrier[i][0],theBarrier[i][1],10,0,circ,true);   // Boids Arc
		//theContext.arc(600,250,10,0,circ,true);   // Boids Arc
		theContext.closePath();
		theContext.strokeStyle="black";
		theContext.fillStyle = "red";
		theContext.stroke();
		theContext.fill();
	}
}

function canvasclick()
{
 var ind = getBoidsIndex();
 if (running) {
 		//var isInd = (ind == ".") ? 0 : 1;
 		if (ind == ".") {
 		   NewBoid(theBoids,mouseX,mouseY);
		}
	} else {
	  	if (ind == ".") {
 		   theBarrier[barrier][0] = mouseX;
 		   theBarrier[barrier][1] = mouseY;
 		   barrier++;  
		} else {
		   var bi = theBoids[ind];
		   bi[4] = bi[4] | 0x40;
		}
	  	drawBoids();
	}
}

function createNewBarrierList(maxNum)
{
 	barrier = 0;
 	barrierlist = new Array(maxNum);
			
	for(var i=0; i<maxNum; i++) {
		var bi = new Array(3);
		barrierlist[i] = bi;
	}
	return barrierlist;
}

function getBoidsIndex()
{
 	var p = theBoids.params;
	var radsqr = p.radius*p.radius + 5;
	var index = ".";
	for(var i=theBoids.length-1; i>=0; i--) {
		var bi = theBoids[i];
		var dx = mouseX - bi[0];
		var dy = mouseY - bi[1];
		var range = dx*dx + dy*dy;
		if (radsqr > range) {
		   index = i;
		   }  
	}
	return index;
}

		
function animLoop()
{
	neighbors(theBoids);
	bounce(theBoids);
	//tangent(theBoids)
	separation(theBoids);
	cohesion(theBoids);
	alignment(theBoids);
	normVel(theBoids);
	advance(theBoids);
	drawBoids();
	if (running) reqFrame(animLoop,theCanvas);
}



