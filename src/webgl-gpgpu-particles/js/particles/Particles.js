"use strict";

var THREE = require("lib/three/Three");
var DoubleFBO = require("./DoubleFBO");
var ParticlesModel = require("./ParticlesModel");
var ParticlesGeometry = require("./ParticlesGeometry");

var particlesVs = require("./shaders/particlesVs.glsl");
var particlesFs = require("./shaders/particlesFs.glsl");


/**
 * Particles
 * @constructor
 */
var Particles = module.exports = function($dom)
{
	this.$dom = $dom;

	this.init();
};

Particles.prototype =
{
	init: function()
	{
		this._initScene();
	},

	_initScene: function()
	{
		this._canvas = document.createElement("canvas");
		this._context = this._canvas.getContext("2d");

		this._sceneRender = new THREE.Scene();
		this._scene = new THREE.Scene();

		this._renderCamera = new THREE.Camera();
		this._renderCamera.position.z = 1;

		this._textureInput = new THREE.Texture(this._canvas);
		this._textureInput.generateMipmaps = false;
		this._textureInput.anisotropy = 0;
		this._textureInput.needsUpdate = true;
		this._textureInput.minFilter = THREE.NearestFilter;
		this._textureInput.wrapS = THREE.ClampToEdgeWrapping;
		this._textureInput.wrapT = THREE.ClampToEdgeWrapping;

		this._renderer = new THREE.WebGLRenderer({ alpha: true/*, preserveDrawingBuffer: true*/ });
		//this._renderer.autoClear = false;
		this._renderer.sortObjects = false;
		this._renderer.domElement.setAttribute("id", "canvas");
		this.$dom.appendChild(this._renderer.domElement);
		
		if(!this._renderer.context)
		{
			//TODO error / fallback
			return;
		}

		var geometry = new THREE.ParticlesGeometry(Config.TEXTURE_WIDTH);

		this._uniforms = 
		{
			uTexturePosition: { type: "t", value: null },

			uPointSize: { type: "f", value: 1 },
			uAlpha: { type: "f", value: null },
			uColor: { type: "c", value: null },
		};
		
		var material = new THREE.ShaderMaterial(
		{
			uniforms: this._uniforms,
			vertexShader: particlesVs(),
			fragmentShader: particlesFs(),
			depthWrite: false,
			depthTest: false,
			transparent: true
		});

		var mesh = new THREE.PointCloud(geometry, material);
		this._sceneRender.add(mesh);
		
		this._copyMaterial = new THREE.MeshBasicMaterial( { map: null, depthTest: false, depthWrite: false } );
		this._copyMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this._copyMaterial);
		this._scene.add(this._copyMesh);

		// Double fbo management
		this._doubleFBO = new DoubleFBO(Config.TEXTURE_WIDTH, this._renderer, this._textureInput);

		// Controller
		this._particlesModel = new ParticlesModel();
		$(this._particlesModel).on("change", $.proxy(this._onControllerChange, this));
		this._onControllerChange();

		this.resize();
		
		console.log("Running " + Config.TEXTURE_WIDTH * Config.TEXTURE_WIDTH + " particles");
	},

	destroy: function()
	{
	},

	update: function()
	{
		if(this._doubleFBO && this._rtOutput)
		{
			if(this.needsUpdate || this.autoUpdate)
			{
				this.needsUpdate = false;

				var ww = window.innerWidth,
					wh = window.innerHeight,
					x, y, w, h;

				var r = this._texture.width / this._texture.height;
				var wr = ww / wh;
				if(wr < r)
				{
					h = wh;
					w = h * r;
					
					x = (ww - w) * 0.5;
					y = 0;
				}
				else
				{
					w = ww;
					h = w / r;
					
					x = 0;
					y = (wh - h) * 0.5;
				}

				this._context.drawImage(this._texture, x, y, -w, h);
				this._textureInput.needsUpdate = true;
			}

			this._doubleFBO.render();

			//this._renderer.render(this._sceneRender, this._renderCamera);
			
			this._renderer.render(this._sceneRender, this._renderCamera, this._rtOutput);
			this._renderer.render(this._scene, this._renderCamera);
		}
	},

	resize: function()
	{
		if(this._doubleFBO)
		{
			this._width = window.innerWidth;// > Config.MAX_SCREEN_WIDTH ? Config.MAX_SCREEN_WIDTH : window.innerWidth;
			this._height = window.innerHeight;
			// this._width = 498;
			// this._height = 374;

			this._canvas.width = this._width;
			this._canvas.height = this._height;

			this._context.scale(-1, 1);
			
			this._doubleFBO.resize(this._width, this._height);

			// var rw = this._textureWidth / this._width;
			// var rh = this._textureHeight / this._height;

			this._renderer.setSize(this._width, this._height);

			if(this._resizeTimer) 
				clearTimeout(this._resizeTimer);
			
			if(!this._rtOutput)
				this._resetRenderTarget();
			else
			{
				var that = this;
				this._resizeTimer = setTimeout(function()
				{
					that._resetRenderTarget();
				}, 50);
			}

			if(this._texture)
				this.needsUpdate = true;
		}
	},

	setTexture: function(dom, autoUpdate)
	{
		this._texture = dom;
		this.needsUpdate = true;
		this.autoUpdate = Boolean(autoUpdate);
	},

	//-----------------------------------------------------o private

	_resetRenderTarget: function()
	{
		if(this._rtOutput)
			this._rtOutput.dispose();
		this._rtOutput = new THREE.WebGLRenderTarget(this._width, this._height, 
		{ 
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping, 
			minFilter: THREE.NearestFilter, 
			magFilter: THREE.NearestFilter, 
			format: THREE.RGBAFormat, 
			type: THREE.FloatType, 
			stencilBuffer: false, 
			anisotropy: 0, 
			depthBuffer: false 
		});
		this._rtOutput.generateMipmaps = false;
		this._copyMaterial.map = this._rtOutput;
		this._doubleFBO.positionShader.uniforms.uTextureOutput.value = this._rtOutput;
	},

	//-----------------------------------------------------o controller handler

	_onControllerChange: function()
	{
		var data = this._particlesModel.data;

		document.getElementById("canvas").style.backgroundColor = data.bgColor;
		
		this._uniforms.uPointSize.value = data.pointSize;
		this._uniforms.uAlpha.value = data.alpha;
		this._uniforms.uColor.value = new THREE.Color(data.particlesColor);

		this._doubleFBO.positionShader.uniforms.uFrictions.value = 1 - data.frictions;
		this._doubleFBO.positionShader.uniforms.uStrength.value = data.mapStrength;
		this._doubleFBO.positionShader.uniforms.uSpring.value = data.spring;
		this._doubleFBO.positionShader.uniforms.uVelocityMax.value = data.velocityMax;
		this._doubleFBO.positionShader.uniforms.uAttraction.value = data.initialAttraction;
		this._doubleFBO.positionShader.uniforms.uResetStacked.value = data.resetStacked ? 1 : 0;
		this._doubleFBO.positionShader.uniforms.uStackSensibility.value = data.stackSensibility;
		this._doubleFBO.positionShader.uniforms.uRepulsion.value = data.repulsion ? 1 : 0;
		this._doubleFBO.positionShader.uniforms.uRepulsionStrength.value = data.repulsionStrength;
		this._doubleFBO.positionShader.uniforms.uRepulsionSensibility.value = data.repulsionSensibility;
		// this._doubleFBO.positionShader.uniforms.uRepulsionRadius.value = data.repulsionRadius;
		this._doubleFBO.positionShader.uniforms.uThreshold.value = data.threshold;
		this._doubleFBO.positionShader.uniforms.uSmoothness.value = data.smoothness;
		this._doubleFBO.positionShader.uniforms.uMapStrength.value = data.strength;
		this._doubleFBO.positionShader.uniforms.uInvert.value = data.inverted ? 0 : 1;
	}
};