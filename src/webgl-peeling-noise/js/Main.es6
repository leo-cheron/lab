import AModule from "modules/AModule";
import TweenLite from "lib/tweenLite/TweenLite";
import EasePack from "lib/tweenLite/easing/EasePack";

import Config from "./Config";

import SceneModel from "./scene/SceneModel";
import SceneController from "./scene/SceneController";
import Scene from "./scene/Scene";

import MeshCarousel from "./MeshCarousel";

export default class Main extends AModule
{
	constructor()
	{
		super();

		this.init();

		this._onResize();
	}

	init()
	{
		super.init();

		this._sceneModel = new SceneModel();
		this._scene = new Scene(this._sceneModel);
		
		this._meshCarousel = new MeshCarousel(this._scene);

		this._sceneController = new SceneController(this._sceneModel, this._meshCarousel, this._scene);
	}

	/**
	 * Drawing on requestAnimationFrame
	 */
	update()
	{
		super.update();

		this._meshCarousel.update();

		this._scene.update();
	}

	/**
	 * Triggered on window resize
	 */
	_onResize()
	{
		super._onResize();

		this._scene.resize();
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
		main.update();

		if(!Config.RENDER_ONCE)
			window.requestAnimationFrame(tick);
	})();
});
