var THREE = require("lib/three/three");

var FloorMaterialVs = require("./FloorMaterialVs.glsl");
var FloorMaterialFs = require("./FloorMaterialFs.glsl");


/**
 * FresnelShader
 * @constructor
 */
var FresnelShader = module.exports = function(params)
{
	this.uniforms = 
	{
		// fog
		"fogColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
		"fogNear": { type: "f", value: 2000 },
		"fogFar": { type: "f", value: 5000 },

		// reflection
		"uSampler": { type: "t", value: null },

		// envmap
		"uCube": { type: "t", value: null },
		"uTextureMatrix": { type: "m4", value: new THREE.Matrix4() },		
		"uFresnelBias": { type: "f", value: 0.1 },
		"uFresnelScale": { type: "f", value: 1.0 },
		"uFresnelPower": { type: "f", value: 2.0 },
		"uReflectionPower": { type: "f", value: 0.5 },
		// "uRefractionRatio": { type: "f", value: 1.02 },

		// texture
		"map": { type: "t", value: null },
		"offsetRepeat" : { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) },

		// fresnel colors
		"uColor1": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
		"uColor2": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
		"uFresnelColorBias": { type: "f", value: 0.1 },
		"uFresnelColorScale": { type: "f", value: 1.0 },
		"uFresnelColorPower": { type: "f", value: 2.0 },

		// shadowmap
		"shadowMap": { type: "tv", value: [] },
		"shadowMapSize": { type: "v2v", value: [] },

		"shadowBias" : { type: "fv1", value: [] },
		"shadowDarkness": { type: "fv1", value: [] },

		"shadowMatrix" : { type: "m4v", value: [] }
	};

	for (param in params)
	{
		if(this.uniforms[param] !== undefined)
		{
			this.uniforms[param].value = params[param];
		}
	}

	// vertexshader
	this.vertexShader = FloorMaterialVs;

	// fragment shader
	this.fragmentShader = FloorMaterialFs;
};