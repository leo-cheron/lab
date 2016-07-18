import GUI from "lib/dat/dat.gui";
import THREE from "lib/three/three";

/**
 * Controller
 * @constructor
 */
export default class SceneController
{
	constructor(model, view, scene)
	{
		this.$ = $(this);

		this.model = model;
		this.view = view;
		this.scene = scene;

		this.init();
	}

	init()
	{
		var callback = this._onChange.bind(this);

		this._gui = new GUI();
		// this._gui.close();

		// this._gui.remember(this);
		// var test = this._gui.addFolder("Just playing");
		// test.add(this.model, 'noiseScale', 0.0001, 4).step(0.000001).onChange(callback);
		// test.add(this.model, 'noiseTranslationX', 0, 1).step(0.000001).onChange(callback);
		// test.add(this.model, 'noiseTranslationY', 0, 1).step(0.000001).onChange(callback);
		// test.add(this.model, 'noiseThresholding', 0, 1).step(0.000001).onChange(callback);
		// test.add(this.model, 'noiseStrength', 0, 2).step(0.000001).onChange(callback);
		// test.add(this.model, 'noiseInverted').onChange(callback);

		var animation = this._gui.addFolder("Animation");
		// animation.add(this.model, 'timeline', 0, 1).step(0.000001).onChange(callback);
		animation.add(this.model, 'fromNoiseScale', 0.0001, 4).step(0.000001).onChange(callback);
		animation.add(this.model, 'toNoiseScale', 0.0001, 4).step(0.000001).onChange(callback);
		
		animation.add(this.model, 'fromNoiseTranslationX', 0, 1).step(0.000001).onChange(callback);
		animation.add(this.model, 'toNoiseTranslationX', 0, 1).step(0.000001).onChange(callback);
		
		animation.add(this.model, 'fromNoiseTranslationY', 0, 1).step(0.000001).onChange(callback);
		animation.add(this.model, 'toNoiseTranslationY', 0, 1).step(0.000001).onChange(callback);
		
		animation.add(this.model, 'fromNoiseThresholding', 0, 1).step(0.000001).onChange(callback);
		animation.add(this.model, 'toNoiseThresholding', 0, 1).step(0.000001).onChange(callback);
		
		animation.add(this.model, 'fromNoiseStrength', 0, 2).step(0.000001).onChange(callback);
		animation.add(this.model, 'toNoiseStrength', 0, 1).step(0.000001).onChange(callback);
		
		animation.add(this.model, 'duration', 0, 6).step(0.0001).onChange(callback);

		animation.add(this.view, 'prev');
		animation.add(this.view, 'next');
		animation.add(this, 'show');
		animation.add(this, 'hide');
		// animation.add(this.model, 'facesMinRadius', 0, 1).step(0.0001).onChange(callback);
		// animation.add(this.model, 'facesMaxRadius', 0, 1).step(0.0001).onChange(callback);
		animation.open();

		var scene = this._gui.addFolder("Scene");
		scene.addColor(this.model, 'backgroundColor').onChange(callback);
		// scene.add(this.model, 'fogNear', 0, 6000).step(1).onChange(callback);
		// scene.add(this.model, 'fogFar', 0, 10000).step(1).onChange(callback);
		// scene.open();

		var lights = this._gui.addFolder("Lights");
		lights.addColor(this.model, 'ambiantLight').onChange(callback);
		lights.add(this.model, 'spotIntensity', 0, 2).step(0.001).onChange(callback);
		// lights.add(this.model, 'shadowNear', 0, 5000).step(0.1).onChange(callback);
		// lights.add(this.model, 'shadowFar', 0, 5000).step(0.1).onChange(callback);
		// lights.add(this.model, 'shadowBias', -0.1, 0.1).step(0.001).onChange(callback);
		// lights.open();

		var mesh = this._gui.addFolder("Mesh");
		mesh.addColor(this.model, 'meshColor').onChange(callback);
		mesh.addColor(this.model, 'meshSpecular').onChange(callback);
		mesh.addColor(this.model, 'wireframeColor').onChange(callback);
		mesh.add(this.model, 'wireframeLineWidth', 1, 2).step(0.001).onChange(callback);
		mesh.add(this.model, 'wireframeOpacity', 0, 1).step(0.0001).onChange(callback);
		// mesh.addColor(this.model, 'pointColor').onChange(callback);
		// mesh.add(this.model, 'pointSize', 0, 30).step(0.1).onChange(callback);
		// mesh.open();

		// var cursor = this._gui.addFolder("Cursor");
		// cursor.add(this.model, 'mouseInteraction');
		// cursor.add(this.model, 'mouseRadius').step(1);
		// cursor.open();

		setTimeout(() => {
			// this._onChange();
			
		}, 200);
	}

	//-----------------------------------------------------o handlers

	_onChange()
	{
		this.view.animatedMesh.lod = this.model.lod;
		this.view.animatedMesh.twist = this.model.twist;
		this.view.animatedMesh.randomize = this.model.randomize;
		this.view.animatedMesh.facesMinRadius = this.model.facesMinRadius;
		this.view.animatedMesh.facesMaxRadius = this.model.facesMaxRadius;
		this.view.animatedMesh.updateWireframe(this.model.wireframeColor, this.model.wireframeOpacity, this.model.wireframeLineWidth);
		this.view.animatedMesh.timeline = this.model.timeline;

		// main
		// this.view.animatedMesh.mesh.material.uniforms.noiseScale.value = this.model.noiseScale;
		// this.view.animatedMesh.mesh.material.uniforms.noiseTranslation.value.x = this.model.noiseTranslationX; 
		// this.view.animatedMesh.mesh.material.uniforms.noiseTranslation.value.y = this.model.noiseTranslationY; 
		// this.view.animatedMesh.mesh.material.uniforms.noiseThresholding.value = this.model.noiseThresholding;
		// this.view.animatedMesh.mesh.material.uniforms.noiseStrength.value = this.model.noiseStrength;

		// // wireframe
		// this.view.animatedMesh.mesh.wireframe.material.uniforms.noiseScale.value = this.model.noiseScale;
		// this.view.animatedMesh.mesh.wireframe.material.uniforms.noiseTranslation.value.x = this.model.noiseTranslationX; 
		// this.view.animatedMesh.mesh.wireframe.material.uniforms.noiseTranslation.value.y = this.model.noiseTranslationY; 
		// this.view.animatedMesh.mesh.wireframe.material.uniforms.noiseThresholding.value = this.model.noiseThresholding;
		// this.view.animatedMesh.mesh.wireframe.material.uniforms.noiseStrength.value = this.model.noiseStrength;

		// this.view.animatedMesh.mesh.material.uniforms.noiseInverted.value = this.model.noiseInverted ? 1 : 0;
		// this.view.animatedMesh.mesh.wireframe.material.uniforms.noiseInverted.value = this.model.noiseInverted ? 1 : 0;

		// this.view.animatedMesh.mesh.wireframe.material.uniforms = this.view.animatedMesh.mesh.material.uniforms;

		if(this.view.animatedMesh._points)
		{
			this.view.animatedMesh._points.material.uniforms.uColor.value = new THREE.Color(this.model.pointColor);
			this.view.animatedMesh._points.material.uniforms.uSize.value = this.model.pointSize;
		}

		// material
		this.view.animatedMesh.mesh.material.uniforms.diffuse.value.setHex(this.model.meshColor);
		this.view.animatedMesh.mesh.material.uniforms.specular.value.setHex(this.model.meshSpecular);

		if(this.scene.fog)
			this.scene.fog = new THREE.Fog(this.model.backgroundColor, this.model.fogNear, this.model.fogFar);
	
		if(this.scene.ambientLight)
			this.scene.ambientLight.color.setHex(this.model.ambiantLight);

		if(this.scene.directionalLight)
		{
			this.scene.directionalLight.intensity = this.model.spotIntensity;
			this.scene.directionalLight.shadow.camera.near = this.model.shadowNear;
			this.scene.directionalLight.shadow.camera.far = this.model.shadowFar;
			this.scene.directionalLight.shadow.camera.updateProjectionMatrix();
			this.scene.directionalLight.shadow.bias = this.model.shadowBias;
			if(this.scene.cameraHelper)
				this.scene.cameraHelper.update();
		}

		if(this.scene.light)
		{
			this.scene.light.intensity = this.model.spotIntensity;
		}

		this.scene.renderer.setClearColor(this.model.backgroundColor, 1);
	}

	show()
	{
		this.view.animatedMesh.show();
	}

	hide()
	{
		this.view.animatedMesh.hide();
	}
}
