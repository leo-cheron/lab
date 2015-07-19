"use strict";

var THREE = require("lib/three/Three");

var copyVs = require("./shaders/copyVs.glsl");
var copyFs = require("./shaders/copyFs.glsl");

var positionFs = require("./shaders/positionFs.glsl");


/**
 * DoubleFBO
 * @constructor
 */
var DoubleFBO = module.exports = function(width, renderer, textureInput)
{
	this._width = width;
	this._particles = width * width;
	this._renderer = renderer;
	this._scene = new THREE.Scene();
	this._camera = new THREE.Camera();
	this._camera.position.z = 1;
	this._textureInput = textureInput;

	this._pingPong = true;

	this.init();
};

DoubleFBO.prototype = 
{
	init: function()
	{
		var gl = this._renderer.getContext();

		//TODO manage errors
		if(!gl.getExtension( "OES_texture_float" )) 
		{
			alert( "No OES_texture_float support for float textures!" );
			return;
		}
		if(gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) 
		{
			alert( "No support for vertex shader textures!" );
			return;
		}

		// Create position textures
		this._dtPosition = this._initPositionTexture();

		this._rtPosition1 = this.getRenderTarget(THREE.RGBAFormat, this._width, this._width);
		this._rtPosition2 = this._rtPosition1.clone();

		// Shaders
		this._copyShader = new THREE.ShaderMaterial( 
		{
			uniforms: 
			{
				uTexture: { type: "t", value: null }
			},
			vertexShader: copyVs(),
			fragmentShader: copyFs(),
			depthTest: false
		});

		this.positionShader = new THREE.ShaderMaterial( 
		{
			uniforms: 
			{
				uResolutionInput: { type: "v2", value: new THREE.Vector2(this._textureInput.image.width, this._textureInput.image.height) },
				uResolutionOutput: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
				
				uTexturePosition: { type: "t", value: null },
				uTexturePositionInit: { type: "t", value: this._dtPosition},
				uTextureInput: { type: "t", value: this._textureInput },
				uTextureOutput: { type: "t", value: null },

				uStrength: { type: "f", value: null },
				uFrictions: { type: "f", value: null },
				uSpring: { type: "f", value: null },
				uVelocityMax: { type: "f", value: null },
				uAttraction: { type: "f", value: null },
				uResetStacked: { type: "i", value: null },
				uStackSensibility: { type: "f", value: null },
				uRepulsion: { type: "i", value: null },
				uRepulsionStrength: { type: "f", value: null },
				uRepulsionSensibility: { type: "f", value: null },
				// uRepulsionRadius: { type: "f", value: null },
				uInvert: { type: "i", value: null },

				uThreshold: { type: "f", value: 0.25 },
		 		uSmoothness: { type: "f", value: 0.3 },
		 		uMapStrength: { type: "f", value: 0.1 }
			},
			vertexShader: copyVs(),
			fragmentShader: positionFs(),
			depthTest: false
		});

		// Mesh
		this._mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this._copyShader);
		this._scene.add(this._mesh);
		
		// Init position		
		this._renderTexture(this._dtPosition, this._rtPosition1);
		//this._renderTexture(this._rtPosition1, this._rtPosition2);
	},

	render: function()
	{
		this._renderShader(this._rtPosition1, this._rtPosition2);
		
		if (this._pingPong)
			this._renderShader(this._rtPosition1, this._rtPosition2);
		else 
			this._renderShader(this._rtPosition2, this._rtPosition1);

		this._pingPong = !this._pingPong;
	},

	resize: function(width, height)
	{
		this.positionShader.uniforms.uResolutionOutput.value.x = width;
		this.positionShader.uniforms.uResolutionOutput.value.y = height;

		this.positionShader.uniforms.uResolutionInput.value.x = width;
		this.positionShader.uniforms.uResolutionInput.value.y = height;
	},

	getRenderTarget: function(type, width, height) 
	{
		var renderTarget = new THREE.WebGLRenderTarget(width, height, 
		{
			// wrapS: THREE.ClampToEdgeWrapping,
			// wrapT: THREE.ClampToEdgeWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: type,
			type: THREE.FloatType,
			stencilBuffer: false
		});
		renderTarget.generateMipmaps = false;

		return renderTarget;
	},

	//-----------------------------------------------------o private

	_renderTexture: function(input, output) 
	{
		this._mesh.material = this._copyShader;

		this._copyShader.uniforms.uTexture.value = input;

		this._renderer.render(this._scene, this._camera, output);
	},

	_renderShader: function(input, output)
	{
		this._mesh.material = this.positionShader;

		this.positionShader.uniforms.uTexturePosition.value = input;

		this._renderer.render(this._scene, this._camera, output);
	},

	_initPositionTexture: function() 
	{
		var entries = 4;
		var a = new Float32Array(this._particles * entries);

		var l = a.length;
		//var rand = 1 / l;

		for (var i = 0; i < l; i += entries)
		{
			var x = (Math.random() * this._textureInput.image.width) / this._textureInput.image.width;
			var y = (Math.random() * this._textureInput.image.height) / this._textureInput.image.height;
			//var x = ((i/entries) % this._width) / this._width + (Math.random() - 0.5) * rand;
			//var y = ((i/entries | 0) / this._width) / this._width + (Math.random() - 0.5) * rand;

			var ratio = 0.001;
			var vx = (Math.random() - 0.5) * ratio;
			var vy = (Math.random() - 0.5) * ratio;

			a[ i + 0 ] = x; //* 2 - 1;
			a[ i + 1 ] = y; //* 2 - 1;
			a[ i + 2 ] = vx;
			a[ i + 3 ] = vy;
		}

		var texture = new THREE.DataTexture(a, this._width, this._width, THREE.RGBAFormat, THREE.FloatType);
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		texture.flipY = false;

		return texture;
	}	
};