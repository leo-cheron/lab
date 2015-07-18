"use strict";

/**
 * @author Leo Cheron
 * @constructor
 * Manage Css animations
 */
var Css = module.exports = function() 
{
};

Css.vendors = { Webkit: 'webkit', Moz: 'moz', O: 'o' };
Css.prefix = "";

Css.init = function()
{
	Css.setPrefix();
};

Css.setPrefix = function()
{
	var dummy = document.createElement('div');
	if(dummy.style.transitionProperty !== undefined)
		Css.prefix = "";
	else
	{
		for (var vendor in Css.vendors) 
		{
			if (dummy.style[vendor + 'TransitionProperty'] !== undefined) 
			{
				Css.prefix = '-' + vendor.toLowerCase() + '-';
				return false;
			}
		}
	}
	dummy = null;
};

Css.transform = function(dom, transform)
{
	if(dom) 
	{
		dom.style.transform = transform;
		dom.style.webkitTransform = transform;
		dom.style.mozTransform = transform;
	}
};

Css.transformOrigin = function(dom, origin)
{
	if(dom) 
	{
		dom.style.transformOrigin = origin;
		dom.style.webkitTransformOrigin = origin;
		dom.style.mozTransformOrigin = origin;
	}
};

Css.transition = function(dom, transition)
{
	if(dom) 
	{
		dom.style.transition = transition;
		dom.style.webkitTransition = transition;
		dom.style.mozTransition = transition;
	}
};

Css.getMatrix = function(element) 
{
	var computedStyle = window.getComputedStyle(element, null); // "null" means this is not a pesudo style.
	var matrix = 	computedStyle.getPropertyValue('transform') ||
					computedStyle.getPropertyValue('-webkit-transform') || 
					computedStyle.getPropertyValue('-moz-transform') || 
					computedStyle.getPropertyValue('-ms-transform') || 
					computedStyle.getPropertyValue('-o-transform');
	var matrixPattern = /^\w*\((((\d+)|(\d*\.\d+)),\s*)*((\d+)|(\d*\.\d+))\)/i;
	var matrixValue = [];
	if (matrixPattern.test(matrix)) 
	{
		var matrixCopy = matrix.replace(/^\w*\(/, '').replace(')', '');
		matrixValue = matrixCopy.split(/\s*,\s*/);
	}
	return matrixValue;
};