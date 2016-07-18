// 2 colors
// gl_FragColor = vec4(mix(uColor2, uColor, vec3(clamp( vReflectionFactor, 0.0, 1.0 ))), 1.0);

// mix
// gl_FragColor = mix( vec4(uColor, 1.0), reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );

#ifdef FRESNEL_ENV

// vec4 refractedColor = vec4( 1.0 );
// refractedColor.r = textureCube( envMap, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
// refractedColor.g = textureCube( envMap, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
// refractedColor.b = textureCube( envMap, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;

// vec4 reflectedColor = textureCube( envMap, vec3( -vReflect.x, vReflect.yz ) );

outgoingLight = mix( uColor2.rgb, uColor.rgb, clamp( vReflectionFactorColor, 0.0, 1.0 ) );

vec4 refractedColor = texture2DProj( uSampler, mirrorCoord );
// outgoingLight += refractedColor.rgb * clamp( vReflectionFactor, 0.0, 1.0 ) * vec3(uReflectionPower);
// outgoingLight = refractedColor.rgb * clamp( vReflectionFactor, 0.0, 1.0 );

// outgoingLight = mix( outgoingLight, refractedColor.rgb, 0.1 );
// outgoingLight += refractedColor.rgb; // maybe add 
// envmap
// gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );

#else

outgoingLight = mix( outgoingLight, uColor.rgb, clamp( vReflectionFactor, 0.0, 1.0 ) );

#endif