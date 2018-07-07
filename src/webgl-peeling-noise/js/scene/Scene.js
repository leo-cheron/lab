import THREE from "lib/three/three";
import Stage from "lib/anonymous/core/Stage";
// import EffectComposer from "lib/three/postprocessing/EffectComposer";
// import FilmPass from "lib/three/postprocessing/FilmPass";
// import CopyShader from "lib/three/shaders/CopyShader";
// import FXAAShader from "lib/three/shaders/FXAAShader";
// import RenderPass from "lib/three/postprocessing/RenderPass";
// import SpotLightHelper from "lib/three/extras/helpers/SpotLightHelper";
// import PointLightHelper from "lib/three/extras/helpers/PointLightHelper";
// import CameraHelper from "lib/three/extras/helpers/CameraHelper";

export default class Scene 
{
	constructor(model)
	{
		this.model = model;
		
		this.init();
	}

	init()
	{
		this.mouseX = 0;
		this.mouseY = 0;

		this.container = $('.container')[0];
		// document.body.appendChild( this.container );

		this.camera = new THREE.PerspectiveCamera(45, Stage.width / Stage.height, 1, 10000);
		this.camera.position.z = 1800;

		this.scene = new THREE.Scene();
		// this.scene.fog = new THREE.Fog(this.model.backgroundColor, this.model.fogNear, this.model.fogFar);

		// lights
		this._initLight();

		// renderer
		this._initRenderer();

		// post process
		// this._initComposer();
	}

	//-----------------------------------------------------o Lights

	_initLight() 
	{
		this.ambientLight = new THREE.AmbientLight(this.model.ambiantLight);
		this.scene.add(this.ambientLight);

		// this.light = new THREE.PointLight(0xffffff, 2, 1400, 1);
		// this.light.position.set(-0.3, 0.5, 1.0);
		// this.light.position.multiplyScalar(1000);
		// this.scene.add(this.light);

		// var pointLightHelper = new THREE.PointLightHelper(this.light, 100);
		// pointLightHelper.material.color = new THREE.Color(0xFF00FF);
		// this.scene.add(pointLightHelper);

		// this.directionalLight = new THREE.DirectionalLight(0xffffff, this.model.spotIntensity);
		this.directionalLight = new THREE.SpotLight(0xffffff, this.model.spotIntensity, 0, Math.PI/2);
		this.directionalLight.position.set(-0.3, 0.1, 1.0);
		this.directionalLight.position.multiplyScalar(2000);
		this.scene.add(this.directionalLight);

		// this.directionalLight.castShadow = true;
		// this.directionalLight.shadow.bias = this.model.shadowBias;
		// this.directionalLight.shadow.mapSize.width = 2048;
		// this.directionalLight.shadow.mapSize.height = 2048;
		// this.directionalLight.shadow.camera.near = this.model.shadowNear;
		// this.directionalLight.shadow.camera.far = this.model.shadowFar;
		// this.directionalLight.shadow.camera.right = 1000;
		// this.directionalLight.shadow.camera.left = -1000;
		// this.directionalLight.shadow.camera.top = 1000;
		// this.directionalLight.shadow.camera.bottom = -1000;

		// this.scene.add(this.directionalLight);

		// this.cameraHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
		// this.scene.add(this.cameraHelper);

		// this.spotLightShadowMapViewer = new THREE.ShadowMapViewer( this.directionalLight );
		// this.spotLightShadowMapViewer.size.set( 256, 256 );
		// this.spotLightShadowMapViewer.position.set( 276, 10 );

		// this.directionalLight2 = new THREE.SpotLight(0xffffff, this.model.spotIntensity - 0.8, 0, Math.PI/2);
		// this.directionalLight2.position.set(0.8, 0.8, 0.8);
		// this.directionalLight2.position.multiplyScalar(2000);

		// this.directionalLight2.castShadow = true;
		// this.directionalLight2.shadow.bias = this.model.shadowBias;
		// this.directionalLight2.shadow.mapSize.width = 2048;
		// this.directionalLight2.shadow.mapSize.height = 2048;
		// this.directionalLight2.shadow.camera.near = this.model.shadowNear;
		// this.directionalLight2.shadow.camera.far = this.model.shadowFar;
		// this.directionalLight2.shadow.camera.right = 1000;
		// this.directionalLight2.shadow.camera.left = -1000;
		// this.directionalLight2.shadow.camera.top = 1000;
		// this.directionalLight2.shadow.camera.bottom = -1000;
		
		// this.scene.add(this.directionalLight2);

		// this.cameraHelper2 = new THREE.CameraHelper( this.directionalLight2.shadow.camera );
		// this.scene.add(this.cameraHelper2);
	}

	//-----------------------------------------------------o renderer

	_initRenderer()
	{
		this.renderer = new THREE.WebGLRenderer( {antialias: true, transparent: true} );
		// this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setSize(Stage.width, Stage.height);
		this.renderer.setClearColor( this.model.backgroundColor, 1);
		this.renderer.autoClear = false;

		// this.renderer.shadowMap.enabled = true;
		// this.renderer.shadowMap.debug = true;
		// this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		// this.renderer.shadowMapSoft = true;
		this.renderer.setPixelRatio( Stage.dpr );
		// this.renderer.shadowMapBias = 0.00029;
		
		this.container.appendChild(this.renderer.domElement);
	}

	//-----------------------------------------------------o composer

	// _initComposer()
	// {
	// 	this.composer = new THREE.EffectComposer(this.renderer/*, renderTarget*/);
	// 	var renderScene = new THREE.RenderPass(this.scene, this.camera);
	// 	this.composer.addPass(renderScene);

	// 	this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	// 	this.effectFXAA.uniforms['resolution'].value.set(1 / (Stage.width * Stage.dpr), 1 / (Stage.height * Stage.dpr));
	// 	// this.composer.addPass(this.effectFXAA);

	// 	this.effectNoise = new THREE.FilmPass(0.1, 0, 0, false); // this.model.noiseIntensity
	// 	// this.composer.addPass(this.effectNoise);

	// 	var copyPass = new THREE.ShaderPass(THREE.CopyShader);
	// 	copyPass.renderToScreen = true;
	// 	this.composer.addPass(copyPass);
	// }

	//-----------------------------------------------------o public

	update()
	{
		
		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);

		// this.spotLightShadowMapViewer.render( this.renderer );
		// this.composer.render(0.01);
	}

	resize()
	{
		this.camera.aspect = Stage.width / Stage.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(Stage.width, Stage.height);

		// this.spotLightShadowMapViewer.updateForWindowResize();

		// this.effectFXAA.uniforms['resolution'].value.set(1 / (Stage.width * Stage.dpr), 1 / (Stage.height * Stage.dpr));
		// this.composer.setSize(Stage.width * Stage.dpr, Stage.height * Stage.dpr);
	}
}