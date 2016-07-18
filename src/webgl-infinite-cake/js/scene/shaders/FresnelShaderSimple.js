var THREE = require("lib/three/three");

var FresnelParsVs = require("./fresnel_pars_vertex.glsl");
var FresnelVs = require("./fresnel_vertex.glsl");

var FresnelParsFs = require("./fresnel_pars_fragment.glsl");
var FresnelFs = require("./fresnel_fragment.glsl");

var MapFragment = require("./map_fragment_floor.glsl");

/**
 * FresnelShaderSimple
 * @constructor
 */
var FresnelShaderSimple = module.exports = function(params)
{
	this.uniforms = THREE.UniformsUtils.merge( [

		THREE.UniformsLib[ "common" ],
		THREE.UniformsLib[ "fog" ],
		THREE.UniformsLib[ "lights" ],
		THREE.UniformsLib[ "shadowmap" ],
		
		// lambert
		{
			"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
		},

		// fresnel
		{
			"uColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
			"uColor2": { type: "c", value: new THREE.Color( 0xFFFFFF ) },

			"uSampler": { type: "t", value: null },

			"uFresnelBias": { type: "f", value: 0.1 },
			"uFresnelScale": { type: "f", value: 1.0 },
			"uFresnelPower": { type: "f", value: 2.0 },
			"uReflectionPower": { type: "f", value: 0.3 },

			"uFresnelColorBias": { type: "f", value: 0.1 },
			"uFresnelColorScale": { type: "f", value: 1.0 },
			"uFresnelColorPower": { type: "f", value: 2.0 },
		},
	] );

	for (param in params)
	{
		if(this.uniforms[param] !== undefined)
		{
			this.uniforms[param].value = params[param];
		}
	}

	console.log("FresnelShaderSimple", this.uniforms);

	// vertexshader
	this.vertexShader = [

		"#define LAMBERT",

		"varying vec3 vLightFront;",

		/*"#ifdef DOUBLE_SIDED",

		"	varying vec3 vLightBack;",

		"#endif",*/

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "uv_pars_vertex" ],
		THREE.ShaderChunk[ "uv2_pars_vertex" ],
		THREE.ShaderChunk[ "envmap_pars_vertex" ],
		THREE.ShaderChunk[ "lights_lambert_pars_vertex" ],
		THREE.ShaderChunk[ "color_pars_vertex" ],
		// THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
		// THREE.ShaderChunk[ "skinning_pars_vertex" ],
		THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

		params.envMap !== undefined ? "#define FRESNEL_ENV" : "",
		FresnelParsVs(),

		"void main() {",

			THREE.ShaderChunk[ "uv_vertex" ],
			THREE.ShaderChunk[ "uv2_vertex" ],
			THREE.ShaderChunk[ "color_vertex" ],

			THREE.ShaderChunk[ "beginnormal_vertex" ],
			// THREE.ShaderChunk[ "morphnormal_vertex" ],
			// THREE.ShaderChunk[ "skinbase_vertex" ],
			// THREE.ShaderChunk[ "skinnormal_vertex" ],
			THREE.ShaderChunk[ "defaultnormal_vertex" ],

			THREE.ShaderChunk[ "begin_vertex" ],
			// THREE.ShaderChunk[ "morphtarget_vertex" ],
			// THREE.ShaderChunk[ "skinning_vertex" ],
			THREE.ShaderChunk[ "project_vertex" ],
			THREE.ShaderChunk[ "logdepthbuf_vertex" ],

			THREE.ShaderChunk[ "worldpos_vertex" ],
			THREE.ShaderChunk[ "envmap_vertex" ],
			THREE.ShaderChunk[ "lights_lambert_vertex" ],
			THREE.ShaderChunk[ "shadowmap_vertex" ],
			
			FresnelVs(),

		"}"

	].join( "\n" );

	// fragment shader
	this.fragmentShader = [

		"uniform vec3 diffuse;",
		"uniform vec3 emissive;",
		"uniform float opacity;",

		"varying vec3 vLightFront;",

		/*"#ifdef DOUBLE_SIDED",

		"	varying vec3 vLightBack;",

		"#endif",*/

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "uv_pars_fragment" ],
		THREE.ShaderChunk[ "uv2_pars_fragment" ],
		THREE.ShaderChunk[ "map_pars_fragment" ],
		THREE.ShaderChunk[ "alphamap_pars_fragment" ],
		THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		THREE.ShaderChunk[ "specularmap_pars_fragment" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

		params.envMap !== undefined ? "#define FRESNEL_ENV" : "",
		FresnelParsFs(),

		"void main() {",

		"	vec3 outgoingLight = vec3( 0.0 );",	// outgoing light does not have an alpha, the surface does
		"	vec4 diffuseColor = vec4( diffuse, opacity );",

			THREE.ShaderChunk[ "logdepthbuf_fragment" ],
			// THREE.ShaderChunk[ "map_fragment" ],
			MapFragment(),
			THREE.ShaderChunk[ "color_fragment" ],
			THREE.ShaderChunk[ "alphamap_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "specularmap_fragment" ],

		/*"	#ifdef DOUBLE_SIDED",

		"		if ( gl_FrontFacing )",
		"			outgoingLight += diffuseColor.rgb * vLightFront + emissive;",
		"		else",
		"			outgoingLight += diffuseColor.rgb * vLightBack + emissive;",

		"	#else",*/

		"		outgoingLight += diffuseColor.rgb * vLightFront + emissive;",

		/*"	#endif",*/


			THREE.ShaderChunk[ "envmap_fragment" ],
			THREE.ShaderChunk[ "shadowmap_fragment" ],
			
			FresnelFs(),

			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

			THREE.ShaderChunk[ "fog_fragment" ],

		"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

		"}"

	].join( "\n" );
};