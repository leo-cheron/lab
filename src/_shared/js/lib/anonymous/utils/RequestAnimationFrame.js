"use strict";

/**
 * Add prefix to requestAnimationFrame function
 * @constructor
 */
var RequestAnimationFrame = module.exports = (function() 
{
	window.requestAnimationFrame = (function()
	{
		return  window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback)
				{
					window.setTimeout(callback, 1000 / 60);
				};
	})();
})();