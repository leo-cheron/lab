uniform float uSize;

void main()
{
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

	gl_PointSize = uSize * ( 300.0 / length( mvPosition.xyz ) );

	gl_Position = projectionMatrix * mvPosition;
}