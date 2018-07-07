import THREE from "lib/three/three";

import EffectComposer from "lib/three/postprocessing/EffectComposer";
import FilmShader from "lib/three/shaders/FilmShader";
import CopyShader from "lib/three/shaders/CopyShader";
import FXAAShader from "lib/three/shaders/FXAAShader";
import HorizontalTiltShiftShader from "lib/three/shaders/HorizontalTiltShiftShader";
import VerticalTiltShiftShader from "lib/three/shaders/VerticalTiltShiftShader";
import FilmPass from "lib/three/postprocessing/FilmPass";
import RenderPass from "lib/three/postprocessing/RenderPass";
import ShaderPass from "lib/three/postprocessing/ShaderPass";
// import ConvolutionShader from "lib/three/shaders/ConvolutionShader";
// import BleachBypassShader from "lib/three/shaders/BleachBypassShader";
// import VignetteShader from "lib/three/shaders/VignetteShader";
// import BokehShader from "lib/three/shaders/BokehShader";
// import MaskPass from "lib/three/postprocessing/MaskPass";
// import BokehPass from "lib/three/postprocessing/BokehPass";
// import BloomPass from "lib/three/postprocessing/BloomPass";

import PointerLockControls from "lib/three/controls/PointerLockControls";
// import OrbitControls from "lib/three/controls/OrbitControls";

import MeshManager from "./meshes/MeshManager";
import Stage from "lib/anonymous/core/Stage";
import MouseEvent from "lib/anonymous/events/MouseEvent";
import Emitter from "Emitter";
import Css from "lib/anonymous/utils/Css";
import TimelineLite from "lib/tweenLite/TimelineLite";


export default class Scene 
{
	constructor(model)
	{
		Emitter(this);

		this.model = model;
	}

	init()
	{
		this._mx = 0;
		this._my = 0;

		this.container = document.getElementById("container");
		this.container.style.opacity = 0;
		// this.container.className = "step--experience__canvas";

		this.scene = new THREE.Scene();
		if(this.model.fog)
			this.scene.fog = new THREE.Fog(this.model.fogColor, this.model.fogNear, this.model.fogFar);

		this.fpCamera = new THREE.PerspectiveCamera(40, Stage.width / Stage.height, 50, 4500);
		//this.debugCamera = this.fpCamera.clone();
		this.camera = /*this.model.debugCamera ? this.debugCamera : */this.fpCamera;

		// var cameraHelper = new THREE.CameraHelper(this.fpCamera);
		// this.scene.add(cameraHelper);

		this._initRenderer();

		// controls
		// var cameraControls = new THREE.OrbitControls(this.debugCamera, this.renderer.domElement);
		// cameraControls.target.set(0, 0, 0);
		// this.debugCamera.position.set(0, 1000, 4000);

		this.controls = new THREE.PointerLockControls(this.fpCamera);
		this.cameraContainer = this.controls.getObject();
		this.cameraContainer.position.set(0, this.model.cameraY + 500, 4000);
		this.scene.add(this.cameraContainer);

		// lights
		this._initLight();

		// meshes
		this.meshManager = new MeshManager(this);

		// post process
		this._initComposer();

		// Stage.$document.on("mousewheel.pointerLock", this.onMouseWheel.bind(this));

		// helpers
		
		// var axisHelper = new THREE.AxisHelper( 1000 );
		// this.scene.add(axisHelper);

		THREE.DefaultLoadingManager.onProgress = this._onProgress.bind(this);
		
		this.locked = true;
	}

	playIntro()
	{
		this.controls.rxinc = 0.6;
		TweenLite.to(this.cameraContainer.position, 5, {y: this.model.cameraY, ease: Quad.easeInOut});
		TweenLite.to(this.controls, 6, {rxinc: 0.2, ease: Quad.easeInOut});

		var speed = this.model.zSpeed;
		var animation = new TimelineLite();
		animation.to(this.model, 3, {zSpeed: speed * 2, ease: Quad.easeIn}).to(this.model, 4, {zSpeed: speed, ease: Quad.easeOut});
	}

	destroy()
	{
		this._destroyed = true;

		if(this._completeTimeout)
		{
			clearTimeout(this._completeTimeout);
			this._completeTimeout = null;
		}
		
		this.off();
		this.controls.dispose();

		this.scene = null;
		this.renderer = null;
		this.composer = null;

		this.fpCamera = null;

		this.debugCamera = null;
		this.camera = null;
		this.controls = null;
		this.cameraContainer = null;

		this.meshManager.off();
		this.meshManager.gameController = null;

		// THREE.DefaultLoadingManager.onProgress = null;
	}

	//-----------------------------------------------------o mouse events

	// onMouseWheel(e)
	// {
	// 	if(!this._wheel) this._wheel = 0;

	// 	if(e.wheelDelta > 0)
	// 		this._wheel -= 20;
	// 	else
	// 		this._wheel += 20;

	// 	if(this._wheel < 0) this._wheel = 0;

	// 	TweenLite.to(this.camera.position, 0.5, {ease: Quart.easeOut, y: this._wheel});
	// }

	//-----------------------------------------------------o Loading 

	_onProgress(item, loaded, total)
	{
		if(!this._destroyed)
		{
			this.emit("progress", loaded / total);

			if(loaded === total)
			{
				this._completeTimeout = setTimeout(() => 
				{
					this.meshManager.init();
					this.locked = false;
					this.resize();
					this.update();
					this.locked = true;

					$(this.container).animate({opacity: 1}, 2000, Easing.linear);

					this.emit("complete");
				}, 1000);
			}
		}
	};

	//-----------------------------------------------------o Lights

	_initLight() 
	{
		this.directionalLight = new THREE.DirectionalLight( this.model.lightColor, this.model.lightStrength );
		// this.directionalLight.position.set(-2000, 500, -2000);
		this.directionalLight.position.set(this.cameraContainer.position.x - 2000, 3000, this.cameraContainer.position.z - 1000);
		this.directionalLight.target.position.set(this.cameraContainer.position.x, 0, this.cameraContainer.position.z + 2000);
		if(this.model.shadow)
		{
			this.directionalLight.castShadow = true;
			this.directionalLight.shadowDarkness = 0.09;
			this.directionalLight.shadowCameraNear = 500;
			this.directionalLight.shadowCameraFar = 10000;
			// this.directionalLight.shadowBias = 0.5;

			this.directionalLight.shadowCameraRight = 4000;
			this.directionalLight.shadowCameraLeft = -4500;
			this.directionalLight.shadowCameraTop = 4000;
			this.directionalLight.shadowCameraBottom = -2000;

			this.directionalLight.shadowMapWidth = 1024;
			this.directionalLight.shadowMapHeight = 1024;
			// this.directionalLight.shadowCameraVisible = true;
		}
		this.scene.add(this.directionalLight);

		this.hemisphereLight = new THREE.HemisphereLight(this.model.hemiLightColorSky, this.model.hemiLightColorFloor, this.model.hemiLightStrength);
		this.scene.add(this.hemisphereLight);
	}

	//-----------------------------------------------------o renderer

	_initRenderer()
	{
		this.renderer = new THREE.WebGLRenderer({antialias: false});
		this.renderer.setSize(Stage.width, Stage.height);
		this.renderer.setClearColor(this.model.backgroundColor, 1);
		this.renderer.domElement.id = "canvas";
		// Css.transform(this.renderer.domElement, "scale(" + Stage.dpr + ")");

		this.renderer.autoClear = false;
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;

		// shadows
		if(this.model.shadow)
		{
			this.renderer.shadowMap.enabled = true;
			// this.renderer.shadowMap.debug = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			this.renderer.shadowMapSoft = true;

			this.renderer.shadowMapBias = 0.00029;
			// this.renderer.shadowMapWidth = 2048;
			// this.renderer.shadowMapHeight = 2048;
		}
		
		this.container.appendChild(this.renderer.domElement);

        //console.log("MAX PARTICLE POINT SIZE", this.renderer.context.getParameter(this.renderer.context.ALIASED_POINT_SIZE_RANGE)[1]);
	}

	//-----------------------------------------------------o composer

	_initComposer()
	{
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(new THREE.RenderPass(this.scene, this.fpCamera));

		this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
		this.effectFXAA.uniforms['resolution'].value.set(1 / Stage.width, 1 / Stage.height);
		this.composer.addPass(this.effectFXAA);

		this.hblur = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);
		this.hblur.uniforms.h.value = this.model.bluriness / Stage.width;

		this.vblur = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
		this.vblur.uniforms.v.value = this.model.bluriness / Stage.height;
		this.composer.addPass(this.vblur);

		this.hblur.uniforms.r.value = this.vblur.uniforms.r.value = 0.5;
		this.composer.addPass(this.hblur);

		// this.effectBloom = new THREE.BloomPass(this.model.bloom, 25);
		// this.composer.addPass(this.effectBloom);
		
		// this.effectBleach = new THREE.ShaderPass(THREE.BleachBypassShader);
		// this.effectBleach.uniforms['opacity'].value = this.model.bleach;
		// this.composer.addPass(this.effectBleach);
		
		this.effectNoise = new THREE.FilmPass(this.model.noiseIntensity, 0, 0, false);
		this.effectNoise.renderToScreen = true;
		this.composer.addPass(this.effectNoise);

		// this.effectVignette = new THREE.ShaderPass(THREE.VignetteShader);
		// this.effectVignette.uniforms['offset'].value = this.model.vignetteOffset;
		// this.effectVignette.uniforms['darkness'].value = this.model.vignetteDarkness;
		// this.composer.addPass(this.effectVignette);

		// var copyPass = new THREE.ShaderPass(THREE.CopyShader);
		// copyPass.renderToScreen = true;
		// this.composer.addPass(copyPass);
	}

	//-----------------------------------------------------o public

	update()
	{
		if(!this.locked && !this._destroyed)
		{
			if(this.controls) 
				this.controls.update();

			this.renderer.clear();

			this.meshManager.update();

			this.camera = /*this.model.debugCamera ? this.debugCamera :*/ this.fpCamera;
			this.renderer.render(this.scene, this.camera);

			if(this.composer && this.model.postProcessing)
				this.composer.render(0.01);
		}
	}

	resize()
	{
		// post processing
		if(this.composer && this.model.postProcessing)
		{
			if(this.hblur) this.hblur.uniforms.h.value = this.model.bluriness / Stage.width;
			if(this.vblur) this.vblur.uniforms.v.value = this.model.bluriness / Stage.height;
			if(this.effectFXAA) this.effectFXAA.uniforms['resolution'].value.set(1 / Stage.width, 1 / Stage.height);
			this.composer.setSize(Stage.width, Stage.height);
		}

		// camera
		this.camera.aspect = Stage.width / Stage.height;
		// console.log("Scene", Stage.height / 1000);
		this.camera.updateProjectionMatrix();

		// renderer		
		// this.renderer.setPixelRatio(Stage.dpr);
		this.renderer.setSize(Stage.width, Stage.height);

		this.meshManager.resize();
		// Stage.$window.scrollTop();
	}
}