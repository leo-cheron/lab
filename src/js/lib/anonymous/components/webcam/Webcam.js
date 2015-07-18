"use strict";

/**
 * Webcam
 * @constructor
 */
var Webcam = module.exports = function(params)
{
	this.$ = $(this);
	$.extend(this, params);

	this.init();
};

Webcam.prototype =
{
	init: function()
	{
		navigator.getUserMedia = 	navigator.getUserMedia ||
									navigator.webkitGetUserMedia ||
									navigator.mozGetUserMedia ||
									navigator.msGetUserMedia;

		if (navigator.getUserMedia) 
		{
			navigator.getUserMedia({audio: this.audio, video: this.video}, $.proxy(this._success, this), $.proxy(this._error, this));
		} 
		else 
		{
			this._error();
		}
	},

	destroy: function()
	{
	},

	//-----------------------------------------------------o private

	_success: function(stream)
	{
		this.dom.src = window.URL.createObjectURL(stream);
		$(this.dom).on("loadedmetadata", $.proxy(this._onLoadedmetadata, this))

		// console.log("Webcam", $(this.dom).width());

	},

	_onLoadedmetadata: function()
	{
		this.dom.width = this.dom.videoWidth;
		this.dom.height = this.dom.videoHeight;
		
		this.$.trigger("success");
	},

	_error: function()
	{
		this.$.trigger("error");
		// TODO play fallback video
	}
};