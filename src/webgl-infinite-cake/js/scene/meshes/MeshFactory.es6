import THREE from "lib/three/three";
import Emitter from "Emitter";
import Config from "Config";
import Stage from "lib/anonymous/core/Stage";

// import FloorMaterialFs from "../shaders/FloorMaterialFs.glsl";
// import FloorMaterialVs from "../shaders/FloorMaterialVs.glsl";

import FresnelShader from "../shaders/FresnelShader.js";
// import FresnelShaderSimple from "../shaders/FresnelShaderSimple.js";

import Mirror from "../shaders/Mirror.js";

export default class MeshFactory
{
	constructor(scene)
	{
		Emitter(this);

		this._scene = scene;
		this._model = scene.model;
		// this._envmap = envmap;

		this._loader = new THREE.JSONLoader();
		this._loaded = 0;

		// available models
		this.candles = 
		[
			MeshFactory.TYPE_CANDLE1,
			MeshFactory.TYPE_CANDLE2,
			MeshFactory.TYPE_CANDLE3
		];

		this.strawberries = 
		[
			// MeshFactory.TYPE_STRAWBERRY1
			// MeshFactory.TYPE_STRAWBERRY2
		];

		this.meringues = 
		[
			// MeshFactory.TYPE_MERINGUE2
		];

		// if(Stage.device === "desktop")
		// {
		// 	this.candles.push(MeshFactory.TYPE_CANDLE3);
		// 	this.meringues.push(MeshFactory.TYPE_MERINGUE1);
		// 	this.strawberries.push(MeshFactory.TYPE_STRAWBERRY1);
		// }

		// if(Stage.device === "tablet")
		// {
		// 	this.candles.push(MeshFactory.TYPE_CANDLE3);
		// 	// this.meringues.push(MeshFactory.TYPE_MERINGUE1);
		// }
		// this.candles.push(MeshFactory.TYPE_CANDLE3);

		this._ids = this.candles.concat(this.strawberries).concat(this.meringues);
		this._ids.push(MeshFactory.TYPE_FLOOR);
		// this._ids.push(MeshFactory.TYPE_PEDONCULE);

		this._meshes = [];

		// small elements env
		var path = "models/skybox/";
		var urls = [ path + "px.jpg", path + "nx.jpg",
					 path + "py.jpg", path + "ny.jpg",
					 path + "pz.jpg", path + "nz.jpg" ];

		this._textureLoader = new THREE.TextureLoader();
		this._cubeLoader = new THREE.CubeTextureLoader();
		this._cubeMap = this._cubeLoader.load(urls);
		this._cubeMap.format = THREE.RGBFormat;

		// floor env
		// path = "models/floor/skybox/";
		// urls = [ path + "px.jpg", path + "nx.jpg",
		// 		 path + "py.jpg", path + "ny.jpg",
		// 		 path + "pz.jpg", path + "nz.jpg" ];

		// this._cubeMapFloor = THREE.ImageUtils.loadTextureCube(urls);
		// this._cubeMapFloor.format = THREE.RGBFormat;
		
		var shader = THREE.ShaderLib["cube"];
		shader.uniforms["tCube"].value = this._cubeMap;

		this.envMaterial = new THREE.ShaderMaterial( 
		{
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: true,
			side: THREE.BackSide
		});

		if(true)
		// if(Config.LEVEL < 3)
		{
			this._candleMaterial = new THREE.MeshLambertMaterial( 
			{
				side: THREE.FrontSide,
				transparent: false,
				wireframe: this._model.wireframe
			});
		}
		else
		{
			this._candleMaterial = new THREE.MeshPhongMaterial( 
			{
				specular: 0x222222,
				shininess: 30,
				// map: texture,
				shading: THREE.SmoothShading,
				side: THREE.FrontSide,
				transparent: false,
				// bumpMap: bumpTexture,
				bumpScale: 1.5, 
				metal: false,
				wireframe: this._model.wireframe
			});
		}
	}

	load()
	{
		for (var i = 0; i < this._ids.length; i++) 
		{
			var id = this._ids[i];
			this.build(id);
		}
	}

	build(type)
	{
		switch(type)
		{
			case MeshFactory.TYPE_BOX:
				var geometry = new THREE.BoxGeometry( 500, 500, 500 );
				var mesh = new THREE.Mesh(geometry, this.fresnelMaterial);

				geometry.computeFaceNormals();
				geometry.computeVertexNormals();

				++this._loaded;
				this._meshes[type] = mesh;
				break;

			case MeshFactory.TYPE_FLOOR:
				var texture = this._textureLoader.load("models/floor/etoiles-repeat.jpg");
				// var bumpTexture = THREE.ImageUtils.loadTexture( "models/floor/floor-bump.jpg" );
				texture.wrapS =
				texture.wrapT = THREE.RepeatWrapping;
				// texture.repeat.set( 10, 10 );

				var params = 
				{
					map: texture,
					fog: true,
					wireframe: this._model.wireframe
				}

				params.uCube = this._cubeMap;
				// params.reflectivity = this._model.reflectivity;
				// params.reflectivity = 1.0;
				// params.specular = new THREE.Color(this._model.specular),

				params.uColor1 = new THREE.Color(this._model.fresnelColor);
				params.uColor2 = new THREE.Color(this._model.fresnelColor2);

				params.uFresnelBias = this._model.fresnelBias;
				params.uFresnelScale = this._model.fresnelScale;
				params.uFresnelPower = this._model.fresnelPower;
				params.uReflectionPower = this._model.fresnelReflectionPower;

				params.uFresnelColorBias = this._model.fresnelColorBias;
				params.uFresnelColorScale = this._model.fresnelColorScale;
				params.uFresnelColorPower = this._model.fresnelColorPower;

				// params.envMap = this.mirror.texture;
				// mirror
				if(Config.LEVEL < 3)
				{
					// this.mirror = new THREE.Mirror(this._scene.renderer, this._scene.camera, { clipBias: 0.0, textureWidth: 512 | 0, textureHeight: 512 | 0, color: 0x777777 } );
					this.mirror = new THREE.Mirror(this._scene.renderer, this._scene.camera, { clipBias: 0.0, textureWidth: Stage.width * 2 | 0, textureHeight: Stage.height * 2 | 0, color: 0x777777 } );
					this.mirror.rotation.x = -Math.PI / 2;
					// this._scene.scene.add(this.mirror);

					params.uTextureMatrix = this.mirror.textureMatrix;
					params.uSampler = this.mirror.texture;
				}

				this.floorShader = new FresnelShader(params);
				this.floorShader.uniforms.offsetRepeat.value.set(0, 0, 12, 12);
				var material = new THREE.ShaderMaterial(
				{
					fragmentShader: this.floorShader.fragmentShader,
					vertexShader: this.floorShader.vertexShader,
					uniforms: this.floorShader.uniforms,
					shading: THREE.SmoothShading,
					side: THREE.FrontSide,
					// lights: true,
					fog: true,
					wireframe: this._model.wireframe
				});

				// var geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 2 );
				// var mirrorMesh = new THREE.Mesh( geometry, this.mirror.material );
				// mirrorMesh.add( this.mirror );
				// mirrorMesh.rotateX( - Math.PI / 2 );
				// mirrorMesh.position.y = 0;
				// // mirrorMesh.visible = false;
				// this._scene.scene.add( mirrorMesh );

				// material.envMap = cubeMap;
				// material.bumpMap = bumpTexture;

				// material = new THREE.MeshPhongMaterial({
				//   color: 0xFF0000,
				//   // transparent: true,
				//   // map: texture,
				// });
				
				// this.mirror.material.uniforms.mirrorSampler.value = this.debugTexture;
				// material = this.mirror.material; //////////////

				// ++this._loaded;
				// var geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 2 );
				// var mesh = new THREE.Mesh( geometry, material );
				// mesh.add(this.mirror);
				// mesh.rotateX( -Math.PI / 2 );
				// this._meshes[type] = mesh;
				// this.emit("loaded");

				this.loadGeometry(type, "models/floor/low/floor-2x2.js", material);
				break;

			case MeshFactory.TYPE_CANDLE1:
				var material = this._candleMaterial.clone();
					material.map = this._textureLoader.load("models/candles/low/candle-low-01.jpg");
				if(material instanceof THREE.MeshPhongMaterial)
					material.bumpMap = this._textureLoader.load("models/candles/low/candle-low-01-bump.jpg");
				this.loadGeometry(type, "models/candles/low/candle-low.js", material);

				/*var materials = [];
				for (var i = 0, l = 3; i < l; ++i)
				{
					var mat = this._candleMaterial.clone();
						mat.map = THREE.ImageUtils.loadTexture("models/candles/low/candle-low-0" + (i + 1) + ".jpg");

					if(mat instanceof THREE.MeshPhongMaterial)
						mat.bumpMap = THREE.ImageUtils.loadTexture("models/candles/low/candle-low-0" + (i + 1) + "-bump.jpg");;

					materials[i] = mat;
				}
				var material = new THREE.MeshFaceMaterial(materials);*/

				// this.loadGeometry(type, "models/candles/low/candle-low.js", material);
				break;

			case MeshFactory.TYPE_CANDLE2:
				var material = this._candleMaterial.clone();
					material.map = this._textureLoader.load("models/candles/low/candle-low-02.jpg");
				if(material instanceof THREE.MeshPhongMaterial)
					material.bumpMap = this._textureLoader.load("models/candles/low/candle-low-02-bump.jpg");
				this.loadGeometry(type, "models/candles/low/candle-low.js", material);
				break;

			case MeshFactory.TYPE_CANDLE3:
				var material = this._candleMaterial.clone();
					material.map = this._textureLoader.load("models/candles/low/candle-low-03.jpg");
				if(material instanceof THREE.MeshPhongMaterial)
					material.bumpMap = this._textureLoader.load("models/candles/low/candle-low-03-bump.jpg");
				this.loadGeometry(type, "models/candles/low/candle-low.js", material);
				break;

			case MeshFactory.TYPE_PEDONCULE:
				var texture = this._textureLoader.load("models/strawberries/fraise-01-pedoncule.jpg");
				var material = new THREE.MeshLambertMaterial(
				{
					map: texture,
					side: THREE.DoubleSide,
					// envMap: this._cubeMap,
					// reflectivity: 0.1,
					// combine: THREE.AddOperation,
				});

				// material.map = texture;
				// material.bumpMap = bumpTexture;
				// material.envMap = this._cubeMap;
				// material.combine = THREE.AddOperation;

				this.loadGeometry(type, "models/strawberries/strawberry-01-pedoncule.js", material);
				break;

			case MeshFactory.TYPE_STRAWBERRY1:
				var texture = this._textureLoader.load("models/strawberries/fraise-01-body.jpg");
				var bumpTexture = this._textureLoader.load("models/strawberries/fraise-01-body-bump.jpg");
				
				this.strawberryMaterial = new THREE.MeshPhongMaterial(
				{
					specular: new THREE.Color(this._model.strawberrySpecular),
					envMap: this._cubeMap,
					map: texture,
					bumpMap: bumpTexture, 
					bumpScale: this._model.strawberryBumpMapScale, 
					shininess: this._model.strawberryShininess,
					reflectivity: this._model.strawberryReflectivity,
					combine: THREE.AddOperation,
				});

				// this.strawberryMaterial = new THREE.MeshLambertMaterial(
				// {
				// 	// specular: new THREE.Color(this._model.strawberrySpecular),
				// 	// envMap: this._cubeMap,
				// 	map: texture,
				// 	// bumpMap: bumpTexture, 
				// 	// bumpScale: this._model.strawberryBumpMapScale, 
				// 	// shininess: this._model.strawberryShininess,
				// 	reflectivity: this._model.strawberryReflectivity,
				// 	combine: THREE.AddOperation,
				// });

				// material.map = texture;
				// material.bumpMap = bumpTexture;
				// material.envMap = this._cubeMap;
				// material.combine = THREE.AddOperation;

				this.loadGeometry(type, "models/strawberries/strawberry-01.js", this.strawberryMaterial);
				break;

			case MeshFactory.TYPE_STRAWBERRY2:
				var texture = this._textureLoader.load( "models/strawberries/fraise-02-Color.jpg" );
				var bumpTexture = this._textureLoader.load( "models/strawberries/fraise-02-bump.jpg" );
				/*var shader = new FresnelShader(
				{
					specular: new THREE.Color(this._model.strawberrySpecular),
					envMap: this._cubeMap,
					map: texture,
					bumpMap: bumpTexture, 
					bumpScale: this._model.strawberryBumpMapScale,

					uColor: new THREE.Color(this._model.strawberryFresnelColor),

					uFresnelBias: this._model.strawberryFresnelBias,
					uFresnelScale: this._model.strawberryFresnelScale,
					uFresnelPower: this._model.strawberryFresnelPower,

					shininess: this._model.strawberryShininess,
					reflectivity: this._model.strawberryReflectivity,
					combine: THREE.AddOperation,
				});

				var material = new THREE.ShaderMaterial(
				{
					fragmentShader: shader.fragmentShader,
					vertexShader: shader.vertexShader,
					uniforms: shader.uniforms,
					shading: THREE.SmoothShading,
					side: THREE.FrontSide,
					lights: true,
					fog: true,
					wireframe: this._model.wireframe
				});*/

				var material = new THREE.MeshPhongMaterial(
				{
					specular: new THREE.Color(this._model.strawberrySpecular),
					envMap: this._cubeMap,
					map: texture,
					bumpMap: bumpTexture, 
					bumpScale: this._model.strawberryBumpMapScale, 
					shininess: this._model.strawberryShininess,
					reflectivity: this._model.strawberryReflectivity,
					combine: THREE.AddOperation,
				});

				material.map = texture;
				material.bumpMap = bumpTexture;
				material.envMap = this._cubeMap;
				material.combine = THREE.AddOperation;

				this.loadGeometry(type, "models/strawberries/strawberry-02.js", material);
				break;

			case MeshFactory.TYPE_MERINGUE1:
				/*this.meringueShader = new FresnelShader(
				{
					specular: new THREE.Color(this._model.meringueSpecular),
					envMap: this._cubeMap,
					// map: texture,
					// bumpMap: bumpTexture, 
					// bumpScale: this._model.strawberryBumpMapScale, 
					uColor: new THREE.Color(this._model.meringueFresnelColor),
					uFresnelBias: this._model.meringueFresnelBias,
					uFresnelScale: this._model.meringueFresnelScale,
					uFresnelPower: this._model.meringueFresnelPower,
					// uRefractionRatio: this._model.fresnelRefractionRatio,
					shininess: this._model.meringueShininess,
					reflectivity: this._model.meringueReflectivity,
					combine: THREE.AddOperation,
				});
				var material = new THREE.ShaderMaterial(
				{
					fragmentShader: this.meringueShader.fragmentShader,
					vertexShader: this.meringueShader.vertexShader,
					uniforms: this.meringueShader.uniforms,
					shading: THREE.SmoothShading,
					side: THREE.FrontSide,
					lights: true,
					fog: true,
					wireframe: this._model.wireframe
				});*/

				this.meringueMaterial = new THREE.MeshLambertMaterial(
				{
					// specular: new THREE.Color(this._model.meringueSpecular),
					envMap: this._cubeMap,
					color: new THREE.Color(this._model.meringueColor),					
					// shininess: this._model.meringueShininess,
					reflectivity: this._model.meringueReflectivity,
					combine: THREE.AddOperation,
				});

				// material.map = texture;
				// material.bumpMap = bumpTexture;
				// material.envMap = this._cubeMap;
				// material.combine = THREE.AddOperation;

				this.loadGeometry(type, "models/meringues/meringue-01.js", this.meringueMaterial);
				break;

			case MeshFactory.TYPE_MERINGUE2:
				var material = new THREE.MeshLambertMaterial(
				{
					// specular: new THREE.Color(this._model.meringueSpecular),
					envMap: this._cubeMap,
					color: new THREE.Color(this._model.meringueColor),					
					// shininess: this._model.meringueShininess,
					reflectivity: this._model.meringueReflectivity,
					combine: THREE.AddOperation,
				});

				this.loadGeometry(type, "models/meringues/meringue-02.js", material);
				break;
		}
	}

	loadGeometry(type, src, material)
	{
		this._loader.load(src, (geometry, materials) =>
		{
			if(!material) material = new THREE.MeshBasicMaterial( { color: 0xBBBBBB, wireframe: true });
			var mesh = new THREE.Mesh(geometry, material);

			geometry.computeVertexNormals();
			// geometry.uvsNeedUpdate = true;
			// geometry.normalsNeedUpdate = true;
			// geometry.verticesNeedUpdate = true;
			// geometry.groupsNeedUpdate = true;
			// geometry.elementsNeedUpdate = true;
			// geometry.needsUpdate = true;

			if(type == MeshFactory.TYPE_FLOOR && Config.LEVEL < 3)
				mesh.add(this.mirror);
			
			if(type == MeshFactory.TYPE_CANDLE1 || type == MeshFactory.TYPE_CANDLE2 || type == MeshFactory.TYPE_CANDLE3)
				geometry.computeBoundingBox();

			this._meshes[type] = mesh;

			if(++this._loaded == this._ids.length)
				this.emit("loaded");
		});
	}

	get(id)
	{
		return this._meshes[id];
	}
}

MeshFactory.TYPE_BOX = "box";
MeshFactory.TYPE_FLOOR = "floor";
MeshFactory.TYPE_CANDLE1 = "candle1";
MeshFactory.TYPE_CANDLE2 = "candle2";
MeshFactory.TYPE_CANDLE3 = "candle3";
MeshFactory.TYPE_PEDONCULE = "pedoncule";
MeshFactory.TYPE_STRAWBERRY1 = "strawberry1";
MeshFactory.TYPE_STRAWBERRY2 = "strawberry2";
MeshFactory.TYPE_MERINGUE1 = "meringue1";
MeshFactory.TYPE_MERINGUE2 = "meringue2";