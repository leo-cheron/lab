uniform sampler2D uTexturePosition;
uniform float uPointSize;

void main()
{
	vec2 uv = position.xy;
	vec4 tex = texture2D(uTexturePosition, uv);
	
	gl_PointSize = uPointSize;
	gl_Position = vec4(tex.xy * 2.0 - 1.0, 0.0, 1.0);
}