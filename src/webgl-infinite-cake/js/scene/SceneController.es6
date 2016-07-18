import GUI from "lib/dat/dat.gui";
import THREE from "lib/three/three";

/**
 * Controller
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

		// this._gui.remember(this);

		var movement = this._gui.addFolder("Movement");
		movement.add(this.model, 'zSpeed', 0, 50).step(0.0001).onChange(callback);
		movement.open();

		var scene = this._gui.addFolder("Scene");
		scene.addColor(this.model, 'topColor').onChange(callback);
		scene.add(this.model, 'skyOffset', -1000, 1000).step(1).onChange(callback);
		scene.add(this.model, 'skyExponent', 0, 1.0).step(0.0001).onChange(callback);
		scene.addColor(this.model, 'fogColor').onChange(callback);
		scene.add(this.model, 'fogNear', 0, 10000).step(1).onChange(callback);
		scene.add(this.model, 'fogFar', 0, 20000).step(1).onChange(callback);
		// scene.open();

		// var camera = this._gui.addFolder("Camera");
		// camera.add(this.model, 'debugCamera');

		var lights = this._gui.addFolder("Lights");
		lights.addColor(this.model, 'lightColor').onChange(callback);
		lights.add(this.model, 'lightStrength', 0, 2).step(0.001).onChange(callback);
		lights.addColor(this.model, 'hemiLightColorSky').onChange(callback);
		lights.addColor(this.model, 'hemiLightColorFloor').onChange(callback);
		lights.add(this.model, 'hemiLightStrength', 0, 2).step(0.001).onChange(callback);
		// lights.add(this.model, 'spotIntensity', 0, 1).step(0.001).onChange(callback);
		// lights.open();

		var floor = this._gui.addFolder("Floor");
		floor.addColor(this.model, 'fresnelColor').onChange(callback);
		floor.addColor(this.model, 'fresnelColor2').onChange(callback);

		floor.add(this.model, 'fresnelColorBias', 0.0, 1.0).step(0.001).onChange(callback);
		floor.add(this.model, 'fresnelColorScale', 0, 100).step(0.001).onChange(callback);
		floor.add(this.model, 'fresnelColorPower', 0, 20).step(0.001).onChange(callback);

		floor.add(this.model, 'fresnelBias', 0, 1).step(0.001).onChange(callback);
		floor.add(this.model, 'fresnelScale', 0, 100).step(0.001).onChange(callback);
		floor.add(this.model, 'fresnelPower', 0, 20).step(0.001).onChange(callback);
		floor.add(this.model, 'fresnelReflectionPower', 0, 1).step(0.0001).onChange(callback);
		// floor.add(this.model, 'reflectivity', 0, 1).step(0.001).onChange(callback);
		// floor.addColor(this.model, 'specular').onChange(callback);
		// floor.add(this.model, 'fresnelRefractionRatio', 0, 1.1).step(0.0001).onChange(callback);
		// floor.open();

		// var strawberries = this._gui.addFolder("Strawberries");
		// // strawberries.addColor(this.model, 'strawberryFresnelColor').onChange(callback);
		// // strawberries.add(this.model, 'strawberryFresnelBias', 0, 1).step(0.001).onChange(callback);
		// // strawberries.add(this.model, 'strawberryFresnelScale', 0, 10).step(0.001).onChange(callback);
		// // strawberries.add(this.model, 'strawberryFresnelPower', 0, 20).step(0.001).onChange(callback);
		// strawberries.add(this.model, 'strawberryBumpMapScale', 0, 10).step(0.001).onChange(callback);
		// strawberries.add(this.model, 'strawberryShininess', 1, 100).step(0.001).onChange(callback);
		// strawberries.add(this.model, 'strawberryReflectivity', 0, 1).step(0.001).onChange(callback);
		// strawberries.addColor(this.model, 'strawberrySpecular').onChange(callback);
		// // strawberries.open();

		// var meringues = this._gui.addFolder("Meringues");
		// meringues.addColor(this.model, 'meringueColor').onChange(callback);
		// // meringues.add(this.model, 'meringueFresnelBias', 0, 1).step(0.001).onChange(callback);
		// // meringues.add(this.model, 'meringueFresnelScale', 0, 10).step(0.001).onChange(callback);
		// // meringues.add(this.model, 'meringueFresnelPower', 0, 20).step(0.001).onChange(callback);
		// // meringues.add(this.model, 'meringueBumpMapScale', 0, 10).step(0.001).onChange(callback);
		// // meringues.add(this.model, 'meringueShininess', 1, 100).step(0.001).onChange(callback);
		// meringues.add(this.model, 'meringueReflectivity', 0, 1).step(0.001).onChange(callback);
		// meringues.addColor(this.model, 'meringueSpecular').onChange(callback);

		var utils = this._gui.addFolder("Utils");
		utils.add(this.view.meshManager, 'generateGrid');
		// utils.open();

		var postprocessing = this._gui.addFolder("Post processing");
		postprocessing.add(this.model, 'postProcessing');
		postprocessing.add(this.model, 'noiseIntensity', 0.0, 1.0).step(0.0001).onChange(callback);
		// postprocessing.add(this.model, 'focus', 0.0, 2.0).step(0.0001).onChange(callback);
		// postprocessing.add(this.model, 'aperture', 0.0, 0.2).step(0.00001).onChange(callback);
		// postprocessing.add(this.model, 'maxblur', 0, 3).step(0.0001).onChange(callback);
		// postprocessing.add(this.model, 'bloom', 0.0, 1.0).step(0.0001).onChange(callback);
		// postprocessing.add(this.model, 'bleach', 0.0, 1.0).step(0.0001).onChange(callback);
		// postprocessing.add(this.model, 'vignetteOffset', 0.0, 2.0).step(0.001).onChange(callback);
		// postprocessing.add(this.model, 'vignetteDarkness', 0.0, 2.0).step(0.001).onChange(callback);
		postprocessing.open();
	}

	//-----------------------------------------------------o handlers

	_onChange()
	{
		if(this.model.fog)
			this.view.scene.fog = new THREE.Fog(this.model.fogColor, this.model.fogNear, this.model.fogFar);

		var skyUniform = this.view.meshManager.skyUniforms;
		skyUniform.topColor.value = new THREE.Color(this.model.topColor);
		skyUniform.bottomColor.value = new THREE.Color(this.model.fogColor);
		skyUniform.offset.value = parseFloat(this.model.skyOffset);
		skyUniform.exponent.value = parseFloat(this.model.skyExponent);

		this.view.directionalLight.color.setHex(this.model.lightColor);
		this.view.directionalLight.intensity = parseFloat(this.model.lightStrength);
		this.view.hemisphereLight.color.setHex(this.model.hemiLightColorSky);
		this.view.hemisphereLight.groundColor.setHex(this.model.hemiLightColorFloor);
		this.view.hemisphereLight.intensity = parseFloat(this.model.hemiLightStrength);
		// this.view.directionalLight.intensity = this.model.spotIntensity;

		// this.view.meshManager._factory.fresnelUniforms.uFresnelBias.value = parseFloat(this.model.fresnelBias);
		// this.view.meshManager._factory.fresnelUniforms.uFresnelScale.value = parseFloat(this.model.fresnelScale);
		// this.view.meshManager._factory.fresnelUniforms.uFresnelPower.value = parseFloat(this.model.fresnelPower);
		// this.view.meshManager._factory.fresnelUniforms.uRefractionRatio.value = parseFloat(this.model.fresnelRefractionRatio);
		// this.view.meshManager._factory.fresnelUniforms.uColor.value = new THREE.Color(this.model.fresnelColor);
		// this.view.meshManager._factory.fresnelUniforms.uColor2.value = new THREE.Color(this.model.fresnelColor2);
		
		// floor
		var floorUniform = this.view.meshManager._factory.floorShader ? this.view.meshManager._factory.floorShader.uniforms : this.view.meshManager._factory.floorMaterial;
		if(floorUniform.uFresnelBias) floorUniform.uFresnelBias.value = parseFloat(this.model.fresnelBias);
		if(floorUniform.uFresnelScale) floorUniform.uFresnelScale.value = parseFloat(this.model.fresnelScale);
		if(floorUniform.uFresnelPower) floorUniform.uFresnelPower.value = parseFloat(this.model.fresnelPower);
		if(floorUniform.uReflectionPower) floorUniform.uReflectionPower.value = parseFloat(this.model.fresnelReflectionPower);
		
		if(floorUniform.uColor1) floorUniform.uColor1.value = new THREE.Color(this.model.fresnelColor);
		if(floorUniform.uColor2) floorUniform.uColor2.value = new THREE.Color(this.model.fresnelColor2);
		if(floorUniform.uFresnelColorBias) floorUniform.uFresnelColorBias.value = parseFloat(this.model.fresnelColorBias);
		if(floorUniform.uFresnelColorScale) floorUniform.uFresnelColorScale.value = parseFloat(this.model.fresnelColorScale);
		if(floorUniform.uFresnelColorPower) floorUniform.uFresnelColorPower.value = parseFloat(this.model.fresnelColorPower);

		// floorUniform.reflectivity.value = parseFloat(this.model.reflectivity);
		// floorUniform.specular.value = new THREE.Color(this.model.specular);

		// strawberry
		var strawberryUniform = this.view.meshManager._factory.strawberryMaterial;
		if(strawberryUniform)
		{
			// strawberryUniform.uFresnelBias.value = parseFloat(this.model.strawberryFresnelBias);
			// strawberryUniform.uFresnelScale.value = parseFloat(this.model.strawberryFresnelScale);
			// strawberryUniform.uFresnelPower.value = parseFloat(this.model.strawberryFresnelPower);
			// strawberryUniform.uColor.value = new THREE.Color(this.model.strawberryFresnelColor);
			strawberryUniform.bumpScale = parseFloat(this.model.strawberryBumpMapScale);
			strawberryUniform.shininess = parseFloat(this.model.strawberryShininess);
			strawberryUniform.reflectivity = parseFloat(this.model.strawberryReflectivity);
			strawberryUniform.specular = new THREE.Color(this.model.strawberrySpecular);		
		}

		// // meringue
		var meringueUniform = this.view.meshManager._factory.meringueMaterial;
		if(meringueUniform)
		{
			// meringueUniform.uFresnelBias.value = parseFloat(this.model.meringueFresnelBias);
			// meringueUniform.uFresnelScale.value = parseFloat(this.model.meringueFresnelScale);
			// meringueUniform.uFresnelPower.value = parseFloat(this.model.meringueFresnelPower);
			meringueUniform.color = new THREE.Color(this.model.meringueColor);
			// meringueUniform.bumpScale.value = parseFloat(this.model.meringueBumpMapScale);
			// meringueUniform.shininess = parseFloat(this.model.meringueShininess);
			meringueUniform.reflectivity = parseFloat(this.model.meringueReflectivity);
			// meringueUniform.specular = new THREE.Color(this.model.meringueSpecular);
		}
		
		this.view.renderer.setClearColor( this.model.fogColor, 1 );

		// post processing
		this.view.effectNoise.uniforms.nIntensity.value = this.model.noiseIntensity;

		// this.view.effectBloom.copyUniforms[ "opacity" ].value = this.model.bloom;
		// this.view.effectBleach.uniforms[ "opacity" ].value = this.model.bleach;

		// this.view.effectVignette.uniforms[ "offset" ].value = this.model.vignetteOffset;
		// this.view.effectVignette.uniforms[ "darkness" ].value = this.model.vignetteDarkness;
	}

	show1()
	{
		this.view.meshManager.show();
	}

	show2()
	{
		this.view.meshManager.showLod();
	}
}