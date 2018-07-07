import AModule from "modules/AModule";
import Map from "map/Map";


/**
 * Main
 * @constructor
 */
class Main extends AModule
{
	constructor()
	{
		super();

		this.init();
	}

	init()
	{
		super.init();
		
		this._map = new Map();
	}

	update()
	{
		this._map.update();

		super.update();
	}

	_onResize()
	{
		super._onResize();
		
		this._map.resize();
	}
};

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