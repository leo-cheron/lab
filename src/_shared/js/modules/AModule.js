"use strict";

var $ = require("lib/zepto/zepto");
var RequestAnimationFrame = require("lib/anonymous/utils/RequestAnimationFrame");
var Stats = require("lib/stats/Stats");
var Stage = require("lib/anonymous/core/Stage");
var Easing = require("lib/zepto/Easing");


/**
 * AModule abstract class
 * @constructor
 */
var AModule = module.exports = function() {};

AModule.prototype = 
{
	init: function()
	{
		this._displayCredits();

		$(".link--sources").animate({opacity: 1}, 500, Easing.outQuad, null, 500);

		// stats
		this._stats = new Stats();
		document.body.appendChild(this._stats.domElement);

		// resize
		Stage.$window.on("resize", $.proxy(this._onResize, this));
		Stage.resize();
	},

	/**
	 * Drawing on requestAnimationFrame
	 */
	update: function()
	{
		this._stats.update();
	},

	/**
	 * Triggered on window resize
	 */
	_onResize: function()
	{
		Stage.resize();
	},

	_displayCredits: function()
	{
		if($.browser.webkit)
		{
			console.log("%cʕʘᴥʘʔ︎", "color: #A89E8F; font-size: 54px; font-family: courier new; line-height: 50px;");
			console.log("");
		}
	},
};