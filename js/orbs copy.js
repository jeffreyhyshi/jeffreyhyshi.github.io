/** Script to display bouncy orbs.
 *  The orbs, they are good.
 * 
 */

/**
 *  Global variables
 */
var ORB_RADIUS = 30;
var ORB_DIAM = ORB_RADIUS*2;
var TOP_CIRCLE_CENTER = new Point(200, 200);
var EPSILON = 1;
var RESTITUTION = 0.01;
var MAGIC = 10;

var allOrbs = {};

var numLoaded = 0;

Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

/**
 *  Our lil orb objects
 */
function Orb(newShape) {
	this.orbShape = newShape;

	this.clickDragVelocity = new Point(0, 0);
	this.velocity = new Point(0, 0);
	this.angularVelocity = 0;

	this.forces = [];

	this.collisionTest = function(otherOrb) {
		var diffVector = otherOrb.orbShape.position - this.orbShape.position;
		if (diffVector.length < ORB_DIAM - EPSILON) {
			this.orbShape.position -= diffVector.normalize() * (EPSILON / 2);
			otherOrb.orbShape.position += diffVector.normalize() * (EPSILON / 2);
			return diffVector.normalize();
		} else {
			return null;
		}
	};

	this.resolveCollision = function(otherOrb, collisionNormal) {
		var thisVelocity = this.velocity;
		var otherVelocity = otherOrb.velocity;
		var thisLock = false;
		var otherLock = false;

		if (this.clickDragVelocity.length > 0) {
			thisVelocity = this.clickDragVelocity;
			thisLock = true;
		} else if (otherOrb.clickDragVelocity.length > 0) {
			otherVelocity = otherOrb.clickDragVelocity;
			otherLock = true;
		}

		// Angular velocity calculations
		var signAxis = new Point(collisionNormal.y, -1 * collisionNormal.x);
		var vNorm = thisVelocity.normalize();
		var angularImpulseVelocity = 0.05 * 
			Math.sqrt(Math.acos(thisVelocity.normalize().dot(collisionNormal)) + 
			 Math.acos(otherVelocity.normalize().dot(signAxis)));
			
		this.angularVelocity -= Math.sign(vNorm.dot(signAxis)) * angularImpulseVelocity;

		signAxis = signAxis * -1;

		otherOrb.angularVelocity -= Math.sign(vNorm.dot(signAxis)) * angularImpulseVelocity;

		// Linear velocity calculations
		var relVelocity = otherVelocity - thisVelocity;
		var collisionNormVelocity = relVelocity.dot(collisionNormal);

		if (collisionNormVelocity > 0) {
			return;
		}

		var impulseVelocity = collisionNormal * 
			(-1 * (1 + RESTITUTION) * collisionNormVelocity);

		if (!thisLock) { this.velocity -= impulseVelocity; }
		if  (!otherLock) { otherOrb.velocity += impulseVelocity; }
	};

	this.animateFrame = function() {
		this.orbShape.position += this.velocity;
		this.orbShape.rotation += this.angularVelocity;

		this.velocity *= 0.99;
		this.angularVelocity *= 0.99;
	};
}

function initializeOrbCallback(item, svg, letter) {
	allOrbs[letter] = new Orb(item);
	item.fitBounds(0, 0, ORB_DIAM, ORB_DIAM);
	item.onMouseEnter = function(event) {
		$("#orbCanvas").addClass("draggable");
	}
	item.onMouseDrag = function(event) {
		allOrbs[letter].velocity = new Point(0, 0);
		item.position += event.delta;
		allOrbs[letter].clickDragVelocity = event.delta;
	}
	item.onMouseUp = function(event) {
		allOrbs[letter].velocity = allOrbs[letter].clickDragVelocity * 0.9;
		allOrbs[letter].clickDragVelocity = new Point(0, 0);
	}
	item.onMouseLeave = function(event) {
		$("#orbCanvas").removeClass("draggable");
	}
	numLoaded += 1;
	if (numLoaded == MAGIC) {
		layout(TOP_CIRCLE_CENTER, [['j', 'e1', 'f1', 'f2', 'r', 'e2', 'y'],
					 ['s', 'h', 'i']]);
	}
}

function layout(topCenter, arr) {
	//Arrange orbs according to array that's been passed in
	console.log(allOrbs.j.orbShape.bounds);
	var lastPoint = null;
	for (var row = 0; row < arr.length; row++) {
		for (var col = 0; col < arr[row].length; col++) {
			var key = arr[row][col];
			if (key in allOrbs) {
				lastPoint = new Point(topCenter.x + ORB_DIAM * col, 
												  topCenter.y + ORB_DIAM * row);
				allOrbs[key].orbShape.position = lastPoint;
			}
		}
	}

	//Adjust intro textbox location
	$('.intro').offset({top: lastPoint.y - ORB_RADIUS, left: lastPoint.x + 1.1*ORB_RADIUS});

	//Fade out cover div
	$('.cover').fadeOut();
}

function startInitializeOrbs() {
	var proj = paper.project;

	proj.importSVG('images/j.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'j') });
	proj.importSVG('images/e.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'e1') });
	proj.importSVG('images/f.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'f1') });
	proj.importSVG('images/f.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'f2') });
	proj.importSVG('images/r.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'r') });
	proj.importSVG('images/e.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'e2') });
	proj.importSVG('images/y.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'y') });
	proj.importSVG('images/s.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 's') });
	proj.importSVG('images/h.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'h') });
	proj.importSVG('images/i.svg', function(i, s) 
		{ initializeOrbCallback(i, s, 'i') });
}



/**
 *  Paper.js onFrame animation loop
 */
function onFrame(event) {
	if (numLoaded == MAGIC) {
		for (var orbName in allOrbs) {
		    if (allOrbs.hasOwnProperty(orbName)) {
		    	for (var otherOrbName in allOrbs) {
				    if (allOrbs.hasOwnProperty(otherOrbName)) {
				    	var res = allOrbs[orbName].collisionTest(allOrbs[otherOrbName]);
				    	if (res) {
				    		allOrbs[orbName].resolveCollision(allOrbs[otherOrbName], 
				    											res);
				    		allOrbs[orbName].animateFrame();
				    		allOrbs[otherOrbName].animateFrame();
				    	}
				    } 
			  	}
		    } 
	  	}
	 }
}

startInitializeOrbs();