var mouseX, mouseY;
		
$(document).ready(function(){
	setTable();
	print_param(1,"Boid Type",BoidType[selectedIndex].character);
	print_param(2,"Boid Color",BoidType[selectedIndex].color);
	print_param(3,"Boid Num",selectedIndex); 
	$("#stopbutton").click(stopButtonCB);
	$("#debugbutton").click(debugButtonCB);
	$("#clrbutton").click(function(e) {
			theBoids.splice(0,theBoids.length);
			});
	$("#stepbutton").click(function(e) {
			if (!running) {
			   reqFrame(animLoop,theCanvas);
			   }
			});
	$("#createbutton").click(createButtonCB);
	$("#edgebutton").click(edgeButtonCB);
	$("#mycanvas").mousemove(function( e ) {
  		var offset = $(this).offset();
  		mouseX =  Math.floor(e.pageX - offset.left);
  		mouseY =  Math.floor(e.pageY - offset.top);
  		$("#curpos").text( "( " + mouseX + " , " + mouseY + ")" );
		if (!running) {
		   var ind = getBoidsIndex();
		   print_param(1,"Boid Search ",ind);
		   var isInd = (ind == ".") ? 0 : 1;
		   if (isInd) {
		   	  print_param(2,"Boid Index = ",ind);
			  print_param(3,"Boid x = ",Math.floor(theBoids[ind][0]));
			  print_param(4,"Boid y = ",Math.floor(theBoids[ind][1]));
			  print_param(5,"Boid dx = ",Math.floor(theBoids[ind][2]*100)/100);
			  print_param(6,"Boid dy = ",Math.floor(theBoids[ind][3]*100)/100);
			  var btype = theBoids[ind][4];
			  print_param(7,"Boid Type = ",btype);
			  print_param(8,"Boid Color = ",BoidType[btype].color);
			  print_param(9,"Boid Character = ",BoidType[btype].character);
			  }
		   }
		});
	$("#mycanvas").click(function(e) {
			canvasclick();
			 });
	
	
    $("#panel1").slideUp();
	$("#panel2").slideUp();
	$("#panel3").slideUp();
    $("#btn1").mouseover(function(){
		if ($("#btn1box").attr("title") == "") {
           $("#btn1box").animate({top: "+=610px"});
		   $("#panel1").slideDown();
		   $("#btn1box").attr("title", "open");
		}
    });
	$("#btn1").click(function(){
		$("#panel1").slideUp();
		$("#btn1box").animate({top: "-=610px"});
		$("#btn1box").attr("title", "");
	  });
	$("#btn2").mouseover(function(){
		if ($("#btn2box").attr("title") == "") {
           $("#btn2box").animate({top: "+=610px"});
		   $("#panel2").slideDown();
		   $("#btn2box").attr("title", "open");
		}
    });
	$("#btn2").click(function(){
		$("#panel2").slideUp();
		$("#btn2box").animate({top: "-=610px"});
		$("#btn2box").attr("title", "");
	  });
	$("#btn3").mouseover(function(){
		if ($("#btn3box").attr("title") == "") {
           $("#btn3box").animate({top: "+=610px"});
		   $("#panel3").slideDown();
		   $("#btn3box").attr("title", "open");
		}
    });
	$("#btn3").click(function(){
		$("#panel3").slideUp();
		$("#btn3box").animate({top: "-=610px"});
		$("#btn3box").attr("title", "");
	  });
	
	start(50);		
	//makeSlider1("Alignment:",function(v){theBoids.params.align = v}, {value:.1, min:0, max:1, step:.05});
	//makeSlider1("Avoid:",function(v){theBoids.params.avoid = v}, {value:6, min:1, max:10, step:.5});
	makeSlider1("Separation Distance:",function(v){theBoids.params.distance = v}, {value:75, min:50, max:150, step:1});
	makeSlider1("Separation Force:",function(v){theBoids.params.separation_force = v}, {value:.01, min:0, max:.05, step:.001});
	makeSlider1("Cohesion Distance:",function(v){theBoids.params.cohesion = v}, {value:200, min:100, max:500, step:5});
	makeSlider1("Cohesion Force:",function(v){theBoids.params.cohesion_force = v}, {value:.01, min:0, max:.05, step:.001});
	makeSlider1("Alignment Force:",function(v){theBoids.params.alignment_force = v}, {value:.2, min:0, max:.5, step:.001});
	makeSlider2("Velocity:",function(v){theBoids.params.vel = v}, {value:2, min:0, max:10, step:.1});
	makeSlider1("Away From/Toward Force:",function(v){theBoids.params.toward_force = v}, {value:0, min:-.4, max:.4, step:.02});
	makeSlider1("Free Will Force:",function(v){theBoids.params.freewill_force = v}, {value:0.1, min:0, max:.2, step:.001});
	makeSlider2("Radius:",function(v){theBoids.params.radius = v}, {value:3, min:.5, max:10, step:.5});
	
	$("select").change(function() {
    $( "select option:selected" ).each(function() {
	   for (var i=0; i<32; i++) {
	   	   if ($(this).text() == BoidType[i].character) {
		   	  selectedIndex = i;
			  }
	   }
    });
    $("#boids_box").text(BoidType[selectedIndex].num).css("background-color", BoidType[selectedIndex].color);
  })
  .trigger( "change" );
});

function stopButtonCB()
{
	if (running) {
		running = 0;
		$("#stopbutton").html("start");
	} else {
		running = 1;
		$("#stopbutton").html("stop");
		reqFrame(animLoop,theCanvas);
	}
}

function debugButtonCB()
{
	if (debug) {
		debug = 0;
		$("#debugbutton").html("Debug On");
	} else {
		debug = 1;
		$("#debugbutton").html("Debug Off");
	}
}


function createButtonCB()
{
 	var btnum = $("#btnum").val();
	var p = theBoids.params;
	var diam = 2*p.radius;
	for (i=0; i<btnum; i++) {
		var X = p.radius + (p.width -diam)  * Math.random();
		var Y = p.radius + (p.height-diam)  * Math.random();
		NewBoid(theBoids,X,Y);
	}
}

function edgeButtonCB()
{
	if (EdgeMode) {
		EdgeMode = 0;
		$("#edgebutton").html("Cross Edge");
	} else {
		EdgeMode = 1;
		$("#edgebutton").html("Bounce");
	}
}

//        		<div class="inset">
//        			<span class="numlabel">Radius:</span>
//        			<input type="number" id="radval" class="numinput"/>
//        			<div id="radslider" class="slidermarg"></div>
//        		</div>

function makeSlider1(label,slidefun,slideparams)
{
	if (typeof(label)=="undefined")      label="nolabel";
	if (typeof(slideparams)=="undefined") slideparams={};

	if (typeof(slideparams.value)=="undefined") slideparams.value=5;
	
	var outer = $("<div />").addClass("inset").appendTo("#controls");
	$("<span \>").text(label+":").addClass("numlabel").appendTo(outer);
	var inp = $("<input \>").addClass("numinput").attr('type','number').appendTo(outer);
	var sdi = $("<div \>").addClass("slidermarg").appendTo(outer);
	sdi.slider(slideparams).bind("slide",
								 function( event, ui ) {
									inp.val( ui.value );
									slidefun(ui.value)
									} );
	inp.val(slideparams.value);
	slidefun(slideparams.value);
}
function makeSlider2(label,slidefun,slideparams)
{
	if (typeof(label)=="undefined")      label="nolabel";
	if (typeof(slideparams)=="undefined") slideparams={};

	if (typeof(slideparams.value)=="undefined") slideparams.value=5;
	
	var outer = $("<div />").addClass("inset").appendTo("#controls1");
	$("<span \>").text(label+":").addClass("numlabel").appendTo(outer);
	var inp = $("<input \>").addClass("numinput").attr('type','number').appendTo(outer);
	var sdi = $("<div \>").addClass("slidermarg").appendTo(outer);
	sdi.slider(slideparams).bind("slide",
								 function( event, ui ) {
									inp.val( ui.value );
									slidefun(ui.value)
									} );
	inp.val(slideparams.value);
	slidefun(slideparams.value);
}

function print_param(i,label,value)
{
		 var id = "#p" + i;
		 $(id).text(label + value);
}
