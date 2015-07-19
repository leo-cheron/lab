"use strict";

var Config = require("./Config");
var Particles = require("./particles/Particles");
var Webcam = require("lib/anonymous/components/webcam/Webcam");
var AModule = require("modules/AModule");


/**
 * Main
 * @constructor
 */
var MainParticles = function()
{
	AModule.apply(this);

	$(window).on("resize", $.proxy(this._onResize, this));

	this.init();
};

MainParticles.prototype = $.extend({}, AModule.prototype,
{
	init: function()
	{
		AModule.prototype.init.call(this);
		
		// 
		this._content = $("#particles");

		// particles
		this._particles = new Particles(this._content[0]);

		// webcam
		this._webcam = new Webcam(
			{
				dom: document.querySelector(".source__video"),
				video: true,
				audio: false
			});
		this._webcam.$.on("success", $.proxy(this._onWebcamSuccess, this));
	},

	/**
	 * Drawing on requestAnimationFrame
	 */
	update: function()
	{
		this._particles.update();

		AModule.prototype.update.call(this);
	},

	/**
	 * Triggered on window resize
	 */
	_onResize: function()
	{
		AModule.prototype._onResize.call(this);

		this._particles.resize();
	},

	//-----------------------------------------------------o webcam handlers

	_onWebcamSuccess: function()
	{
		this._particles.setTexture(this._webcam.dom, true);
	}
});

/**
 * Let's roll
 */
Stage.$document.ready(function()
{
	var main = new MainParticles();

	(function tick()
	{
		main.update();
		window.requestAnimationFrame(tick);
	})();
});