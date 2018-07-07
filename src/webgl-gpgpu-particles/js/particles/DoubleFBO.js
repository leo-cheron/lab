import * as THREE from "lib/three/three";

import copyVs from "./shaders/copyVs.glsl";
import copyFs from "./shaders/copyFs.glsl";

import positionFs from "./shaders/positionFs.glsl";


/**
 * DoubleFBO
 * @constructor
 */
export default class DoubleFBO
{
	constructor(width, renderer, textureInput)
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
	}

	init()
	{
		const gl = this._renderer.getContext();

		//TODO better errors management
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
		this._dtPosition = this._getInitPositionsTexture();

		this._rtPosition1 = this.getRenderTarget(THREE.RGBAFormat, this._width, this._width);
		this._rtPosition2 = this._rtPosition1.clone();

		// Shaders
		this._copyShader = new THREE.ShaderMaterial( 
		{
			uniforms: 
			{
				uTexture: { type: "t", value: null }
			},
			vertexShader: copyVs,
			fragmentShader: copyFs,
			depthTest: false
		});

		this.positionShader = new THREE.ShaderMaterial( 
		{
			uniforms: 
			{
				uResolutionInput: { type: "v2", value: new THREE.Vector2(this._textureInput.image.width, this._textureInput.image.height) },
				uResolutionOutput: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
				
				uTexturePosition: { type: "t", value: null },
				uTexturePositionInit: { type: "t", value: this._dtPosition },
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
				uInvert: { type: "i", value: null },

		 		uMapStrength: { type: "f", value: 0.1 }
			},
			vertexShader: copyVs,
			fragmentShader: positionFs,
			depthTest: false
		});
		
		// Mesh
		this._mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this._copyShader);
		this._scene.add(this._mesh);
		
		// Init position		
		this._renderTexture(this._dtPosition, this._rtPosition1);
		// this._renderTexture(this._dtPosition, this._rtPosition2);
	}

	render()
	{
		if (this._pingPong)
			this._renderShader(this._rtPosition1, this._rtPosition2);
		else 
			this._renderShader(this._rtPosition2, this._rtPosition1);

		this._pingPong = !this._pingPong;
	}

	resize(width, height)
	{
		this.positionShader.uniforms.uResolutionOutput.value.x = width;
		this.positionShader.uniforms.uResolutionOutput.value.y = height;

		this.positionShader.uniforms.uResolutionInput.value.x = width;
		this.positionShader.uniforms.uResolutionInput.value.y = height;
	}

	getRenderTarget(type, width, height) 
	{
		const renderTarget = new THREE.WebGLRenderTarget(width, height, 
		{
			// wrapS: THREE.ClampToEdgeWrapping,
			// wrapT: THREE.ClampToEdgeWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: type,
			type: THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false
		});
		renderTarget.texture.generateMipmaps = false;

		return renderTarget;
	}

	//-----------------------------------------------------o private

	_renderTexture(input, output) 
	{
		this._mesh.material = this._copyShader;

		this._copyShader.uniforms.uTexture.value = input;

		this._renderer.render(this._scene, this._camera, output);
	}

	_renderShader(input, output)
	{
		this._mesh.material = this.positionShader;

		this.positionShader.uniforms.uTexturePosition.value = input.texture;

		this.currentTexture = input.texture;

		this._renderer.render(this._scene, this._camera, output);
	}

	_getInitPositionsTexture()
	{
		const entries = 4;
		const a = new Float32Array(this._particles * entries);

		for (let i = 0, l = a.length; i < l; i += entries)
		{
			const x = (Math.random() * this._textureInput.image.width) / this._textureInput.image.width;
			const y = (Math.random() * this._textureInput.image.height) / this._textureInput.image.height;

			const ratio = 0.001;
			const vx = (Math.random() - 0.5) * ratio;
			const vy = (Math.random() - 0.5) * ratio;

			a[ i + 0 ] = x;
			a[ i + 1 ] = y;
			a[ i + 2 ] = vx;
			a[ i + 3 ] = vy;
		}

		const texture = new THREE.DataTexture(a, this._width, this._width, THREE.RGBAFormat, THREE.FloatType);
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		texture.flipY = false;

		return texture;
	}
}