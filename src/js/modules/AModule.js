"use strict";

var $ = require("lib/zepto/zepto");
var RequestAnimationFrame = require("lib/anonymous/utils/RequestAnimationFrame");
var Stats = require("lib/stats/Stats");
var Stage = require("lib/anonymous/core/Stage");


/**
 * AModule abstract class
 * @constructor
 */
var AModule = module.exports = function()
{
	Stage.$window.on("resize", $.proxy(this._onResize, this));
};

AModule.prototype = 
{
	init: function()
	{
		this._displayCredits();

		// stats
		this._stats = new Stats();
		document.body.appendChild(this._stats.domElement);
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
			console.log("%cCheers!", "color: #A89E8F; font-size: 17px");
			console.log("");
		}
	},
};