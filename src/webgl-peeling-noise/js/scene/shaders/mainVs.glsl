vec3 startingPoint = vec3(0., 0., 500.);

float dist = distance(startingPoint, centroid);
float tspeed = smoothstep(dist, dist + 100., 1300. * (timeline * 0.9 + speed * 0.1));
float t = cubicOut(smoothstep(.0, 1., tspeed));

float it = (1. - t);
// vT = t;
// vCentroid = centroid;
// vPosition = position;
// vTimeline = timeline;

// new centroid position
// vec3 translate = centroid * -0.2 * it;
// vec3 centroidPos = centroid + translate;

// turbulences
float transitionNoise = snoise(position / 100. + time * vec3(4.));
// float transitionNoise = snoise(centroid / 100. + time * vec3(10.));
// transformed += transitionNoise * vec3(10. * it);

float noise = (snoise(centroid.xy / (noiseScale * 3000.) + noiseTranslation) + 1.) / 2.;
if(noiseInverted == 1.) noise = 1. - noise;
vNoise = noise;

// transform 

// face transformation
vec3 axis = centroid - startingPoint;
// transformed = (transformed - centroid) * vec3(t) + centroid;
vec3 rAxis = axis * rotationMatrix(normal, PI / 10.);
// transformed = (transformed - centroid) * rotationMatrix(rAxis, mix(PI, 0., t)) + centroid;
// transformed *= rotationMatrix(centroid, mix(PI * orientation, 0., t));
transformed += transitionNoise * vec3(noiseStrength * 100. * (1. - smoothstep(.0, 1., noise * 2.)));
// transformed = (transformed - centroid) * rotationMatrix(centroid, mix(PI, 0., cubicOut(noise))) + centroid;

// vec3 translate = normal * vec3(1000. * timeline);
// transformed += translate;

// transformed += vec3(translate.x, translate.y / 5., translate.z);

// transformed *= rotationMatrix(centroid, mix(PI2 * 6. * transitionNoise * orientation, 0., t));
// transformed += vec3(translate.x, translate.y / 5., translate.z) + vec3(transitionNoise * it * 300.);
// transformed *= rotationMatrix(vec3(0., 1.0, 0.), mix(PI2 * speed * 2. * orientation, 0., t));

// repulsion
float d = distance(centroid, mouse);
float amplitudeNoise = snoise(centroid / 1200. + time * vec3(0.3));
float amplitude = 200. + 50. * amplitudeNoise;
float radius = 260.;
float amplitudeRatio = 1. - smoothstep(0., radius, d);
transformed *= rotationMatrix(centroid, PI * amplitudeRatio);
transformed += normal * amplitudeRatio * amplitude + 50. * amplitudeNoise * amplitudeRatio;

vec4 mvPos = modelViewMatrix * vec4(transformed, 1.0);

gl_Position = projectionMatrix * mvPos;