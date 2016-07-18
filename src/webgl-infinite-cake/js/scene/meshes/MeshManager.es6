import Config from "Config";
import THREE from "lib/three/three";
import MeshFactory from "./MeshFactory";
import Stage from "lib/anonymous/core/Stage";
import Flames from "scene/meshes/Flames";
import PoissonDiskSampler from "lib/anonymous/math/PoissonDiskSampler";
import Emitter from "Emitter";

import SkyVs from "../shaders/SkyVs.glsl";
import SkyFs from "../shaders/SkyFs.glsl";

export default class MeshManager
{
	constructor(scene)
	{
		Emitter(this);

		this._scene = scene.scene;
		this._model = scene.model;
		this._camera = scene.camera;
		this._cameraContainer = scene.cameraContainer;
		this._directionalLight = scene.directionalLight;
		this._renderer = scene.renderer;

		// this.cubeCamera = new THREE.CubeCamera(1, 15000, 128); // parameters: near, far, resolution
		// this.cubeCamera.renderTarget.generateMipmaps = false;
		// this.cubeCamera.renderTarget.minFilter = THREE.LinearFilter;
		// this.cubeCamera.renderTarget.magFilter = THREE.LinearFilter;
		// this.cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter; // mipmap filter
		// this._scene.add(this.cubeCamera);

		// mesh factory
		this._factory = new MeshFactory(scene);
		// this._factory.on("loaded", this._init.bind(this));
		this._factory.load();
	}

	/**
	 * Must be called by parent when everything is loaded
	 */
	init()
	{
		// main container
		this._container = new THREE.Object3D();
		// this._floorContainer = new THREE.Object3D();

		// skydom
		this.skyUniforms = 
		{
			topColor: 	 {type: "c", value: new THREE.Color(this._model.topColor)},
			bottomColor: {type: "c", value: new THREE.Color(this._model.fogColor)},
			offset:		 {type: "f", value: this._model.skyOffset},
			exponent:	 {type: "f", value: this._model.skyExponent}
		}

		var skyGeo = new THREE.SphereGeometry(this._camera.far - 50, 12, 4);
		var skyMat = new THREE.ShaderMaterial( 
		{ 
			vertexShader: SkyVs, 
			fragmentShader: SkyFs, 
			uniforms: this.skyUniforms, 
			depthWrite: false,
			wireframe: false,
			side: THREE.BackSide 
		});

		this._sky = new THREE.Mesh(skyGeo, skyMat);
		this._sky.position.z = this._cameraContainer.position.z;
		this._sky.position.x = this._cameraContainer.position.x;
		this._scene.add(this._sky);

		// floor
		this._floor = this._factory.get(MeshFactory.TYPE_FLOOR);
		if(this._model.shadow) this._floor.receiveShadow = true;
		this._container.add(this._floor);

		this._tileW = 6000;//this._floor.geometry.boundingBox.max.x * 2;
		this._tileH = 4000;//this._floor.geometry.boundingBox.max.z * 2;

		this._tile = this._generateTile(this._model.grids[0]);

		this._mergeTiles();

		this._generateFlames();
		
		this._scene.add(this._container);
		
		this._ready = true;
	}

	destroy()
	{
		if(this.flames)
			this.flames.destroy();
	}

	update()
	{
		if (this._ready)
		{
			if(Config.LEVEL < 3 && this._model.reflections)
			{
				this._sky.visible = false;

				this._factory.floorShader.uniforms.uSampler.value = null;
				this._factory.mirror.render();
				this._factory.floorShader.uniforms.uSampler.value = this._factory.mirror.texture;

				this._sky.visible = true;
			}

			if(!Config.FREE_CAM && !Config.GENERATOR)
			{
				var xSpeed = Math.tan(this._cameraContainer.children[0].rotation.y) * this._model.zSpeed;

				this._container.position.z += this._model.zSpeed;
				this._container.position.x += xSpeed;

				// container positionning
				if(this._container.position.z > this._tileH)
				{
					this._container.position.z -= this._tileH;
					if(this.flames)
					{
						this.flames.shift(2, 0);
						this.flames.shift(3, 1);
					}
				}

				if(this._container.position.x > this._tileW * 0.5)
				{
					this._container.position.x -= this._tileW;
					if(this.flames)
					{
						this.flames.shift(1, 0);
						this.flames.shift(3, 2);
					} 
				}
				else if(this._container.position.x < -this._tileW * 0.5)
				{
					this._container.position.x += this._tileW;
					if(this.flames)
					{
						this.flames.shift(0, 1);
						this.flames.shift(2, 3);
					}
				}
			}

			// if(this.flames)
			// 	this.flames.update(this._container.position, this._gameController ? this._gameController.power : 0);
		}
	}

	updateFlames(position, power)
	{
		if(this.flames)
			this.flames.update(this._container.position, position, power);
	}

	resize()
	{
		if(this.flames)
		{
			this.flames.resize();
			// this.flames.material.uniforms.scale.value = Stage.height * Stage.dpr;
		}
	}

	//-----------------------------------------------------o populate methods

	/**
	 * Generates an array of position to cache slow raycasting once and for all.
	 * Stored in SceneModel (grids).
	 */
	generateGrid()
	{
		if(this._floor)
		{
			this._floor.geometry.computeBoundingBox();

			var raycaster = new THREE.Raycaster();
			raycaster.far = this._floor.geometry.boundingBox.max.y + 1;

			this._rayDirection = new THREE.Vector3(0, -1, 0);
			this._poissonDiskSampler = new PoissonDiskSampler(this._tileW, this._tileH,	230);

			if(Config.DEBUG)
				console.time("Populate positions array");

			var sample,
				positions = [];
			var samples = 0,
				maxSamples = 600;
			while(sample = this._poissonDiskSampler.get()) 
			{
				var x = sample[0] - this._tileW | 0;
				var z = sample[1] - this._tileH | 0;
				var vec3 = new THREE.Vector3(this._floor.position.x + x, this._floor.geometry.boundingBox.max.y + 1, this._floor.position.z + z);
				raycaster.set(vec3, this._rayDirection);
				var projection = raycaster.intersectObject(this._floor);

				if(projection.length)
					positions.push(x + this._tileW * 0.5, (projection[0].point.y | 0), z + this._tileH * 0.5);
				else
				{
					console.warn("no projection found");
				}

				if(++samples == maxSamples)
					break;
			}

			if(Config.DEBUG)
				console.timeEnd("Populate positions array");

			if(samples !== maxSamples)
			{
				console.log("Positions (" + positions.length / 3 + ") :");
				console.log(JSON.stringify(positions));
			}

			this._model.grids[0] = positions;
		}
	}

	_generateTile(grid)
	{
		// var tile = new THREE.Object3D();

		var types = [], 
			meshes = [],
			ll = this._factory.candles.length;
		if(ll)
			for (let i = 0, l = 20; i < l; ++i)
				types.push(this._factory.candles[i % ll]);

		ll = this._factory.strawberries.length;
		if(ll)
			for (let i = 0, l = 2; i < l; ++i)
				types.push(this._factory.strawberries[i % ll]);

		ll = this._factory.meringues.length;
		if(ll)
			for (let i = 0, l = 2; i < l; ++i)
				types.push(this._factory.meringues[i % ll]);

		ll = types.length;
		// let candlesCount = 0
		for (let i = 0, l = grid.length; i < l; i += 3)
		{
			let x = grid[i],
				y = grid[i + 1],
				z = grid[i + 2];

				// x = 2000, y = 0, z = 2000; // DEBUG

				// x = 1500 + i * 80;
				// // z = i * 80; // DEBUG
				// z = 600;

			let type = types[Math.random() * ll | 0];
			// if(type === MeshFactory.TYPE_CANDLE1 || type === MeshFactory.TYPE_CANDLE2 || type === MeshFactory.TYPE_CANDLE3)
			// 	candlesCount++;

			let model = this._factory.get(type);

			let clone = model.clone();
			clone.position.x = x;
			clone.position.y = y;
			clone.position.z = z;

			clone.rotation.x = (Math.random() - Math.random()) * Math.PI / 12;
			clone.rotation.y = Math.random() * Math.PI - Math.random() * Math.PI;
			clone.rotation.z = (Math.random() - Math.random()) * Math.PI / 12;
			
			if(type === MeshFactory.TYPE_STRAWBERRY1 || type === MeshFactory.TYPE_STRAWBERRY2)
			{
				let scale = 0.5 - Math.random() * 0.25;
				clone.scale.set(scale, scale, scale);
			}
			else if(type === MeshFactory.TYPE_MERINGUE1 || type === MeshFactory.TYPE_MERINGUE2)
			{
				let scale = 0.8 - Math.random() * 0.15;
				clone.scale.set(scale, scale, scale);
			}

			// register mesh to be merged
			if(meshes[type] === undefined)
				meshes[type] = [];
			meshes[type].push(clone);

			if(type === MeshFactory.TYPE_STRAWBERRY1)
			{
				var pedoncule = this._factory.get(MeshFactory.TYPE_PEDONCULE).clone();

				pedoncule.position.x = clone.position.x;
				pedoncule.position.y = clone.position.y;
				pedoncule.position.z = clone.position.z;

				pedoncule.rotation.x = clone.rotation.x;
				pedoncule.rotation.y = clone.rotation.y;
				pedoncule.rotation.z = clone.rotation.z;

				pedoncule.scale.set(clone.scale.x, clone.scale.y, clone.scale.z);

				if(meshes[MeshFactory.TYPE_PEDONCULE] === undefined) meshes[MeshFactory.TYPE_PEDONCULE] = [];
				meshes[MeshFactory.TYPE_PEDONCULE].push(pedoncule);
			}
		}

		// merge clones in a single mesh
		console.time("Merging clones");
		this._flamePositions = [];
		this._tileMeshes = [];
		for(var m in meshes)
		{
			console.log("Merging", m);
			var type = meshes[m];
			if(type.length)
			{
				var geometry = new THREE.Geometry();
				var material = type[0].material;
				for (let i = 0, l = type.length; i < l; ++i)
				{
					let clone = type[i];
						clone.updateMatrix();

					var materialIndex = 0;
					if(m === MeshFactory.TYPE_CANDLE1 || m === MeshFactory.TYPE_CANDLE2 || m === MeshFactory.TYPE_CANDLE3)
					{
						// flame positionning
						var upperVertex = clone.geometry.vertices[clone.geometry.vertices.length - 1];
						var vector = upperVertex.clone();
						vector.applyMatrix4(clone.matrix);

						materialIndex = Math.random() * 3 | 0;
						this._flamePositions.push(vector.x, vector.y, vector.z);
					}

					geometry.merge(clone.geometry, clone.matrix, materialIndex);
				}
				var mesh = new THREE.Mesh(geometry, material);
				mesh.name = m;

				// tile.add(mesh);
				this._tileMeshes.push(mesh);
			}
		}
		console.timeEnd("Merging clones");

		// return tile;
	}

	_mergeTiles()
	{
		console.time("Merging tiles");

		var meshes = [];
		var sx = 1;
		var sz = -1;

		for (let i = 0, l = 4; i < l; ++i)
		{
			for (var j = 0, ll = this._tileMeshes.length; j < ll; ++j)
			{
				let mesh = this._tileMeshes[j];
				mesh.position.x = sx * this._tileW * 0.5;
				mesh.position.z = sz * this._tileH * 0.5;
				mesh.updateMatrix();
				// mesh.applyMatrix(tile.matrixWorld);

				if(!meshes[j])
				{
					meshes[j] = new THREE.Mesh(new THREE.Geometry(), mesh.material);
					meshes[j].name = mesh.name;
				}

				meshes[j].geometry.merge(mesh.geometry, mesh.matrix);
			}

			sx *= -1;
			if(i % 2) sz *= -1;
		}

		console.timeEnd("Merging tiles");

		for (let i = 0, l = meshes.length; i < l; ++i)
		{
			let mesh = meshes[i];
			if(this._model.shadow) mesh.castShadow = true;
			this._container.add(mesh);
		}
	}

	//-----------------------------------------------------o flames

	_generateFlames()
	{
		var l = 4;
		this.flames = new Flames(this._scene, this._camera, this._flamePositions.length * l / 3);
		this.flames.on("blown", this._onFlameBlown.bind(this));
		// this.flames = new Flames(this._scene, this._flamePositions.length * 4 / 3);

		var sx = 1;
		var sz = -1;

		for (var j = 0; j < l; ++j)
		{
			var tilex = sx * this._tileW * 0.5;
			var tilez = sz * this._tileH * 0.5;

			for (let i = 0, l = this._flamePositions.length; i < l; i += 3)
				this.flames.add(this._flamePositions[i] + tilex, this._flamePositions[i + 1], this._flamePositions[i + 2] + tilez);

			sx *= -1;
			if(j % 2) sz *= -1;
		}

		this._container.add(this.flames.init());
	}

	_onFlameBlown()
	{
		this.emit("blown");
	}
}
