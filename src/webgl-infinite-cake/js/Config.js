"use strict";

var Config = module.exports = function() {};

Config.FREE_CAM = false;
Config.GENERATOR = false;

/** 
 *	0 All effects & post processing
 *	1 Remove post processing
 *	2 Remove shadows
 *	3 Simplify floor shader
 *	4 ?
 **/
Config.LEVEL = 2;