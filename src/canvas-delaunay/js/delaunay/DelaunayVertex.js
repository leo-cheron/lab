"use strict";

/**
 * Vertex
 * @param {number} x
 * @param {number} y
 * @constructor
 */
var DelaunayVertex = module.exports = function (x, y, speed)
{	
	this.x = 0;
	this.y = 0;	
	
	this.v = {x: 0, y: 0};
	this.vd = {x: 0, y: 0};
	
	this.speed = speed ? speed : 3;
	
	this.spring = 1;
	
	this._ox;
	this._oy;
	
	this._initx;
	this._inity; 
	
	this._destx;
	this._desty;
	
	this.setPosition(x, y);	
}

DelaunayVertex.prototype.setPosition = function(x, y)
{
	this.x = this._ox = this._initx = x;
	this.y = this._oy = this._inity = y;
}