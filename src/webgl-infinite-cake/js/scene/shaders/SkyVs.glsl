varying vec3 worldPosition;

void main() {

	vec4 mPosition = modelMatrix * vec4( position, 1.0 );

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	worldPosition = mPosition.xyz;

}