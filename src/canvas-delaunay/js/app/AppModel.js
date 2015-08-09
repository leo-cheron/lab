"use strict";

var AppModel = module.exports = function( data ) 
{	
	this._data = data || {};
	
	this.width = 0;
	this.height = 0;
	
	this.gradientColor1 = "#F9FBF7";
	this.gradientColor2 = "#E4EBEC";
	
	if ((navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1))
		this.QUALITY = 2;
	else if(navigator.userAgent.indexOf('iPhone') != -1)
		this.QUALITY = 3;
	else
		this.QUALITY = 1;	
	
	this.verticesNumber;

	this.speedx = -1;
	this.speedy = 0;	

	this.vertices = [];
}
