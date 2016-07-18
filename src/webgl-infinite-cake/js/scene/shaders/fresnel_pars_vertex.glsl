uniform float uFresnelBias;
uniform float uFresnelScale;
uniform float uFresnelPower;

uniform float uFresnelColorBias;
uniform float uFresnelColorScale;
uniform float uFresnelColorPower;

#ifdef FRESNEL_ENV

// uniform float uRefractionRatio;
// varying vec3 vRefract[3];
uniform mat4 textureMatrix;
varying vec4 mirrorCoord;

// varying vec3 vReflect;
varying float vReflectionFactorColor;

#endif

varying float vReflectionFactor;