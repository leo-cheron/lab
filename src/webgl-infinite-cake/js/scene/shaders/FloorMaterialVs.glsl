uniform float uFresnelBias;
uniform float uFresnelScale;
uniform float uFresnelPower;

uniform float uFresnelColorBias;
uniform float uFresnelColorScale;
uniform float uFresnelColorPower;

uniform mat4 uTextureMatrix;

uniform vec4 offsetRepeat;

varying vec2 vUv;
varying vec3 vReflect;		

// varying vec3 vRefract[3];
varying float vReflectionFactor;
varying float vReflectionFactorColor;

varying vec4 vMirrorCoord;

#ifdef USE_SHADOWMAP

	varying vec4 vShadowCoord[ MAX_SHADOWS ];
	uniform mat4 shadowMatrix[ MAX_SHADOWS ];

#endif


void main() 
{
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
	vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
	
	// vUv, needed for repeated texture
	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;

	// shadowmap
	#ifdef USE_SHADOWMAP

		for( int i = 0; i < MAX_SHADOWS; i ++ ) 
		{
			vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;
		}

	#endif

	// fresnel (http://blog.2pha.com/demos/threejs/shaders/fresnel_cube_env_2.html)
	vec3 I = worldPosition.xyz - cameraPosition;

	vMirrorCoord = uTextureMatrix * worldPosition;

	vReflect = reflect( I, worldNormal );
	// vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
	// vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
	// vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );

	vReflectionFactor = uFresnelBias + uFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), uFresnelPower );
	vReflectionFactorColor = uFresnelColorBias + uFresnelColorScale * pow( 1.0 + dot( normalize( I ), worldNormal ), uFresnelColorPower );

	gl_Position = projectionMatrix * mvPosition;
}