var THREE = require("lib/three/three");
var Stage = require("lib/anonymous/core/Stage");

/**
 * @author Slayvin / http://slayvin.net
 */

// THREE.ShaderLib['mirror'] = {

// 	uniforms: { "mirrorColor": { type: "c", value: new THREE.Color(0x7F7F7F) },
// 				"mirrorSampler": { type: "t", value: null },
// 				"uTextureMatrix": { type: "m4", value: new THREE.Matrix4() }
// 	},

// 	vertexShader: [

// 		"uniform mat4 uTextureMatrix;",

// 		"varying vec4 vMirrorCoord;",

// 		"void main() {",

// 			"vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
// 			"vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
// 			"vMirrorCoord = uTextureMatrix * worldPosition;",

// 			"gl_Position = projectionMatrix * mvPosition;",

// 		"}"

// 	].join("\n"),

// 	fragmentShader: [

// 		"uniform vec3 mirrorColor;",
// 		"uniform sampler2D mirrorSampler;",

// 		"varying vec4 vMirrorCoord;",

// 		"float blendOverlay(float base, float blend) {",
// 			"return(base < 0.5 ? (2.0 * base * blend ) : (1.0 - 2.0 * (1.0 - base ) * (1.0 - blend ) ));",
// 		"}",
		
// 		"void main() {",

// 			"vec4 color = texture2DProj(mirrorSampler, vMirrorCoord);",
// 			"color = vec4(blendOverlay(mirrorColor.r, color.r), blendOverlay(mirrorColor.g, color.g), blendOverlay(mirrorColor.b, color.b), 1.0);",

// 			"gl_FragColor = color;",

// 		"}"

// 	].join("\n")

// };

THREE.Mirror = module.exports = function (renderer, camera, options) 
{
	THREE.Object3D.call(this);

	this.name = 'mirror_' + this.id;

	options = options || {};

	this.matrixNeedsUpdate = true;

	var width = options.textureWidth !== undefined ? options.textureWidth : Stage.width * 2 | 0;
	var height = options.textureHeight !== undefined ? options.textureHeight : Stage.height * 2 | 0;

	this.clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;

	var mirrorColor = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(0x7F7F7F);

	this.renderer = renderer;
	this.mirrorPlane = new THREE.Plane();
	this.normal = new THREE.Vector3(0, 0, 1);
	this.mirrorWorldPosition = new THREE.Vector3();
	this.cameraWorldPosition = new THREE.Vector3();
	this.rotationMatrix = new THREE.Matrix4();
	this.lookAtPosition = new THREE.Vector3(0, 0, -1);
	this.clipPlane = new THREE.Vector4();
	
	// For debug only, show the normal and plane of the mirror
	var debugMode = options.debugMode !== undefined ? options.debugMode : false;

	if (debugMode )
	{
		var arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 10, 0xffff80);
		var planeGeometry = new THREE.Geometry();
			planeGeometry.vertices.push(new THREE.Vector3(-10, -10, 0));
			planeGeometry.vertices.push(new THREE.Vector3(10, -10, 0));
			planeGeometry.vertices.push(new THREE.Vector3(10, 10, 0));
			planeGeometry.vertices.push(new THREE.Vector3(-10, 10, 0));
			planeGeometry.vertices.push(planeGeometry.vertices[0]);
		var plane = new THREE.Line(planeGeometry, new THREE.LineBasicMaterial({ color: 0xffff80 } ));

		this.add(arrow);
		this.add(plane);
	}

	if (camera instanceof THREE.PerspectiveCamera )
		this.camera = camera;
	else
	{
		this.camera = new THREE.PerspectiveCamera();
		console.log(this.name + ': camera is not a Perspective Camera!');
	}

	this.textureMatrix = new THREE.Matrix4();

	this.mirrorCamera = this.camera.clone();
	// this.mirrorCamera.fov = 90;
	this.mirrorCamera.zoom = 0.4; // TODO
	this.mirrorCamera.matrixAutoUpdate = true;
	console.log("Mirror", this.mirrorCamera.zoom, width, height);

	// console.log("Mirror", width, height);
	this.texture = new THREE.WebGLRenderTarget(width, height, 
	{
		generateMipmaps: false,
		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBFormat,
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		// wrapS: THREE.RepeatWrapping,
		// wrapT: THREE.RepeatWrapping,
	});

	// this.texture2 = this.texture.clone();

	//if (!THREE.Math.isPowerOfTwo(width) || !THREE.Math.isPowerOfTwo(height ) ) {

	// }

	// var mirrorShader = THREE.ShaderLib['mirror'];
	// var mirrorUniforms = THREE.UniformsUtils.clone(mirrorShader.uniforms);

	// this.material = new THREE.ShaderMaterial({

	// 	fragmentShader: mirrorShader.fragmentShader,
	// 	vertexShader: mirrorShader.vertexShader,
	// 	uniforms: mirrorUniforms

	// });

	// this.material.uniforms.mirrorSampler.value = this.texture;
	// this.material.uniforms.mirrorColor.value = mirrorColor;
	// this.material.uniforms.uTextureMatrix.value = this.textureMatrix;

	this.updateTextureMatrix();
	this.render();
};

THREE.Mirror.prototype = Object.create(THREE.Object3D.prototype);
THREE.Mirror.prototype.constructor = THREE.Mirror;

THREE.Mirror.prototype.updateTextureMatrix = function () 
{
	this.updateMatrixWorld();
	this.camera.updateMatrixWorld();

	this.mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld);
	this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

	this.rotationMatrix.extractRotation(this.matrixWorld);

	this.normal.set(0, 0, 1);
	this.normal.applyMatrix4(this.rotationMatrix);

	var view = this.mirrorWorldPosition.clone().sub(this.cameraWorldPosition);
	view.reflect(this.normal ).negate();
	view.add(this.mirrorWorldPosition);

	this.rotationMatrix.extractRotation(this.camera.matrixWorld);

	this.lookAtPosition.set(0, 0, -1);
	this.lookAtPosition.applyMatrix4(this.rotationMatrix);
	this.lookAtPosition.add(this.cameraWorldPosition);

	var target = this.mirrorWorldPosition.clone().sub(this.lookAtPosition);
	target.reflect(this.normal).negate();
	target.add(this.mirrorWorldPosition);

	this.up.set(0, -1, 0);
	this.up.applyMatrix4(this.rotationMatrix);
	this.up.reflect(this.normal ).negate();

	this.mirrorCamera.position.copy(view);
	this.mirrorCamera.up = this.up;
	this.mirrorCamera.lookAt(target);

	this.mirrorCamera.updateProjectionMatrix();
	this.mirrorCamera.updateMatrixWorld();
	this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);

	// Update the texture matrix
	this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
						   0.0, 0.5, 0.0, 0.5,
						   0.0, 0.0, 0.5, 0.5,
						   0.0, 0.0, 0.0, 1.0);
	this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
	this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

	// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
	// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
	this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
	this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

	this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

	var q = new THREE.Vector4();
	var projectionMatrix = this.mirrorCamera.projectionMatrix;

	q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
	q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
	q.z = -1.0;
	q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

	// Calculate the scaled plane vector
	var c = new THREE.Vector4();
	c = this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(q));

	// Replacing the third row of the projection matrix
	projectionMatrix.elements[2] = c.x;
	projectionMatrix.elements[6] = c.y;
	projectionMatrix.elements[10] = c.z + 1.0 - this.clipBias;
	projectionMatrix.elements[14] = c.w;
};

THREE.Mirror.prototype.render = function () 
{
	if(this.matrixNeedsUpdate) 
		this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	var scene = this;

	while(scene.parent)
		scene = scene.parent;

	if(scene && scene instanceof THREE.Scene) 
	{
		// Render the mirrored view of the current scene into the target texture
		this.renderer.render(scene, this.mirrorCamera, this.texture, true);
	}
};