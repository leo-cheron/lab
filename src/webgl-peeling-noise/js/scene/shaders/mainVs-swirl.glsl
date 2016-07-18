float t = cubicOut(smoothstep(.0, 1., timeline * 2. - speed));

float it = (1. - t);
vT = t;

// new centroid position
vec3 translate = (centroid * 15.) * it;
vec3 centroidPos = centroid + translate;

// turbulences
float noiseScale = 2000.;
float transitionNoise = snoise(position / noiseScale);

// transform 

// scale face
transformed = (transformed - centroid) * vec3(t) + centroid; 

transformed *= rotationMatrix(centroid, mix(PI2 * 6. * transitionNoise * orientation, 0., t));
transformed += vec3(translate.x, translate.y / 5., translate.z) + vec3(transitionNoise * it * 300.);
transformed *= rotationMatrix(vec3(0., 1.0, 0.), mix(PI2 * speed * 2. * orientation, 0., t));

// repulsion
float d = distance(centroid, mouse);
float amplitudeNoise = snoise(centroid / 1200. + time * vec3(0.3));
float amplitude = 200. + 50. * amplitudeNoise;
float radius = 260.;
float amplitudeRatio = 1. - smoothstep(0., radius, d);
transformed *= rotationMatrix(centroid, PI * amplitudeRatio);
transformed += normal * amplitudeRatio * amplitude + 50. * amplitudeNoise * amplitudeRatio;

vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

gl_Position = projectionMatrix * mvPosition;