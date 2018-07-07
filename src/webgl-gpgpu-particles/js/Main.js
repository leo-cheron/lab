import Particles from "./particles/Particles";
import Webcam from "lib/anonymous/components/webcam/Webcam";
import AModule from "modules/AModule";


/**
 * Main
 * @constructor
 */
export default class Main extends AModule
{
	constructor()
	{
		super();
	
		this.init();
	}

	init()
	{
		super.init(this);
		
		// 
		this._content = $("#particles");

		// particles
		this._particles = new Particles(this._content[0]);

		// webcam
		this._webcam = new Webcam(
			{
				dom: document.querySelector(".source__video"),
				video: true,
				audio: false
			});
		this._webcam.$.on("success", this._onWebcamSuccess.bind(this));
	}

	/**
	 * Drawing on requestAnimationFrame
	 */
	update()
	{
		this._particles.update();

		super.update();
	}

	/**
	 * Triggered on window resize
	 */
	_onResize()
	{
		super._onResize(this);

		this._particles.resize();
	}

	//-----------------------------------------------------o webcam handlers

	_onWebcamSuccess()
	{
		this._particles.setTexture(this._webcam.dom, true);
	}
}

/**
 * Let's roll
 */
const onDomContentLoaded = function() 
{
	document.removeEventListener("DOMContentLoaded", onDomContentLoaded);

	const main = new Main();

	(function tick()
	{
		main.update();
		window.requestAnimationFrame(tick);
	})();
};
document.addEventListener("DOMContentLoaded", onDomContentLoaded);