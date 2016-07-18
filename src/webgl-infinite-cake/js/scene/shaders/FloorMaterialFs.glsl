uniform samplerCube uCube;
uniform sampler2D uSampler;
uniform sampler2D map;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uReflectionPower;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec3 vReflect;
varying vec2 vUv;
// varying vec3 vRefract[3];
varying vec4 vMirrorCoord;

varying float vReflectionFactor;
varying float vReflectionFactorColor;


#ifdef USE_SHADOWMAP

	uniform sampler2D shadowMap[ MAX_SHADOWS ];
	uniform vec2 shadowMapSize[ MAX_SHADOWS ];

	uniform float shadowDarkness[ MAX_SHADOWS ];
	uniform float shadowBias[ MAX_SHADOWS ];

	varying vec4 vShadowCoord[ MAX_SHADOWS ];

	float unpackDepth( const in vec4 rgba_depth ) {

		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
		float depth = dot( rgba_depth, bit_shift );
		return depth;

	}

#endif

vec3 inputToLinear( in vec3 a ) {

	#ifdef GAMMA_INPUT

		return pow( a, vec3( float( GAMMA_FACTOR ) ) );

	#else

		return a;

	#endif

}

vec3 linearToOutput( in vec3 a ) {

#ifdef GAMMA_OUTPUT

	return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );

#else

	return a;

#endif

}

void main() 
{
	// fresnel
	vec4 mirrorColor = texture2DProj( uSampler, vMirrorCoord );

	float blend = length(step(0.1, mirrorColor.rgb));

	vec4 reflectedColor = textureCube( uCube, vec3( -vReflect.x, vReflect.yz ) );
	reflectedColor = mix(reflectedColor, mirrorColor, blend);

	// refractedColor.r = textureCube( uSampler, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
	// refractedColor.g = textureCube( uSampler, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
	// refractedColor.b = textureCube( uSampler, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;

	vec3 color = mix( uColor2.rgb, uColor1.rgb, clamp(vReflectionFactorColor, 0.0, 1.0));
	color = mix( color, reflectedColor.xyz, clamp( vReflectionFactor * uReflectionPower, 0.0, 1.0 ) );
	// color += mirrorColor * clamp( vReflectionFactor * uReflectionPower, 0.0, 1.0 );
	// color = mix( color, mirrorColor, clamp( vReflectionFactor, 0.0, 1.0 ) );

	// texture
	color += texture2D(map, vUv).xyz;

	// shadowMap
	#ifdef USE_SHADOWMAP

		#ifdef SHADOWMAP_DEBUG

			vec3 frustumColors[3];
			frustumColors[0] = vec3( 1.0, 0.5, 0.0 );
			frustumColors[1] = vec3( 0.0, 1.0, 0.8 );
			frustumColors[2] = vec3( 0.0, 0.5, 1.0 );

		#endif

		float fDepth;
		vec3 shadowColor = vec3( 1.0 );
		
		const int i = 0;

		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;

		// if ( something && something ) breaks ATI OpenGL shader compiler
		// if ( all( something, something ) ) using this instead

		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );

		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

		bool frustumTest = all( frustumTestVec );

		if ( frustumTest ) {

			shadowCoord.z += shadowBias[ i ];

			#if defined( SHADOWMAP_TYPE_PCF )

				// Percentage-close filtering
				// (9 pixel kernel)
				// http://fabiensanglard.net/shadowmappingPCF/

				float shadow = 0.0;

				const float shadowDelta = 1.0 / 9.0;

				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;

				float dx0 = -1.25 * xPixelOffset;
				float dy0 = -1.25 * yPixelOffset;
				float dx1 = 1.25 * xPixelOffset;
				float dy1 = 1.25 * yPixelOffset;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );

			#elif defined( SHADOWMAP_TYPE_PCF_SOFT )

				// Percentage-close filtering
				// (9 pixel kernel)
				// http://fabiensanglard.net/shadowmappingPCF/

				float shadow = 0.0;

				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;

				float dx0 = -1.0 * xPixelOffset;
				float dy0 = -1.0 * yPixelOffset;
				float dx1 = 1.0 * xPixelOffset;
				float dy1 = 1.0 * yPixelOffset;

				mat3 shadowKernel;
				mat3 depthKernel;

				depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
				depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
				depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
				depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
				depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
				depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
				depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
				depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
				depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );

				vec3 shadowZ = vec3( shadowCoord.z );
				shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));
				shadowKernel[0] *= vec3(0.25);

				shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));
				shadowKernel[1] *= vec3(0.25);

				shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));
				shadowKernel[2] *= vec3(0.25);

				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );

				shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );
				shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );

				vec4 shadowValues;
				shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );
				shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );
				shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );
				shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );

				shadow = dot( shadowValues, vec4( 1.0 ) );

				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );

			#else

				vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );
				float fDepth = unpackDepth( rgbaDepth );

				if ( fDepth < shadowCoord.z )

		// spot with multiple shadows is darker

					shadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );

		// spot with multiple shadows has the same color as single shadow spot

		// 					shadowColor = min( shadowColor, vec3( shadowDarkness[ i ] ) );

			#endif

		}

		#ifdef SHADOWMAP_DEBUG

			if ( inFrustum ) color *= frustumColors[ i ];

		#endif

		color *= shadowColor;

	#endif

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( fogNear, fogFar, depth );
	color = mix(color, fogColor, fogFactor);

	gl_FragColor = vec4(color, 1.0);
}