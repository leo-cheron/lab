#ifdef FRESNEL_ENV

uniform sampler2D uSampler;
varying vec4 mirrorCoord;
// varying vec3 vRefract[3];
// varying vec3 vReflect;
uniform float uReflectionPower;

uniform vec3 uColor;
uniform vec3 uColor2;

#else

uniform vec3 uColor;

#endif

varying float vReflectionFactor;
varying float vReflectionFactorColor;