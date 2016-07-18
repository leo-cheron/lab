uniform float time;
uniform float timeline;
uniform vec3 mouse;
uniform float orientation;

// varying float vTime;
// varying vec3 vPosition;
// varying float vNoise;
varying float vT;
// varying vec3 vMouse;

attribute float speed;
attribute vec3 centroid;

mat3 rotationMatrix(vec3 axis, float angle)
{
	axis = normalize(axis);
	float c = cos(angle);
	float s = sin(angle);
	float t = 1.0 - c;	
	float x = axis.x, y = axis.y, z = axis.z;

	return mat3(
		t * x * x + c,      t * x * y + s * z,  t * x * z - s * y,
		t * x * y - s * z,  t * y * y + c,      t * y * z + s * x,
		t * x * z + s * y,  t * y * z - s * x,  t * z * z + c
	);
}

@import ./noise3D;
@import ./easing/cubic-out;