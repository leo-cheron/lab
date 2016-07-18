precision mediump float;
precision mediump int;

// uniform mat4 modelMatrix;
// uniform vec3 cameraPosition;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 origin;
uniform float power;

attribute vec3 position;
attribute vec3 translate;
attribute vec2 uv;
attribute float timeInit;

varying vec2 vUv;
varying float vTimeInit;
varying float vPower;

void main()
{
	vTimeInit = timeInit;
	vUv = uv;
	vPower = power;

	// vec4 mvPosition = modelViewMatrix * vec4(translate + position, 1.0);
	vec4 mvPosition = modelViewMatrix * vec4(translate.x, position.yz + translate.yz, 1.0);
	mvPosition.x += position.x;
	mvPosition.xy += origin;

	gl_Position = projectionMatrix * mvPosition;
}