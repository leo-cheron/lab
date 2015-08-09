"use strict";

var DelaunayVertex = require("delaunay/DelaunayVertex");


var AppController = module.exports = function(model)
{
	this._model = model;	
}

AppController.prototype.updateVertices = function()
{
	var n = this._model.verticesNumber;
	var delta = n - this._model.vertices.length;
	var i = 0;
	if(delta > 0) // add vertices
	{
		var prevVertex = this._model.vertices.length ? this._model.vertices[this._model.vertices.length - 1] : null;
		for( i = 0; i < delta; ++i)
		{			
			var maxspeed = 20;
			
			var vertex = new DelaunayVertex(this._model.width * 0.5, this._model.height * 0.5 + 20, Math.random() * 50);
			vertex.v.x = Math.random() * maxspeed - Math.random() * maxspeed;
			vertex.v.y = Math.random() * maxspeed - Math.random() * maxspeed;
			vertex.spring = 0.6 + Math.random() * 0.2;
			this._model.vertices.push(vertex);

			if(prevVertex) prevVertex.next = vertex;
			prevVertex = vertex;
		}
	}
	else // remove vertices
	{
		for( i = 0; i < -delta; ++i)
		{
			this._model.vertices.shift();
		}
	}
	
	this.updateCornersPosition();
}

AppController.prototype.updateCornersPosition = function()
{
	/*this._model.vertices[0].setPosition(-1, -1);
	this._model.vertices[1].setPosition(this._model.width + 1, -1);
	this._model.vertices[2].setPosition(this._model.width + 1, this._model.height + 1);
	this._model.vertices[3].setPosition(-1, this._model.height + 1);*/
}

AppController.prototype.setVerticesDensity = function()
{
	var density = this._model.QUALITY == 3 ? 0.000024 : 0.000045;
	
	var surface = this._model.width * this._model.height;
	var density = surface * density | 0;
	
	this._model.verticesNumber = density;
	this.updateVertices();
}

AppController.prototype.clear = function()
{
	this._model.vertices = [];
}