uniform vec3 uColor;
uniform float uOpacity;

// uniform vec3 fogColor;
// uniform float fogNear;
// uniform float fogFar;

void main()
{
	// gradient from the center of shader pixel
	vec2 center = (gl_PointCoord.xy - 0.5) * 2.0;
	float len = length(center);
	float a = clamp(1.0 - len, 0.0, 1.0) * 2.0 * uOpacity;

	gl_FragColor = vec4(uColor, a);

	// fog
	// float depth = gl_FragCoord.z / gl_FragCoord.w;

	// float fogFactor = smoothstep(fogNear, fogFar, depth);
	// gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
}