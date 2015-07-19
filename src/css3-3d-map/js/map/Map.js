"use strict";

var Css = require("lib/anonymous/Utils/Css");
var PreloadJs = require("lib/preloadjs/preloadjs-0.6.1.min");
var Stage = require("lib/anonymous/core/Stage");
var MouseEvent = require("lib/anonymous/events/MouseEvent");
var Easing = require("lib/zepto/Easing");

/**
 * @author Leo Cheron
 * @constructor
 */
var Map = module.exports = function ()
{
	this.$dom = $("#map");

	this.MIN_ZOOM = 100;
	this.MAX_ZOOM = 300;

	this._$assetLoader = $(".preloader");

	if($.os.android)
		this._low = true;

	this._load();
};

Map.prototype._load = function()
{
	this._$assetLoader.animate({opacity: 1}, 300, Easing.outQuad);

	this.loader = new createjs.LoadQueue(true);
	var data = [];
	for (var i = 0; i < 25; i++)
	{
		var n = i < 10 ? "0" + i : i;
		if(i == 0)
			data.push({id: "map" + i, src: "img/map/" + n + ".jpg"});
		else
			data.push({id: "map" + i, src: "img/map/" + n + ".png"});
	}
	this.loader.loadManifest(data);
	this.loader.addEventListener("complete", $.proxy(this._onComplete, this));
	this.loader.load();
};

Map.prototype._onComplete = function()
{
	this._$assetLoader.animate({opacity: 0, visibility: "hidden"}, 600, Easing.outQuart);

	this.loaded = true;

	this._init();
};

Map.prototype._init = function()
{
	this._scene = $(".scene");
	this._map = this.$dom.find(".wrapper");
	this._sceneWrapper = this.$dom.find(".scene-wrapper");

	var ul = $(document.createElement("ul"));

	for (var i = 0; i < 25; i++) 
	{
		var li = $("<li></li>");
		li.addClass("n" + i);
		li.append(this.loader.getResult("map" + i));
		ul.append(li);
	}

	this._map.append(ul);
	this._layers = this.$dom.find("li");

	Stage.$window
		.on(MouseEvent.MOVE, $.proxy(this._onMove, this))
		.on(MouseEvent.WHEEL, $.proxy(this._onMouseWheel, this));

	if(MouseEvent.touch && window.DeviceOrientationEvent != undefined && !$.os.android)
		Stage.$window.on("deviceorientation", $.proxy(this._onDeviceOrientation, this));

	this.init();

	Css.transform(this._scene[0], "translate3d(110px, 30px, 10px) rotateX(-310deg) rotateZ(-292deg)");

	this.show();
};

Map.prototype.init = function() 
{
	this._rotateX = 0;
	this._rotateY = 0;

	this._tx = 0;
	this._ty = 0;
	this._tz = 10;
	this._targetTz = 10;

	this._mx = Stage.width * 0.5;
	this._my = Stage.height * 0.5;

	// gyroscope
	this._alpha = 0;
	this._beta = 0;
	this._gamma = 0;
};

Map.prototype.update = function(now)
{
	if(this._shown && !this.lock && !this._low)
	{
		var zRatio = this._tz / this.MAX_ZOOM;
		if(!zRatio) zRatio = 0.001;
		zRatio = 0.2;

		var destx = (Stage.width * 0.5 - this._mx) * zRatio * 0.5 + 100;
		var desty = (Stage.height * 0.5 - this._my) * zRatio * 0.2 + 50;

		var destRx = (Stage.height * 0.5 - this._my) * 0.02 - this._gamma * 0.5;
		var destRy = (Stage.width * 0.5 - this._mx) * 0.03 + this._beta;

		if(now)
		{
			this._tx = destx;
			this._ty = desty;
			this._tz = this._targetTz;

			this._rotateX = destRx;
			this._rotateY = destRy;
		}
		else
		{
			this._tx += (destx - this._tx) * 0.01 / zRatio;
			this._ty += (desty - this._ty) * 0.01 / zRatio;
			this._tz += (this._targetTz - this._tz) * 0.08;

			this._rotateX += (destRx - this._rotateX) * 0.04;
			this._rotateY += (destRy - this._rotateY) * 0.04;
		}

		this.rx = MouseEvent.touch ? -this._rotateX + 320 : this._rotateX - 40;
		this.ry = MouseEvent.touch ? -this._rotateY + 290 : this._rotateY - 70;

		//var sign = /*TOUCH ? 1 :*/ -1;

		if(this.rx < 0) this.rx = 360 + this.rx;
		if(this.ry < 0) this.ry = 360 + this.ry;

		// apply transformation to dom element
		Css.transform(this._scene[0], "translate3d(" + this._tx + "px, " + this._ty + "px, " + this._tz + "px) rotateX(" + (-this.rx) + "deg) rotateZ(" + (-this.ry) + "deg)");
	}
};

Map.prototype.resize = function()
{
	if(this.loaded)
	{
		this._mapx = ((Stage.width - 1280 >> 1) - 100);
		this._mapy = ((Stage.height - 1280 >> 1) + 100);

		Css.transform(this._map[0], "translate3d(" + this._mapx + "px, " + this._mapy + "px, 0)");
	}
};

Map.prototype.show = function() 
{
	var that = this;
	this._shown = this.shown = true;

	this.resize();

	if(that._hiddenTimeout) clearTimeout(that._hiddenTimeout);
	if(this._showTimeout) clearTimeout(this._showTimeout);
	this._showTimeout = setTimeout(function() 
	{
		// main dom translation
		//this.$dom.animate({translate3d: "0,0,0"}, 1600, "cubic-bezier(0.190, 1.000, 0.220, 1.000)");

		// layers animation
		var delay = 0;
		var dyDest = 3;
		that._layers.each(function(index, item)
		{
			var dyInit = 0.1;
			
			Css.transform($(this)[0], "translate3d(0, 0, " + (index * dyInit) + "px)");
			
			var d = delay + index * 200;
			$(item).animate({translate3d: "0, 0, " + (index * dyDest) + "px"}, 1800, "0.190, 1.000, 0.220, 1.000");

			dyDest += 0.08;
		});

		setTimeout(function()
		{
			that._sceneWrapper.animate({translate3d: "0,0,0", opacity: 1}, 3000, "cubic-bezier(0.190, 1.000, 0.220, 1.000)");
		}, 20);
	}, 300);

	this.update(true);
};

Map.prototype.hide = function()
{
	this.shown = false;

	var self = this;

	// layers animation
	var delay = 0;
	var dyDest = 3;
	this._layers.each(function(index, item)
	{		
		var d = delay + index * 200;
		$(item).animate({translate3d: "0, 0, " + index + "px"}, 1800, "0.190, 1.000, 0.220, 1.000", null);
		//dyDest += 0.08;
	});
	this._sceneWrapper.animate({translate3d: "0," + 300 + "px,0", opacity: 0}, 1000, "cubic-bezier(0.770, 0.000, 0.175, 1.000)");

	this._targetTz = 10;

	if(this._hiddenTimeout) clearTimeout(this._hiddenTimeout);
	this._hiddenTimeout = setTimeout(function()
	{
		self._shown = false;
		self.dom.css("display", "none");
	}, 1500);
};

Map.prototype.playTransition = function() 
{
	this._rotateX = MouseEvent.touch ? -70 : 70;
	this._tz = 1000;
};

//-----------------------------------------------------------------o Handlers

Map.prototype._onMove = function(e) 
{
	e.preventDefault();

	if(MouseEvent.touch)
	{
		Css.touchEvent(e);

		this._mx = e.targetTouches[0].pageX;
		this._my = e.targetTouches[0].pageY;
	}
	else
	{
		this._mx = e.pageX;
		this._my = e.pageY;
	}
};

Map.prototype._onMouseWheel = function(e) 
{
	var direction = (e.detail < 0) ? 1 : (e.wheelDelta > 0) ? 1 : -1;
	var delta = 30;
	this._targetTz += direction * delta;
	if(this._targetTz < this.MIN_ZOOM) this._targetTz = this.MIN_ZOOM;
	else if(this._targetTz > this.MAX_ZOOM) this._targetTz = this.MAX_ZOOM;

	e.preventDefault();
};

Map.prototype._onDeviceOrientation = function(e)
{
	if(this._shown)
	{
		this._alpha = event.alpha;
		this._beta = event.beta;
		this._gamma = event.gamma < -55 ? -55 : event.gamma;
	}
};