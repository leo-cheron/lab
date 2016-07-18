precision mediump float;
precision mediump int;

uniform mat4 modelMatrix;
// uniform vec3 cameraPosition;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 origin;
// uniform vec3 mouse;
uniform float breezeRadius;

attribute vec3 position;
attribute vec3 translate;
attribute vec2 uv;
attribute float timeInit;
attribute float power;

varying vec2 vUv;
varying float vTimeInit;
varying float vPower;

void main()
{
	vTimeInit = timeInit;
	vUv = uv;
	vPower = power;

	vec4 mvPosition = modelViewMatrix * vec4(translate + position, 1.0);
	// vec4 mvPosition = modelViewMatrix * vec4(translate.x + position.x, translate.y + position.y, translate.z + position.z, 1.0);
	// mvPosition.x += position.x;
	// mvPosition.xy += origin;

	// dmouse = distance(vec3(.0), mvPosition.xyz);
	// strength = 1.0 - distance(vec3(0.0, 0.0, -1000.0), mvPosition.xyz) / 500.;

	// float max = 300.;
 //    float dist = distance(vec3(0.0, -50.0, -1000.0), mvPosition.xyz);
 //    if(dist < max)
	// 	strength = 1.0 - dist / max;
 //    else
 //        strength = 0.;

	// strength = 1.0 - distance(mouse, mvPosition.xyz) / breezeRadius;

	// vec4 mvPosition = modelViewMatrix * vec4(position + translate, 1.0);
	// mvPosition.xyz += position;

	gl_Position = projectionMatrix * mvPosition;
}