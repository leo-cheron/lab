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

	this.uniforms = THREE.UniformsUtils.merge( 
	[
		THREE.UniformsLib[ "common" ],
		THREE.UniformsLib[ "lightmap" ],
		THREE.UniformsLib[ "normalmap" ],
		THREE.UniformsLib[ "ambient" ],
		THREE.UniformsLib[ "lights" ],
		{
			// "color" : { type: "c", value: new THREE.Color( 0xFF0000 ) },
			"emissive": { type: "c", value: new THREE.Color( 0x000000 ) },
			"specular": { type: "c", value: new THREE.Color( 0x111111 ) },
			"shininess": { type: "f", value: 30 },
			"time": { type: "f", value: 1.0 },
			"timeline": { type: "f", value: 1.0 },
			"fogNear": { type: "f", value: 1.0 },
			"fogFar": { type: "f", value: 2000.0 },
			"fogColor": { type: "c", value: new THREE.Color( 0x000000 ) },
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
		"#define PHONG",

		"varying vec3 vViewPosition;",

		"#ifndef FLAT_SHADED",

		"	varying vec3 vNormal;",

		"#endif",

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "uv_pars_vertex" ],
		THREE.ShaderChunk[ "uv2_pars_vertex" ],
		THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
		// THREE.ShaderChunk[ "envmap_pars_vertex" ],
		THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
		THREE.ShaderChunk[ "color_pars_vertex" ],
		// THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
		// THREE.ShaderChunk[ "skinning_pars_vertex" ],
		THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
		// THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],
		VSPars,

		"void main() {",

			THREE.ShaderChunk[ "uv_vertex" ],
			THREE.ShaderChunk[ "uv2_vertex" ],
			THREE.ShaderChunk[ "color_vertex" ],

			THREE.ShaderChunk[ "beginnormal_vertex" ],
			// THREE.ShaderChunk[ "morphnormal_vertex" ],
			THREE.ShaderChunk[ "defaultnormal_vertex" ],

		"#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

		"	vNormal = normalize( transformedNormal );",

		"#endif",

			THREE.ShaderChunk[ "begin_vertex" ],
			THREE.ShaderChunk[ "displacementmap_vertex" ],
			VS,
			// THREE.ShaderChunk[ "project_vertex" ],
			// THREE.ShaderChunk[ "logdepthbuf_vertex" ],

		"	vViewPosition = - mvPosition.xyz;",

			THREE.ShaderChunk[ "worldpos_vertex" ],
			THREE.ShaderChunk[ "lights_phong_vertex" ],
			THREE.ShaderChunk[ "shadowmap_vertex" ],
		"}"
	].join( "\n" );

	this.fragmentShader = [

		"#define PHONG",
		"#define USE_FOG",

		"uniform vec3 diffuse;",
		"uniform vec3 emissive;",
		"uniform vec3 specular;",
		"uniform float shininess;",
		"uniform float opacity;",

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "uv_pars_fragment" ],
		THREE.ShaderChunk[ "uv2_pars_fragment" ],
		THREE.ShaderChunk[ "map_pars_fragment" ],
		// THREE.ShaderChunk[ "alphamap_pars_fragment" ],
		// THREE.ShaderChunk[ "aomap_pars_fragment" ],
		THREE.ShaderChunk[ "lightmap_pars_fragment" ],
		THREE.ShaderChunk[ "emissivemap_pars_fragment" ],
		// THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		THREE.ShaderChunk[ "bsdfs" ],
		THREE.ShaderChunk[ "ambient_pars" ],
		THREE.ShaderChunk[ "lights_pars" ],
		THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
		THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		// THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
		THREE.ShaderChunk[ "normalmap_pars_fragment" ],
		THREE.ShaderChunk[ "specularmap_pars_fragment" ],
		// THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

		FSPars,

		"void main() {",

		"	vec4 diffuseColor = vec4( diffuse, opacity );",
		"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
		"	vec3 totalEmissiveLight = emissive;",

			// THREE.ShaderChunk[ "logdepthbuf_fragment" ],
			THREE.ShaderChunk[ "map_fragment" ],
			THREE.ShaderChunk[ "color_fragment" ],
			// THREE.ShaderChunk[ "alphamap_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "specularmap_fragment" ],
			THREE.ShaderChunk[ "normal_fragment" ],
			THREE.ShaderChunk[ "emissivemap_fragment" ],

			// accumulation
			THREE.ShaderChunk[ "lights_phong_fragment" ],
			THREE.ShaderChunk[ "lights_template" ],

			// modulation
			// THREE.ShaderChunk[ "aomap_fragment" ],

			"vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;",

			// THREE.ShaderChunk[ "envmap_fragment" ],
			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

			THREE.ShaderChunk[ "fog_fragment" ],

			FS,

		"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

		"}"

	].join( "\n" );

	this.vertexShaderDepth = 
 	[
		// "varying vec3 vViewPosition;",

		// "#ifndef FLAT_SHADED",

		// "	varying vec3 vNormal;",

		// "#endif",

		THREE.ShaderChunk[ "common" ],
		// THREE.ShaderChunk[ "uv_pars_vertex" ],
		// THREE.ShaderChunk[ "uv2_pars_vertex" ],
		// THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
		// THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
		// THREE.ShaderChunk[ "color_pars_vertex" ],
		// THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
		// THREE.ShaderChunk[ "skinning_pars_vertex" ],
		// THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
		// THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],
		VSPars,

		"void main() {",

			// THREE.ShaderChunk[ "uv_vertex" ],
			// THREE.ShaderChunk[ "uv2_vertex" ],
			// THREE.ShaderChunk[ "color_vertex" ],

			THREE.ShaderChunk[ "beginnormal_vertex" ],
			THREE.ShaderChunk[ "defaultnormal_vertex" ],

		// "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

		// "	vNormal = normalize( transformedNormal );",

		// "#endif",

			THREE.ShaderChunk[ "begin_vertex" ],
			// THREE.ShaderChunk[ "displacementmap_vertex" ],
			// THREE.ShaderChunk[ "morphtarget_vertex" ],
			// THREE.ShaderChunk[ "skinning_vertex" ],
			VS,
			// THREE.ShaderChunk[ "project_vertex" ],
			// THREE.ShaderChunk[ "logdepthbuf_vertex" ],

		// "	vViewPosition = - mvPosition.xyz;",

			THREE.ShaderChunk[ "worldpos_vertex" ],
			// THREE.ShaderChunk[ "envmap_vertex" ],
			// THREE.ShaderChunk[ "lights_phong_vertex" ],
			// THREE.ShaderChunk[ "shadowmap_vertex" ],
		"}"
	].join( "\n" );

	// this.lights = true;
	this.setValues(parameters);
};

MainShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);