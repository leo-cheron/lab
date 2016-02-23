import THREE from "lib/three/three";
import OrbitControls from "lib/three/controls/OrbitControls";

import FlameFs from "./shaders/FlameFs.glsl";
import FlameVs from "./shaders/FlameVs.glsl";

export default class Flames
{
	constructor(model)
	{
		this.model = model;
		this.container = $("#container");

		this.camera = new THREE.PerspectiveCamera(40, Stage.width / Stage.height, 5, 5000);
		this.camera.position.y = 600;
		this.camera.position.z = 2800;

		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog(0x111111, 1000, 5000);

		//

		var count = 4000;

		var geometry = new THREE.InstancedBufferGeometry();
		geometry.copy(new THREE.PlaneBufferGeometry(100, 100));

		this.translate = new Float32Array(count * 3);
		this.timeInits = new Float32Array(count);
		// this.power = new Float32Array(count);

		// var n = 5000, n2 = n / 2;

		for (var i = 0, l = this.translate.length; i < l; i += 3)
		{
			var r = i / l;
			var a = r * 4 * Math.PI;

			var x = i / l * 6000 - 3000;
			var y = Math.sin(a) * 150 + Math.random() * 40;
			var z = Math.sin(Math.random() * Math.PI * 2) * 2000;

			// x = 0;
			// y = 0;
			// z = 0;

			this.translate[i]     = x;
			this.translate[i + 1] = y;
			this.translate[i + 2] = z;

			this.timeInits[i / 3] = Math.random() * 10;

			// this.power[i / 3] = 0;
		}

		geometry.addAttribute('translate', new THREE.InstancedBufferAttribute(this.translate, 3, 1));
		geometry.addAttribute('timeInit', new THREE.InstancedBufferAttribute(this.timeInits, 1));
		// geometry.addAttribute('power', new THREE.InstancedBufferAttribute(this.power, 1));

		var material = new THREE.RawShaderMaterial(
		{
			uniforms: 
			{
				time: 		 { type: "f", value: 0.0 },
				scale: 		 { type: "f", value: 1.0 },
				origin: 	 { type: "v2", value: new THREE.Vector2(0.0, 20.0) },
				fogColor:    { type: "c", value: this.scene.fog.color },
				fogNear:     { type: "f", value: this.scene.fog.near },
				fogFar:      { type: "f", value: this.scene.fog.far },

				power:      { type: "f", value: this.model.power },

				streamVx:    	 { type: "f", value: this.model.streamVx},
				streamVy:    	 { type: "f", value: this.model.streamVy},

				noiseScale:      { type: "f", value: this.model.noiseScale},
				noiseY:      	 { type: "f", value: this.model.noiseY},
				displayNoise:    { type: "i", value: this.model.displayNoise ? 1 : 0 },
			},
			vertexShader: FlameVs,
			fragmentShader: FlameFs,
			fog: true,
			depthTest: false,
			depthWrite: false,
			transparent: true,
			// blending: THREE.CustomBlending,
			blending: THREE.AdditiveBlending,
        });

		material.blendSrc = THREE.SrcAlphaFactor;
		material.blendDst = THREE.OneMinusSrcColorFactor;
		material.blendEquation = THREE.AddEquation;

		this.mesh = new THREE.Mesh(geometry, material);
		this.scene.add(this.mesh);

		//

		this.renderer = new THREE.WebGLRenderer( { antialias: false } );
		this.renderer.setClearColor(this.scene.fog.color);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(Stage.width, Stage.height);

		this.container.append(this.renderer.domElement);

		this.cameraControls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		this.cameraControls.target.set(0, 0, 0);

		var axisHelper = new THREE.AxisHelper(1000);
		this.scene.add(axisHelper);
	}

	resize()
	{
		this.camera.aspect = Stage.width / Stage.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(Stage.width, Stage.height);
	}

	tick()
	{
		var time = 1000 + performance.now() * 0.01;
		this.mesh.material.uniforms.time.value = time;

		this.cameraControls.update();

		this.renderer.render(this.scene, this.camera);
	}
}