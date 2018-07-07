uniform vec3 uColor;
uniform float uAlpha;
uniform float uDensity;
uniform float uPointSize;
// uniform sampler2D uTexture;

void main()
{
	// bitmap texture
	// vec4 texture = texture2D(uTexture, p);
	// gl_FragColor = vec4(texture.r, texture.g, texture.b, 1.0);

	// gradient from the center of shader pixel
	vec2 center = (gl_PointCoord.xy - 0.5) * 2.0;
	float l = pow(length(center), uDensity);
	float s = step(2., uPointSize);
	float a = ((1. - s) + s * clamp(1.0 - l, 0., 1.)) * uAlpha;

	gl_FragColor = vec4(uColor, a);
}