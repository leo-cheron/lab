uniform vec3 uColor;
uniform float uAlpha;
// uniform sampler2D uTexture;

// vec3 hsv2rgb(vec3 c)
// {
//     vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
//     vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
//     return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
// }

void main()
{
	
	// vec4 texture = texture2D(uTexture, p);
	// gl_FragColor = vec4(texture.r, texture.g, texture.b, 1.0);

	// gl_FragColor = vec4(uColor, uAlpha);

	// gradient from the center of shader pixel
	vec2 center = (gl_PointCoord.xy - 0.5) * 2.0;
	float len = length(center);
	float a = clamp(1.0 - len, 0.0, 1.0) * uAlpha; //(1.0 - len) * uAlpha;

	// vec3 c = hsv2rgb(vec3(
	// 	u_hue,
	// 	u_saturation * len * timeFactor,
	// 	u_lightness + (1.0 - len)
	// ));

	gl_FragColor = vec4(uColor, a);
}