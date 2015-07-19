"use strict";

/**
 * Add window.location.origin support for ie < 10
 * @constructor
 */
var Location = module.exports = (function() 
{
	if (!window.location.origin)
		window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
})();