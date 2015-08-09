"use strict";

var AppModel = require("./AppModel");
var AppController = require("./AppController");
var Delaunay = require("delaunay/Delaunay");
var Stage = require("lib/anonymous/core/Stage");

/**
 * @constructor
 */
var App = module.exports = function(dom) 
{
	this._model = new AppModel();
	this._controller = new AppController(this._model);
	this._dom = dom;
	
	var self = this;
	
	this.mx = this.omx = 0;
	this.my = this.omy = 0;
	this.buildCanvas();
		
	this.resize();
}

App.prototype.isCanvasSupported = function ()
{
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

App.prototype.buildCanvas = function ()
{
	var self = this;
	
	this.canvas = document.createElement("canvas");
	$(this.canvas).attr({"id": "canvas"});
	this._dom.append(this.canvas);
	
	$(document).mousemove(function(e)
	{
		var offset = $(self.canvas).offset();
		
		self.mx = e.pageX - offset.left;
		self.my = e.pageY - offset.top;
	});
	
	this._ctx = this.canvas.getContext('2d');
}

App.prototype.resize = function ()
{
	if(!this.canvas) return;

	if(this._model.QUALITY > 1)
		this._dom.css({"max-width": "600px", "max-height": "500px"});
	
	var mw = this._dom.css("max-width").replace("px", "") | 0;
	var mh = this._dom.css("max-height").replace("px", "") | 0;
			
	this._model.width = mw;
	this._model.height = mh;
	
	this.canvas.width = this._model.width;
	this.canvas.height = this._model.height;
	
	mh = ((Stage.height - mh) * 0.5 | 0) + 1;
	mw = ((Stage.width - mw) * 0.5 | 0) + 1;
	$(this._dom).css({'margin-top': mh, 'margin-left': mw});
	
	this._controller.setVerticesDensity();
}

App.prototype.render = function ()
{
	var c = this._ctx;
	if( c )
	{	
		var vertices = this._model.vertices;
		var triangles = Delaunay.triangulate(vertices);
		
		var width = this._model.width;
		var height = this._model.height;
		
		c.clearRect( 0, 0, width, height );
		
		var i;
		for( i in triangles )
		{
			var triangle = triangles[i];
			
			c.beginPath();
			c.moveTo( triangle.v0.x, triangle.v0.y );
			c.lineTo( triangle.v1.x, triangle.v1.y );
			c.lineTo( triangle.v2.x, triangle.v2.y );
			c.closePath();
			
			/*c.strokeStyle = "#ff0000";
			c.stroke();*/

			var grad = c.createLinearGradient( triangle.v0.x, triangle.v0.y, triangle.v1.x, triangle.v1.y )
			grad.addColorStop(0, this._model.gradientColor1);
			grad.addColorStop(1, this._model.gradientColor2);
			c.fillStyle = grad;
			c.fill();
			
			// Display circumcircles
			/*c.beginPath();
			c.arc( triangle.center.x, triangle.center.y, triangle.radius, 0, Math.PI*2, true );
			c.closePath();
			c.strokeStyle= "#808080";
			c.stroke();*/
		}
		var vertex = vertices[0];
		while(vertex)
		{			
			this.applyForces(vertex);		
			
			vertex.speed += (1 - vertex.speed) * 0.08;
			
			vertex.spring += (0.015 - vertex.spring) * 0.03;
			vertex.vd.x += (vertex.v.x * vertex.speed - vertex.vd.x) * vertex.spring;
			vertex.vd.y += (vertex.v.y * vertex.speed - vertex.vd.y) * vertex.spring;
			
			/*var friction = 0.9;
			vertex.vd.x *= friction;
			vertex.vd.y *= friction;*/
			this.checkBoundingBox(vertex);
			
			vertex.x += vertex.vd.x;
			vertex.y += vertex.vd.y;			
			
			/*c.beginPath();
			c.arc( vertex.x, vertex.y, 1, 0, Math.PI * 2, true );
			c.closePath();
			c.fillStyle = "#000";
			c.fill();*/
			
			vertex = vertex.next;
		}
		
		this.omx = this.mx;
		this.omy = this.my;	
	}
}

App.prototype.calculateDistance = function(v1, v2)
{
	var x = v1.x - v2.x;
	var y = v1.y - v2.y;
	var d = Math.sqrt((x * x) + (y * y));
	if(!d) d = 0.0001;
	return d;
}
	
App.prototype.checkCollisions = function(v)
{
	var width = this._model.width;
	var height = this._model.height;
	var margin = 0;
	if (v.x > width + margin)
		v.x = -margin;
	else if (v.x < margin) 
		v.x = width + margin;
	
	if (v.y > height + margin)
		v.y = -margin;
	else if (v.y < -margin) 
		v.y = height + margin;
}

App.prototype.checkBoundingBox = function(v)
{
	var width = this._model.width;
	var height = this._model.height;
	var strengh = 50;
	var mw = -40;
	var mh = -40;
	
	if (v.x > width + mw)
		v.v.x -= strengh;
	else if (v.x < -mw) 
		v.v.x += strengh;
	
	if (v.y > height + mh)
		v.v.y -= strengh;
	else if (v.y < -mh) 
		v.v.y += strengh;
}
	
App.prototype.addForce = function(v, force)
{		
	v.v.x += force.x;
	v.v.y += force.y;
	
	var magnitude = this.calculateDistance({
		x: 0,
		y: 0
	}, {
		x: v.v.x,
		y: v.v.y
	});
	
	if(magnitude)
	{
		v.v.x /= magnitude;
		v.v.y /= magnitude;
	}
}

/**
 * Good old flocking behavior
 **/
App.prototype.applyForces = function(v)
{
	var percievedCenter = 
	{
		x: 0,
		y: 0
	};
	var flockCenter = 
	{
		x: 0,
		y: 0
	};
	var percievedVelocity = 
	{
		x: 0,
		y: 0
	};
	
	var count = 0;
	var vertex = this._model.vertices[0];
	while(vertex)
	{
		if (vertex != v) 
		{
			//Alignment
			var dist = this.calculateDistance(v, vertex);
			
			if (dist > 0 && dist < 50) 
			{
				count++;
				
				//Alignment
				percievedCenter.x += vertex.x;
				percievedCenter.y += vertex.y;
				
				//Cohesion
				percievedVelocity.x += vertex.v.x;
				percievedVelocity.y += vertex.v.y;
				
				//Separation
				if (this.calculateDistance(vertex, v) < 100) 
				{
					flockCenter.x -= (vertex.x - v.x);
					flockCenter.y -= (vertex.y - v.y);
				}				
			}
		}
		
		vertex = vertex.next;
	}
	
	if (count) 
	{
		percievedCenter.x = percievedCenter.x / count;
		percievedCenter.y = percievedCenter.y / count;
		
		percievedCenter.x = (percievedCenter.x - v.x) / 400;
		percievedCenter.y = (percievedCenter.y - v.y) / 400;
		
		percievedVelocity.x = percievedVelocity.x / count;
		percievedVelocity.y = percievedVelocity.y / count;
		
		flockCenter.x /= count;
		flockCenter.y /= count;
	}		
	
	this.addForce(v, percievedCenter);
	this.addForce(v, percievedVelocity);		
	this.addForce(v, flockCenter);
	
	//Predator
	var m = {x: this.mx, y: this.my};
	var d;
	var margin = 150;
	if(this.mx > margin && this.mx < this._model.width - margin && this.my > margin && this.my < this._model.height - margin && (d = this.calculateDistance(v, m)) < 70 )
	{
		var predatorStrength = 10 / d;
		v.v.x -= predatorStrength * (this.mx - v.x);
		v.v.y -= predatorStrength * (this.my - v.y);	
	}
}    
