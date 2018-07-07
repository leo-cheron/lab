import $ from "lib/zepto/zepto";
import RequestAnimationFrame from "lib/anonymous/utils/RequestAnimationFrame";
import Stats from "lib/stats/Stats";
import Stage from "lib/anonymous/core/Stage";
import Easing from "lib/zepto/Easing";


/**
 * AModule abstract class
 * @constructor
 */
export default class AModule
{
	constructor()
	{

	}

	init()
	{
		this._displayCredits();

		$(".link--sources").animate({opacity: 1}, 500, Easing.outQuad, null, 500);

		// stats
		this._stats = new Stats();
		document.body.appendChild(this._stats.domElement);

		// resize
		Stage.$window.on("resize", $.proxy(this._onResize, this));
		Stage.resize();
	}

	/**
	 * Drawing on requestAnimationFrame
	 */
	update()
	{
		this._stats.update();
	}

	/**
	 * Triggered on window resize
	 */
	_onResize()
	{
		Stage.resize();
	}

	_displayCredits()
	{
		if($.browser.webkit)
		{
			console.log("%cʕʘᴥʘʔ︎", "color: #A89E8F; font-size: 54px; font-family: courier new; line-height: 50px;");
			console.log("");
		}
	}
};