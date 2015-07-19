"use strict";

/**
 * Stick
 * @author Léo Chéron
 * @param anchorA
 * @param anchorB
 * @param length
 * @param rigidity
 * @constructor
 */
var Stick = module.exports = function (anchorA, anchorB, length, rigidity)
{
	this.anchorA = anchorA;
	this.anchorB = anchorB;
	this.rigidity = rigidity ? rigidity : 0.5;

	this.setLength(length);
};

/**
 * Set the stick length
 * @param length
 */
Stick.prototype.setLength = function (length)
{
	if (length)
		this._length = length;
	else
	{
		var dx = this.anchorA.x - this.anchorB.x;
		var dy = this.anchorA.y - this.anchorB.y;
		this._length = Math.sqrt(dx * dx + dy * dy);
	}
};

Stick.prototype.setPosition = function (ax, ay, bx, by)
{
	this.anchorA.x = ax;
	this.anchorA.y = ay;
	this.anchorB.x = bx;
	this.anchorB.y = by;
};

Stick.prototype.update = function ()
{
	var dx = this.anchorB.x - this.anchorA.x;
	var dy = this.anchorB.y - this.anchorA.y;
	var d = Math.sqrt(dx * dx + dy * dy);
	if (d)
	{
		var diff = this._length - d;
		var offsetx = (diff * dx / d) * this.rigidity;
		var offsety = (diff * dy / d) * this.rigidity;
		this.anchorA.x -= offsetx;
		this.anchorA.y -= offsety;
		this.anchorB.x += offsetx;
		this.anchorB.y += offsety;
	}
};

/**
 * Render the stick
 * Please use context.beginPath() and context.stroke() in your drawing function
 * @param ctx
 */
Stick.prototype.draw = function (ctx)
{
	//ctx.fillStyle = color;
	//ctx.fillRect(this.anchorA.x - 1, this.anchorA.y - 1, 2, 2);
	ctx.moveTo(this.anchorA.x, this.anchorA.y);
	ctx.lineTo(this.anchorB.x, this.anchorB.y);
};