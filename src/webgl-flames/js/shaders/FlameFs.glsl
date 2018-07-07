precision highp float;
precision highp int;

uniform float time;

uniform float fogNear;
uniform float fogFar;
uniform vec3 fogColor;

uniform float streamVx;
uniform float streamVy;

uniform float noiseScale;
// uniform float noiseY;
uniform int displayNoise;

varying float vTimeInit;
varying vec2 vUv;
varying float vPower;

#define PI 3.1415926535897932384626433832795

@import ./noise3D;

void main()
{
	// fog
	// float depth = gl_FragCoord.z / gl_FragCoord.w;
	// float fogFactor = smoothstep(fogNear, fogFar, depth);
	// if(fogFactor == 1.0) discard;
	
	float t = time + vTimeInit;
	vec2 pos = -1.0 + 2.0 * vUv;
	pos *= 4.0;
	pos *= 1. + (vPower * 0.1);

	// noise
	vec2 uv = vUv * 2.0 - 1.0;
	float noise = 1.0;
	if(vPower > 0.)
	{
		float noiseVx = 1. * streamVx;
		float noiseVy = 1. * streamVy;
		vec2 noiseTranslate = -t * vec2(noiseVx, noiseVy);
		float disappearance = clamp(vPower - 1.0, 0., 0.2) * 5.;
		noise = snoise(vec3(pos * noiseScale + noiseTranslate, t * .05)) + 1.8 * (1.0 - vUv.y) * (2.0 - vPower - 2.0 * disappearance);
		noise *= 1.0 - disappearance;

		// float sy = 1.0 + noiseY * (1. - vPower * 1.2) - vUv.y / 0.5;
		// float noise2 = 1.0 - snoise(vec3(pos * noiseScale * 0.4 + noiseTranslate * 0.5, t * .01));
		// float fNoise = 1.0 - clamp(mix(noise, noise2, 0.5), 0.0, 1.0) * 1.2 * vPower;// + sy;
		// noise = clamp(0.0, 1.0, mix(noise, noise2, 0.5));

		// perturbation (displacement)
		float displacementNoiseVy = 0.87;//1. * streamVy;// 0.87;
		float displacementNoiseScale = 0.44;//noiseScale;// 0.44;
		vec2 displacementNoiseTranslate = -t * vec2(noiseVx, displacementNoiseVy);
		float displacementNoise = snoise(vec3(pos * displacementNoiseScale + displacementNoiseTranslate, t * .05));
		pos.xy += displacementNoise * vec2(uv.x, uv.y * 2. * vUv.y) * vPower;
	}

    // left / right orientation
	float vx = 1.0 - vUv.x * 2.0 - streamVx * 4.0;
    pos.x += vx * vUv.y * vUv.y;

	// flame
	float ny = (pos.y + 2.) / 2.;
	for(float baud = 1.; baud < 2.; baud += 1.)
	{
		pos.y += ny * ny * 0.03 * sin(64. * t / (0.5 + baud));
		pos.x += ny * 0.05 * cos((mod(2.8 * t, 2. * PI) + 1000.) / (1. + 0.05 * baud * cos(baud * baud) + pos.y / 1000.)) / (1. + baud);
	}
	pos.y -= (1. * vPower + 0.1) * fract(sin(t * (5. + 1.0 * vPower)));
	pos.x = abs(pos.x);

	vec3 color = vec3(0., 0., 0.);

	// yellow part
	float p = .04;
	float y = -pow(pos.x, 4.20) / (4.20 * p) * 4.20;
	float dir = length(pos - vec2(pos.x, y)) * sin(0.25);
	color.rg += smoothstep(0.0,1., .75 - dir);
	color.g /= 2.4;
	color *= (0.4 + abs((pos.y / 4.2 + 4.2)) / 4.2);
	color += pow(color.r, 1.1);
	color *= cos(-0.5 + pos.y * 0.4);

	// blue part
	pos.y += 1.5;
	vec3 dolor = vec3(0., 0., 0.);
	y = -pow(pos.x, 4.20) / (4.20 * p) * 4.20;
	dir = length(pos - vec2(pos.x, y)) * sin(0.3);
	dolor.bg += smoothstep(0.0, 1., .75 - dir);
	dolor.g /= 2.4;
	dolor *= (0.4 + abs((pos.y / 4.2 + 4.2)) / 4.2);
	dolor += pow(color.b, 1.1);
	dolor *= cos(-0.6 + pos.y * 0.4);
	dolor.rgb -= pow(length(dolor) / 16., 0.5);
	color = (color + dolor) / 2.;
	
	color *= clamp(noise, 0., 1.);
	
	if(displayNoise == 1)
		color = vec3(noise, noise, noise);

	// debug
	// color = vec3(vPower);
	// end debug

	gl_FragColor = vec4(color, 1.0);
	// gl_FragColor = vec4(color, 1.0 - fogFactor);
}