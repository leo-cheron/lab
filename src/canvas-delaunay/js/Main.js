"use strict";

var AModule = require("modules/AModule");
var App = require("./app/App");


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
		
		this._app = new App($("#delaunay"));
	},

	/**
	 * Drawing on requestAnimationFrame
	 */
	update: function()
	{
		AModule.prototype.update.call(this);

		this._app.render();
	},

	/**
	 * Triggered on window resize
	 */
	_onResize: function()
	{
		AModule.prototype._onResize.call(this);

		this._app.resize();
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