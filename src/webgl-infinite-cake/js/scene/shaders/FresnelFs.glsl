uniform samplerCube envMap;
uniform vec3 uColor;
uniform vec3 uColor2;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main()
{
	vec4 reflectedColor = textureCube( envMap, vec3( -vReflect.x, vReflect.yz ) );
	vec4 refractedColor = vec4( 1.0 );

	refractedColor.r = textureCube( envMap, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
	refractedColor.g = textureCube( envMap, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
	refractedColor.b = textureCube( envMap, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;

	// envmap
	// gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );

	// 2 colors
	// gl_FragColor = vec4(mix(uColor2, uColor, vec3(clamp( vReflectionFactor, 0.0, 1.0 ))), 1.0);
	
	// mix
	gl_FragColor = mix( vec4(uColor, 1.0), reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
}