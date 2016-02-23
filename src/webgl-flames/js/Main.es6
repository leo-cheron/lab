import AModule from "modules/AModule";
import Flames from "./Flames";
import FlamesModel from "./FlamesModel";
import FlamesController from "./FlamesController";

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

		var model = new FlamesModel();
		this._flames = new Flames(model);
		var controller = new FlamesController(model, this._flames);
	}

	tick()
	{
		super.update();

		this._flames.tick();
	}

	_onResize()
	{
		super._onResize();
		
		this._flames.resize();
	}
}

/**
 * Let's roll
 */
Stage.$document.ready(function()
{
	var main = new Main();

	(function tick()
	{
		main.tick();
		window.requestAnimationFrame(tick);
	})();
});