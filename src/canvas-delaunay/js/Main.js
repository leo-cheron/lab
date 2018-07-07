import AModule from "modules/AModule";
import App from "./app/App";


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
		
		this._app = new App($("#delaunay"));
	}

	update()
	{
		super.update();

		this._app.render();
	}

	_onResize()
	{
		super._onResize();

		this._app.resize();
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