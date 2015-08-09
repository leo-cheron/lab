"use strict";

var DelaunayVertex = require("./DelaunayVertex");

/**
 * Triangle object
 * @param {delaunay.Vertex} v0
 * @param {delaunay.Vertex} v1
 * @param {delaunay.Vertex} v2
 * @constructor
 */
var DelaunayTriangle = module.exports = function (v0, v1, v2)
{	
	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;

	this.CalcCircumcircle();
}

DelaunayTriangle.EPSILON = 1.0e-6;

DelaunayTriangle.prototype.CalcCircumcircle = function()
{
	// From: http://www.exaflop.org/docs/cgafaq/cga1.html

	var A = this.v1.x - this.v0.x;
	var B = this.v1.y - this.v0.y;
	var C = this.v2.x - this.v0.x;
	var D = this.v2.y - this.v0.y;

	var E = A * (this.v0.x + this.v1.x) + B * (this.v0.y + this.v1.y);
	var F = C * (this.v0.x + this.v2.x) + D * (this.v0.y + this.v2.y);

	var G = 2.0 * (A * (this.v2.y - this.v1.y) - B * (this.v2.x - this.v1.x));

	var dx, dy;

	if(Math.abs(G) < DelaunayTriangle.EPSILON)
	{
		// Collinear - find extremes and use the midpoint

		function max3(a, b, c)
		{
			return (a >= b && a >= c ) ? a : (b >= a && b >= c ) ? b : c;
		}

		function min3(a, b, c)
		{
			return (a <= b && a <= c ) ? a : (b <= a && b <= c ) ? b : c;
		}

		var minx = min3(this.v0.x, this.v1.x, this.v2.x);
		var miny = min3(this.v0.y, this.v1.y, this.v2.y);
		var maxx = max3(this.v0.x, this.v1.x, this.v2.x);
		var maxy = max3(this.v0.y, this.v1.y, this.v2.y);

		this.center = new DelaunayVertex((minx + maxx ) / 2, (miny + maxy ) / 2, null);
		dx = this.center.x - minx;
		dy = this.center.y - miny;
	}
	else
	{
		var cx = (D * E - B * F) / G;
		var cy = (A * F - C * E) / G;

		this.center = new DelaunayVertex(cx, cy, null);
		dx = this.center.x - this.v0.x;
		dy = this.center.y - this.v0.y;
	}
	
	this.radius_squared = dx * dx + dy * dy;
	this.radius = Math.sqrt(this.radius_squared);
};
// CalcCircumcircle

DelaunayTriangle.prototype.InCircumcircle = function(v)
{
	var dx = this.center.x - v.x;
	var dy = this.center.y - v.y;
	var dist_squared = dx * dx + dy * dy;
	return (dist_squared <= this.radius_squared );
};