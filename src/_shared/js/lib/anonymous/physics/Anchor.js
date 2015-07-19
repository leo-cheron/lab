"use strict";

/**
 * @author Léo Chéron
 * @constructor
 */
var Anchor = module.exports = function (x, y, friction)
{
	this.setPosition(x, y);

	this.linkedSticks = [];

	this.vx = this.vy = 0;

	this.f = friction ? friction : 0.9;
}

/**
 * Draw the anchor to a given canvas
 * @param ctx
 * @param color
 * @param width
 * @param height
 */
Anchor.prototype.draw = function (ctx, color, width, height)
{
	ctx.fillStyle = color;
	ctx.fillRect(this.x - width * 0.5, this.y - height * 0.5, width, height);
};

/**
 * @param x
 * @param y
 */
Anchor.prototype.setPosition = function (x, y)
{
	this.x = this._ox = this.initx = x;
	this.y = this._oy = this.inity = y;
	this.z = 0;
};

/**
 * Move the point to a given position
 * @param x
 * @param y
 * @param ease
 * @param update
 */
Anchor.prototype.move = function (x, y, ease, update)
{
	this._destx = x;
	this.x += (this._destx - this.x) * ease;
	this.vx = this.x - this._ox;

	this._desty = y;
	this.y += (this._desty - this.y) * ease;
	this.vy = this.y - this._oy;

	if (update)
		this.update();
	else
	{
		this._ox = this.x;
		this._oy = this.y;
	}
};

/**
 * Update velocity
 */
Anchor.prototype.update = function ()
{
	var tx = this.x;
	var ty = this.y;

	this.x += (this.vx *= this.f);
	this.y += (this.vy *= this.f);

	this._ox = tx;
	this._oy = ty;
};

/**
 * Repulse the point from a given position
 */
Anchor.prototype.repulse = function (x, y, strength, dmax)
{
	if (!strength)
		strength = 1;

	if (!dmax)
		dmax = 50;

	var dx = x - this.x;
	var dy = y - this.y;
	var dm = Math.sqrt(dx * dx + dy * dy);
	if (!dm) dm = 0.000001;

	var dx2 = x - this._destx;
	var dy2 = y - this._desty;
	var dm2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
	if (!dm2) dm2 = 0.000001;

	var ratio = 0;
	if (dm2 < dmax)
		ratio = dmax / dm;

	this.x -= ratio * strength * dx / dm;
	this.y -= ratio * strength * dy / dm;
};

/**
 * Clone the current anchor
 * @return {Anchor}
 */
Anchor.prototype.clone = function ()
{
	return new Anchor(this.x, this.y, this.f);
};

/**
 * Copy parameters from another anchor
 * @param anchor
 */
Anchor.prototype.copyFrom = function (anchor)
{
	this.x = anchor.x;
	this.y = anchor.y;
	this.f = anchor.f;
};