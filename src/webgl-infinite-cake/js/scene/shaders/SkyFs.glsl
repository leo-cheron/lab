uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 worldPosition;

void main() {

	float h = normalize( worldPosition + offset ).y;
	gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );

}