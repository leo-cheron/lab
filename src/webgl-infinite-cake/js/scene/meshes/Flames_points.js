import FlameVs from "../shaders/FlameVs.glsl";
import FlameFs from "../shaders/FlameFs.glsl";
import THREE from "lib/three/three";
import Stage from "lib/anonymous/core/Stage";

export default class Flame
{
	constructor(scene, count)
	{
		this.scene = scene;
		this.positions = new Float32Array(count * 3);
		this.timeInits = new Float32Array(count);
		this.strengths = new Float32Array(count);

		this._i = 0;
		this._v3 = new THREE.Vector3();
	}

	add(x, y, z)
	{
		this.positions[this._i]     = x;
		this.positions[this._i + 1] = y;
		this.positions[this._i + 2] = z;

		var i3 = this._i / 3;
		this.timeInits[i3] = Math.random() * 10;
		this.strengths[i3] = 1.0;
		
		this._i += 3;
	}

	init()
	{
		this.geometry = new THREE.BufferGeometry();
		this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		this.geometry.addAttribute('timeInit', new THREE.BufferAttribute(this.timeInits, 1));
		this.geometry.addAttribute('strength', new THREE.BufferAttribute(this.strengths, 1).setDynamic(true));
		// this.geometry.computeBoundingSphere();

		// material
		this.material = new THREE.RawShaderMaterial(
		{
			uniforms: 
			{
				time: {type: "f", value: 0.0},
				scale: {type: "f", value: 0.0},
				fogColor: {type: "c", value: this.scene.fog ? this.scene.fog.color : null},
				fogNear: {type: "f", value: this.scene.fog ? this.scene.fog.near : 0},
				fogFar: {type: "f", value: this.scene.fog ? this.scene.fog.far : 100000}
			},
			vertexShader: FlameVs(), 
			fragmentShader: FlameFs(),
			fog: true,
			depthWrite: false,
			transparent: false,
			blending: THREE.AdditiveBlending,
		});

		if(false)
		{
			this.particleSystem = new THREE.Points(this.geometry, this.material);
		}
		else
		{
			this.geometry.addAttribute( 'position', vertices );

			var vertices = new THREE.BufferAttribute( new Float32Array( 
				[
					// face
					-1,  1,  1,
					 1,  1,  1,
					-1, -1,  1,
					 1, -1,  1
				]}
		}

		return this.particleSystem;
	}

	update(parentPosition, projection)
	{
		var time = performance.now() * 0.001;
		this.particleSystem.material.uniforms.time.value = time;

		const r = 400;

		var strengthsAttr = this.geometry.attributes.strength,
			strengthsNeedsUpdate = false;

		// check cursor position
		for (var i = 0, l = this.positions.length; i < l; i += 3)
		{
			this._v3.x = this.positions[i] + parentPosition.x;
			this._v3.y = this.positions[i + 1];
			this._v3.z = this.positions[i + 2] + parentPosition.z;

			// perf constraints
			// if(z > projection.z - r)

			// this.positions[i] = Math.random() * 200;
			var d = this._v3.distanceTo(projection);
			if(d <= r)
			{
				strengthsNeedsUpdate = true;

				// strengthsAttr.updateRange.offset = i / 3; // where to start updating
				// strengthsAttr.updateRange.count = 1;  // how many vertices to update

				// console.log("Flames in sight", d);
			}

			// console.log("Flames", projection, x, y, z);
		}

		strengthsAttr.needsUpdate = strengthsNeedsUpdate;
	}
}