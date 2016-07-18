uniform float uRefractionRatio;
uniform float uFresnelBias;
uniform float uFresnelScale;
uniform float uFresnelPower;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main() 
{
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

	vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

	vec3 I = worldPosition.xyz - cameraPosition;

	vReflect = reflect( I, worldNormal );
	vRefract[0] = refract( normalize( I ), worldNormal, uRefractionRatio );
	vRefract[1] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.99 );
	vRefract[2] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.98 );
	vReflectionFactor = uFresnelBias + uFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), uFresnelPower );

	gl_Position = projectionMatrix * mvPosition;
}