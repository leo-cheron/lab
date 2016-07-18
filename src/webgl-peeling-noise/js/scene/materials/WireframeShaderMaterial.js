"use strict";

var THREE = require("lib/three/three");
var VS = require("../shaders/mainVs.glsl");
var VSPars = require("../shaders/mainVs_pars.glsl");
var FS = require("../shaders/mainFs.glsl");
var FSPars = require("../shaders/mainFs_pars.glsl");

/**
 * MainShaderMaterial
 * @constructor
 */
var MainShaderMaterial = module.exports = function(parameters)
{
	THREE.ShaderMaterial.call(this);

	// this.type = 'LineBasicMaterial';

	// this.linewidth = 1;
	// this.linecap = 'round';
	// this.linejoin = 'round';

	// this.vertexColors = THREE.NoColors;

	this.uniforms = THREE.UniformsUtils.merge( 
	[
		THREE.UniformsLib[ "common" ],
		THREE.UniformsLib[ "aomap" ],
		// THREE.UniformsLib[ "fog" ]
		{
			// "color" : { type: "c", value: new THREE.Color( 0xFF0000 ) },
			"time": { type: "f", value: 1.0 },
			"timeline": { type: "f", value: 0.0 },
			"orientation": { type: "f", value: 1.0 },
			"noiseInverted": { type: "f", value: 0 },
			
			// "fogNear": { type: "f", value: 1.0 },
			// "fogFar": { type: "f", value: 2000.0 },
			"fogColor": { type: "c", value: new THREE.Color( 0x000000 ) },
			"mouse": { type: "v3", value: new THREE.Vector3(0, 1000, 0) },
			
			"noiseScale": { type: "f", value: 1.0 },
			"noiseTranslation": { type: "v2", value: new THREE.Vector2(0, 0) },
			"noiseThresholding": { type: "f", value: 0. },
			"noiseStrength": { type: "f", value: 0.5 },
		}
	]);

	for (var p in parameters)
	{
		if(this.uniforms[p] !== undefined)
		{
			this.uniforms[p].value = parameters[p];
			delete parameters[p];
		}
	}

 	this.vertexShader = 
 	[
		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "uv_pars_vertex" ],
		THREE.ShaderChunk[ "uv2_pars_vertex" ],
		// THREE.ShaderChunk[ "envmap_pars_vertex" ],
		THREE.ShaderChunk[ "color_pars_vertex" ],
		// THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
		// THREE.ShaderChunk[ "skinning_pars_vertex" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],
		VSPars,

		"void main() {",

			THREE.ShaderChunk[ "uv_vertex" ],
			THREE.ShaderChunk[ "uv2_vertex" ],
			THREE.ShaderChunk[ "color_vertex" ],

			THREE.ShaderChunk[ "begin_vertex" ],
			// THREE.ShaderChunk[ "morphtarget_vertex" ],
			// THREE.ShaderChunk[ "skinning_vertex" ],
			THREE.ShaderChunk[ "project_vertex" ],
			THREE.ShaderChunk[ "logdepthbuf_vertex" ],
			VS,

			THREE.ShaderChunk[ "worldpos_vertex" ],
			// THREE.ShaderChunk[ "envmap_vertex" ],
		"}"
	].join( "\n" );

	this.fragmentShader = [

		"uniform vec3 diffuse;",
		"uniform float opacity;",

		"#ifndef FLAT_SHADED",

		"	varying vec3 vNormal;",

		"#endif",

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "uv_pars_fragment" ],
		THREE.ShaderChunk[ "uv2_pars_fragment" ],
		THREE.ShaderChunk[ "map_pars_fragment" ],
		// THREE.ShaderChunk[ "alphamap_pars_fragment" ],
		THREE.ShaderChunk[ "aomap_pars_fragment" ],
		// THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		// THREE.ShaderChunk[ "specularmap_pars_fragment" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

		FSPars,

		"void main() {",

			"	vec4 diffuseColor = vec4( diffuse, opacity );",

				THREE.ShaderChunk[ "logdepthbuf_fragment" ],
				THREE.ShaderChunk[ "map_fragment" ],
				THREE.ShaderChunk[ "color_fragment" ],
				THREE.ShaderChunk[ "alphamap_fragment" ],
				THREE.ShaderChunk[ "alphatest_fragment" ],
				// THREE.ShaderChunk[ "specularmap_fragment" ],

			"	ReflectedLight reflectedLight;",
			"	reflectedLight.directDiffuse = vec3( 0.0 );",
			// "	reflectedLight.directSpecular = vec3( 0.0 );",
			"	reflectedLight.indirectDiffuse = diffuseColor.rgb;",
			// "	reflectedLight.indirectSpecular = vec3( 0.0 );",

				THREE.ShaderChunk[ "aomap_fragment" ],

			"	vec3 outgoingLight = reflectedLight.indirectDiffuse;",

				// THREE.ShaderChunk[ "envmap_fragment" ],
				THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
				THREE.ShaderChunk[ "fog_fragment" ],
				FS,

			"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			"}"

	].join( "\n" );

	// this.lights = true;
	this.setValues(parameters);
};

MainShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);