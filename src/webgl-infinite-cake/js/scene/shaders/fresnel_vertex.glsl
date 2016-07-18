// vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
// vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

vec3 fresnelWorldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

vec3 I = worldPosition.xyz - cameraPosition;

#ifdef FRESNEL_ENV

mirrorCoord = textureMatrix * worldPosition;

// vReflect = reflect( I, fresnelWorldNormal );

// vRefract[0] = refract( normalize( I ), worldNormal, uRefractionRatio );
// vRefract[1] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.99 );
// vRefract[2] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.98 );
vReflectionFactorColor = uFresnelColorBias + uFresnelColorScale * pow( 1.0 + dot( normalize( I ), fresnelWorldNormal ), uFresnelColorPower );

#endif

vReflectionFactor = uFresnelBias + uFresnelScale * pow( 1.0 + dot( normalize( I ), fresnelWorldNormal ), uFresnelPower );

// gl_Position = projectionMatrix * mvPosition;