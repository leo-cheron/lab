"use strict";

var AModule = require("modules/AModule");
var Map = require("map/Map");


/**
 * Main
 * @constructor
 */
var Main = function()
{
	AModule.apply(this);

	this.init();
};

Main.prototype = $.extend({}, AModule.prototype,
{
	init: function()
	{
		AModule.prototype.init.call(this);
		
		this._map = new Map();
	},

	update: function()
	{
		this._map.update();

		AModule.prototype.update.call(this);
	},

	_onResize: function()
	{
		AModule.prototype._onResize.call(this);
		
		this._map.resize();
	},
});

/**
 * Let's roll
 */
Stage.$document.ready(function()
{
	var main = new Main();

	(function tick()
	{
		main.update();
		window.requestAnimationFrame(tick);
	})();
});