import GUI from "lib/dat/dat.gui";
import THREE from "lib/three/three";

/**
 * SceneController
 * @constructor
 */
export default class SceneController
{
	constructor(model, view)
	{
		this.$ = $(this);

		this.model = model;
		this.view = view;

		this.init();
	}

	init()
	{
		var callback = this._onChange.bind(this);

		this._gui = new GUI();
		// this._gui.close();

		var stream = this._gui.addFolder("Air stream");
		stream.add(this.model, 'streamVx', -1.0, 1.0).step(0.0001).onChange(callback);
		stream.add(this.model, 'streamVy', 0.0, 2.0).step(0.0001).onChange(callback);
		stream.add(this.model, 'power', 0.2, 1.2).step(0.0001).onChange(callback);
		stream.open();

		var noise = this._gui.addFolder("Noise");
		noise.add(this.model, 'noiseScale', 0., 10.).step(0.0001).onChange(callback);
		noise.add(this.model, 'displayNoise').onChange(callback);
		noise.open();
	}

	//-----------------------------------------------------o handlers

	_onChange()
	{
		for (var uniform in this.view.mesh.material.uniforms) 
		{
			if(this.model[uniform] !== undefined)
				this.view.mesh.material.uniforms[uniform].value = this.model[uniform];
		}

		if(this.model.displayNoise)
			this.view.mesh.material.transparent = false;
		else
			this.view.mesh.material.transparent = true;
	}
}