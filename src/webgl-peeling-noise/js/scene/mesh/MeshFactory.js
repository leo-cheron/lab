import THREE from "lib/three/three";
// import Wireframe from "lib/three/extras/helpers/WireframeHelper";
import MainShaderMaterial from "../materials/MainShaderMaterial";
import WireframeShaderMaterial from "../materials/WireframeShaderMaterial";
import MainVsDepth from "../shaders/MainVs_depth.glsl";
import MainVs from "../shaders/MainVs_depth.glsl";

export default class MeshFactory
{
	constructor(model)
	{
		this._model = model;

		this._loader = new THREE.JSONLoader(true);

		this._geometries = [];
	}

	load(src, callback, type)
	{
		if(this._geometries[src]) 
			callback(this._geometries[src]);
		else
			this._loader.load(src, (geometry) =>
			{
				console.log("Mesh vertices:", geometry.vertices.length);

				this._geometries[src] = geometry;

				this.material = new MainShaderMaterial(
				{ 
					diffuse: new THREE.Color(this._model.meshColor),
					specular: new THREE.Color(this._model.meshSpecular),
					shininess: 10,
					wireframe: false,
					shading: THREE.FlatShading,
					// side: THREE.SingleSide,
					side: THREE.DoubleSide,
					lights: true,
					// depthTest: false,
					transparent: false,
					// fogNear: this._model.fogNear,
					// fogFar: this._model.fogFar,
					fogColor: new THREE.Color(this._model.backgroundColor),
				});
				
				var g = this.split(geometry);
				var mesh = new THREE.Mesh(g, this.material);
				// mesh.castShadow = true;
				// mesh.receiveShadow = true;
				// mesh.splitted = this.split(geometry);

				// custom shadowmap
				// mesh.customDepthMaterial = new THREE.ShaderMaterial(
				// {
				// 	vertexShader: this.material.vertexShaderDepth,
				// 	fragmentShader: THREE.ShaderLib.depthRGBA.fragmentShader,
				// 	uniforms: this.material.uniforms
				// });

				// var material = new THREE.LineBasicMaterial( { color: this._model.wireframeColor } );
				// var wireframeMaterial = new WireframeShaderMaterial({ color: this._model.wireframeColor });
				var wireframeMaterial = new WireframeShaderMaterial(
				{ 
					diffuse: new THREE.Color(this._model.wireframeColor),
					// specular: new THREE.Color(this._model.meshSpecular),
					// shininess: 0,
					wireframe: true,
					shading: THREE.FlatShading,
					side: THREE.DoubleSide,
					lights: false,
					// depthTest: false,
					wireframeLinewidth: 1,
					transparent: true,
					opacity: this._model.wireframeOpacity,
					fogColor: new THREE.Color(this._model.backgroundColor),
				});
				mesh.wireframe = new THREE.Mesh(g, wireframeMaterial);
				// mesh.wireframe = new THREE.Mesh(g, wireframeMaterial);
				// mesh.wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireframeMaterial);
				mesh.wireframe.matrix = mesh.matrixWorld;
				mesh.wireframe.matrixAutoUpdate = false;
				// mesh.wireframe.material.linewidth = this._model.wireframeLineWidth;
				// mesh.wireframe.material.transparent = true;
				// mesh.wireframe.material.opacity = 0;

				callback(mesh, type);
			});
	}

	split(fromGeometry)
	{
		var length = fromGeometry.faces.length;

		var geometry = new THREE.InstancedBufferGeometry();
		var vertices = new THREE.BufferAttribute(new Float32Array(length * 3 * 3), 3);
		var speed = new THREE.BufferAttribute(new Float32Array(length * 3), 1);
		var centroids = new THREE.BufferAttribute(new Float32Array(length * 3 * 3), 3);

		var centroid = new THREE.Vector3();
		var rand = new THREE.Vector3();
		var excludes = [
			fromGeometry.vertices[fromGeometry.vertices.length / 3 | 0],
			fromGeometry.vertices[fromGeometry.vertices.length * 2 / 3 | 0],
			fromGeometry.vertices[fromGeometry.vertices.length * 3 / 4 | 0]
		];
		for (var i = 0; i < length; ++i)
		{
			let face = fromGeometry.faces[i];
			let v0 = fromGeometry.vertices[face.a];
			let v1 = fromGeometry.vertices[face.b];
			let v2 = fromGeometry.vertices[face.c];
			
			var delta = 30;
			rand.set(Math.random() * delta - Math.random() * delta, Math.random() * delta - Math.random() * delta, Math.random() * delta - Math.random() * delta);
			centroid.set(0,0,0)
				.add(v0)
				.add(v1)
				.add(v2)
				.add(rand)
				.divideScalar(3);

			// var cont = false;
			// for (var k = 0, l = excludes.length; k < l; ++k)
			// {
			// 	if(excludes[k].distanceTo(centroid) < 100) 
			// 	{
			// 		cont = true;
			// 		break;
			// 	}
			// }
			// if(cont) continue;

			let s = Math.random() * 1;
			let j = i * 3;

			speed.setX(j, s);
			speed.setX(j + 1, s);
			speed.setX(j + 2, s);

			centroids.setXYZ(j, centroid.x, centroid.y, centroid.z);
			centroids.setXYZ(j + 1, centroid.x, centroid.y, centroid.z);
			centroids.setXYZ(j + 2, centroid.x, centroid.y, centroid.z);

			vertices.setXYZ(j, v0.x, v0.y, v0.z);
			vertices.setXYZ(j + 1, v1.x, v1.y, v1.z);
			vertices.setXYZ(j + 2, v2.x, v2.y, v2.z);
		}

		geometry.addAttribute('speed', speed);
		geometry.addAttribute('position', vertices);
		geometry.addAttribute('centroid', centroids);
		geometry.computeVertexNormals();

		return geometry;
	}

	split3(fromGeometry)
	{
		var length = fromGeometry.faces.length;
		var sub = 3;

		var geometry = new THREE.InstancedBufferGeometry();
		var vertices = new THREE.BufferAttribute(new Float32Array(length * 3 * 3 * sub), 3);
		var speed = new THREE.BufferAttribute(new Float32Array(length * 3 * sub), 1);
		var centroids = new THREE.BufferAttribute(new Float32Array(length * 3 * 3 * sub), 3);

		var centroid = new THREE.Vector3();
		var cp = new THREE.Vector3();
		var rand = new THREE.Vector3();
		for (var i = 0; i < length; ++i)
		{
			let face = fromGeometry.faces[i];
			let a = fromGeometry.vertices[face.a];
			let b = fromGeometry.vertices[face.b];
			let c = fromGeometry.vertices[face.c];
			let faceVerts = [a, b, c];
			let j = i * 3 * sub;

			var delta = 10;
			rand.set(Math.random() * delta - Math.random() * delta, Math.random() * delta - Math.random() * delta, Math.random() * delta - Math.random() * delta);
			centroid.set(0,0,0).add(a).add(b).add(c).divideScalar(3).add(rand);// 

			for (var k = 0; k < sub; ++k)
			{
				let currentVert = faceVerts[k];
				let k3 = k * 3;

				let v1 = currentVert == a ? centroid : a;
				let v2 = currentVert == b ? centroid : b;
				let v3 = currentVert == c ? centroid : c;

				cp.set(0,0,0).add(v1).add(v2).add(v3).divideScalar(3);

				vertices.setXYZ(j + k3, v1.x, v1.y, v1.z);
				vertices.setXYZ(j + 1 + k3, v2.x, v2.y, v2.z);
				vertices.setXYZ(j + 2 + k3, v3.x, v3.y, v3.z);

				centroids.setXYZ(j + k3, cp.x, cp.y, cp.z);
				centroids.setXYZ(j + 1 + k3, cp.x, cp.y, cp.z);
				centroids.setXYZ(j + 2 + k3, cp.x, cp.y, cp.z);

				let s = Math.random();
				speed.setX(j + k3, s);
				speed.setX(j + 1 + k3, s);
				speed.setX(j + 2 + k3, s);
			}
		}

		geometry.addAttribute('speed', speed);
		geometry.addAttribute('position', vertices);
		geometry.addAttribute('centroid', centroids);
		geometry.computeVertexNormals();

		return geometry;
	}

	build(type, callback)
	{
		switch(type)
		{
			case MeshFactory.TYPE_BOX:
				// callback(new THREE.Mesh(new THREE.SphereGeometry(512, 8, 8), this.material));
				// callback(new THREE.Mesh(new THREE.PlaneGeometry( 500, 500, 1 ), this.material));
				// callback(new THREE.Mesh(new THREE.OctahedronGeometry( 500, 1), this.material));
				// callback(new THREE.Mesh(new THREE.DodecahedronGeometry( 500, 1), this.material));

				// var geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
				// var geometry = new THREE.BoxGeometry(512, 512, 512);
				var geometry = new THREE.TorusKnotGeometry(400, 100, 100, 16);
				// var geometry = new THREE.TorusGeometry(400, 100, 3, 3);
				// var geometry = new THREE.OctahedronGeometry(500, 1);

				// geometry.computeVertexNormals();
				// geometry = this.split(geometry);

				var mesh = new THREE.Mesh(geometry, this.material);
				mesh.castShadow = true;
				mesh.receiveShadow = true;

				// custom shadowmap
				// mesh.customDepthMaterial = new THREE.ShaderMaterial(
				// {
				// 	vertexShader: this.material.vertexShaderDepth,
				// 	fragmentShader: THREE.ShaderLib.depthRGBA.fragmentShader,
				// 	uniforms: this.material.uniforms
				// });

				callback(mesh);
				break;
			
			case MeshFactory.TYPE_BED:
				this.load("mesh/b-branding.js", callback, type);
				break;

			case MeshFactory.TYPE_BRICKELL:
				this.load("mesh/b-digital.js", callback, type);
				break;
			
			case MeshFactory.TYPE_CREST:
				this.load("mesh/b-print.js", callback, type);
				break;

			case MeshFactory.TYPE_CUPS:
				this.load("mesh/b-social.js", callback, type);
				break;
			
			case MeshFactory.TYPE_EAGLE:
				this.load("mesh/b-strategy.js", callback, type);
				break;

			case MeshFactory.TYPE_EASEL:
				this.load("mesh/b-video-production.js", callback, type);
				break;
		}
	}
}

MeshFactory.TYPE_BED = "TYPE_BED";
MeshFactory.TYPE_BRICKELL = "TYPE_BRICKELL";
MeshFactory.TYPE_CREST = "TYPE_CREST";
MeshFactory.TYPE_CUPS = "TYPE_CUPS";
MeshFactory.TYPE_EAGLE = "TYPE_EAGLE";
MeshFactory.TYPE_EASEL = "TYPE_EASEL";
MeshFactory.TYPE_HELMET = "TYPE_HELMET";
MeshFactory.TYPE_HORN = "TYPE_HORN";
MeshFactory.TYPE_MUSE = "TYPE_MUSE";
MeshFactory.TYPE_MAP = "TYPE_MAP";
MeshFactory.TYPE_SCROLL = "TYPE_SCROLL";
MeshFactory.TYPE_SWORDS = "TYPE_SWORDS";
