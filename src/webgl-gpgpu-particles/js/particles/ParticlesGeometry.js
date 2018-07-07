import * as THREE from "lib/three/three";

/**
 * ParticlesGeometry
 * @constructor
 */
export default class ParticlesGeometry extends THREE.BufferGeometry
{
	constructor(width)
	{
		super();

		this.width = width;
		this.n = width * width;
	
		this.init();
	}

	init()
	{
		this.positions = new Float32Array(this.n * 3);
		this.uvs = new Float32Array(this.n * 2);
		for (let i = 0, l = this.n * 3; i < l; i += 3) 
		{
			const entries = 3;
			const index = i / entries | 0;

			const u = (index % this.width) / this.width;
			const v = (index / this.width | 0) / this.width;
			const z = 0;

			const i3 = index * entries;
			this.positions[i3] = u;
			this.positions[i3 + 1] = v;
			this.positions[i3 + 2] = z;
		}

		this.addAttribute("uv", new THREE.Float32BufferAttribute(this.uvs, 2));
		this.addAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
	}
};