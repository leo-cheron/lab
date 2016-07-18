import Config from "Config";
import THREE from "lib/three/three";
import Stage from "lib/anonymous/core/Stage";
import FlameVs from "../shaders/FlameVs.glsl";
import FlameFs from "../shaders/FlameFs.glsl";
import FlamesModel from "./FlamesModel";
import MouseEvent from "lib/anonymous/events/MouseEvent";
import Emitter from "Emitter";

export default class Flame
{
	constructor(scene, camera, count)
	{
		Emitter(this);

		this.count = count;

		this.scene = scene;
		this.camera = camera;
		this.translate = new Float32Array(count * 3);
		this.timeInits = new Float32Array(count);
		this.power = new Float32Array(count);
		this.blown = [];

		this._scale = 1;

		this.geometry = new THREE.InstancedBufferGeometry();
		this.geometry.copy(new THREE.PlaneBufferGeometry(100, 100));

		this._i = 0;
		this._v3 = new THREE.Vector3();
		this._flames = [];

		this.model = new FlamesModel();

		// raycasting
		this._raycaster = new THREE.Raycaster();
		// this.target = new THREE.Vector2();
	}

	add(x, y, z, tileIndex)
	{
		// this._v3.set(x, y, z).normalize();
		this.translate[this._i] = x;
		this.translate[this._i + 1] = y + 25;
		this.translate[this._i + 2] = z;

		var i3 = this._i / 3;
		this.timeInits[i3] = Math.random() * 10;

		this.power[i3] = 0;
		this.blown[i3] = false;
		
		this._i += 3;
	}

	destroy()
	{
	}

	init()
	{
		this.geometry.addAttribute('translate', new THREE.InstancedBufferAttribute(this.translate, 3, 1));
		this.geometry.addAttribute('timeInit', new THREE.InstancedBufferAttribute(this.timeInits, 1));
		this.geometry.addAttribute('power', new THREE.InstancedBufferAttribute(this.power, 1).setDynamic(true));

		var flameFs = FlameFs;
		if(Config.LEVEL < 3)
			flameFs = "#define IS_HIGH \n\r" + flameFs;

		// material
		this.material = new THREE.RawShaderMaterial(
		{
			uniforms: 
			{
				time: 				 { type: "f", value: 0.0 },
				breezeRadius: 	 	 { type: "f", value: 0.0 },
				scale: 				 { type: "f", value: 1.0 },
				origin: 			 { type: "v2", value: new THREE.Vector2(0.0, 25.0) },
				// mouse: 			 	 { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) },
				fogColor:   		 { type: "c", value: this.scene.fog ? this.scene.fog.color : 0x000000 },
				fogNear:    		 { type: "f", value: this.scene.fog ? this.scene.fog.near : 0 },
				fogFar:    			 { type: "f", value: this.scene.fog ? this.scene.fog.far : 10000 },

				streamVx:    	 { type: "f", value: this.model.streamVx},
				streamVy:    	 { type: "f", value: this.model.streamVy},

				// noiseVx:    	 { type: "f", value: this.model.noiseVx},
				// noiseVy:      { type: "f", value: this.model.noiseVy},
				noiseScale:      { type: "f", value: this.model.noiseScale},
				noiseY:      	 { type: "f", value: this.model.noiseY},
				displayNoise:    { type: "i", value: this.model.displayNoise ? 1 : 0 },
			},
			vertexShader: FlameVs, 
			fragmentShader: flameFs,
			fog: true,
			depthTest: true,
			depthWrite: false,
			transparent: true,
			// side: THREE.DoubleSide,
			// blending: THREE.AdditiveBlending,
			blending: THREE.CustomBlending,
		});

		this.material.blendSrc = THREE.SrcAlphaFactor;
		this.material.blendDst = THREE.OneMinusSrcColorFactor;
		this.material.blendEquation = THREE.AddEquation;

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		return this.mesh;
	}

	destroy()
	{
		this.off();
	}

	update(parentPosition, position, breezeStrength)
	{
		// breezeStrength = 1;
		var time = performance.now() * 0.01;
		this.material.uniforms.time.value = time;

		var count = 0;

		for (var i = 0, l = this.translate.length; i < l; i += 3)
		{
			var ox = this.translate[i] + parentPosition.x;
			var oz = this.translate[i + 2] + parentPosition.z;

			var index = i / 3;
			// perf constraints
			if(oz > 3000 && oz < 4000 && ox > -2000 && ox < 2000)
			{
				// count++;

				this._v3.x = ox;
				this._v3.y = this.translate[i + 1];
				this._v3.z = oz;

				this._v3.project(this.camera); // cpu intensive, limit that call

				if(this._v3.z > 0.95) this._v3.z = 0.95;

				var dx = this._v3.x - position.x;
				var dy = this._v3.y - position.y;
				var d = (dx * dx + dy * dy);
				var dmax = breezeStrength * this._scale * (1 - this._v3.z);
				// if(!this.reactToMouse) dmax *= 2;

				if(this.power[index] < 1.2 && d > 0 && d < dmax)
				{
					var power = this.power[index];
					var blown = this.blown[index];
					if(blown)
						power += (1.2 - power) * 0.1;
					else
						power += (1.2 - d / dmax - power) * 0.3;

					if(power >= 1 && !blown)
					{
						this.blown[index] = true;
						this.emit("blown");
					}

					this.power[index] = power;
				}
				else if(!this.blown[index]) // reset if not blown completely
				{
					this.power[index] += (0 - this.power[index]) * 0.1;
				}

				// this.power[index] = 1;
			}
			else if(this.blown[index] /*&& oz > 4000*/) // reset
			{
				this.power[index] = 0;
				this.blown[index] = false;
			}
		}
		
		this.geometry.attributes.power.needsUpdate = true;
	}

	/**
	 * shift flames from a tile to another
	 */
	shift(from, to)
	{
		for (var i = 0, l = this.count/4; i < l; i++)
		{
			var fromIndex = i + from * l;
			var toIndex = i + to * l;

			// save from state
			var ox = this.translate[fromIndex * 3];
			// var oy = this.translate[fromIndex * 3 + 1];
			var oz = this.translate[fromIndex * 3 + 2];
			var power = this.power[fromIndex];
			var blown = this.blown[fromIndex];
			var timeInits = this.timeInits[fromIndex];

			// set from state
			this.translate[fromIndex] = this.translate[toIndex * 3];
			// this.translate[fromIndex + 1] = this.translate[toIndex * 3 + 1];
			this.translate[fromIndex + 2] = this.translate[toIndex * 3 + 2];
			this.power[fromIndex] = this.power[toIndex];
			this.blown[fromIndex] = this.blown[toIndex];
			this.timeInits[fromIndex] = this.timeInits[toIndex];

			// set to state
			this.translate[toIndex] = ox;
			// this.translate[toIndex + 1] = oy;
			this.translate[toIndex + 2] = oz;
			this.power[toIndex] = power;
			this.blown[toIndex] = blown;
			this.timeInits[toIndex] = timeInits;
		}
	}

	resize()
	{
		// TODO scale ratio for breeze radius

		this._scale = Stage.height / 450;
		// console.log("Flames", Stage.height, Stage.dpr, this._scale);
	}
}