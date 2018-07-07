/**
 * Webcam
 * @constructor
 */
export default class Webcam
{
	constructor(params)
	{
		this.$ = $(this);
		this.params = params;

		this.init();
	}

	init()
	{
		navigator.getUserMedia = 	navigator.getUserMedia ||
									navigator.webkitGetUserMedia ||
									navigator.mozGetUserMedia ||
									navigator.msGetUserMedia;

		if (navigator.getUserMedia) 
		{
			navigator.getUserMedia({audio: this.params.audio, video: this.params.video}, this._success.bind(this), this._error.bind(this));
		} 
		else 
		{
			this._error();
		}
	}

	destroy()
	{
	}

	//-----------------------------------------------------o private

	_success(stream)
	{
		this.dom.src = window.URL.createObjectURL(stream);
		$(this.dom).on("loadedmetadata", $.proxy(this._onLoadedmetadata, this))
	}

	_onLoadedmetadata()
	{
		this.dom.width = this.dom.videoWidth;
		this.dom.height = this.dom.videoHeight;
		
		this.$.trigger("success");
	}

	_error(err)
	{
		this.$.trigger("error");
		// TODO play fallback video
	}
}