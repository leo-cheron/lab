import AModule from "modules/AModule";

import SceneModel from "scene/SceneModel";
import SceneController from "scene/SceneController";
import Scene from "scene/Scene";
import Stage from "lib/anonymous/core/Stage";

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

		if(!this._scene)
			this._initScene();

		this._scene.locked = false;
		this._scene.playIntro();
	}

	/**
	 * Drawing on requestAnimationFrame
	 */
	update()
	{
		super.update();

		if(this._scene)
		{
			this._scene.update();
			// this._scene.meshManager.updateFlames(this.step.pointer, this._gameController ? this._gameController.power : 0);
		}
	}

	/**
	 * Triggered on window resize
	 */
	_onResize()
	{
		super._onResize();

		if(this._scene)
			this._scene.resize();
	}

	//-----------------------------------------------------o 3D scene

	_initScene()
	{
		this._sceneModel = new SceneModel();
		this._scene = new Scene(this._sceneModel);
		this._scene
			.on("error", this._onSceneError.bind(this))
			.on("progress", this._onSceneProgress.bind(this))
			.on("complete", this._onSceneComplete.bind(this));
		this._scene.init();

		this._sceneController = new SceneController(this._sceneModel, this._scene);
	}

	_onSceneError()
	{
		// error
	}

	_onSceneProgress(percent)
	{
		console.log("loading...", percent);
	}

	_onSceneComplete()
	{
		this._scene.off();

		this._scene.locked = false;
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

		window.requestAnimationFrame(tick);
	})();
});
