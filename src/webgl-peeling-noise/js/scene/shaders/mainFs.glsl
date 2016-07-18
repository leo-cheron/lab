// float noiseScale = 1./30.;
// vec3 noiseTranslate = -vTime * vec3(1., 1., 1.);
// float noise = snoise(vPosition * noiseScale + noiseTranslate);
// outgoingLight = vec3(vNoise);

// if(vT <= 0.01) discard;

// float noise = snoise(vCentroid.xy / 1000. + vTimeline * vec2(3.));
if(vNoise < noiseThresholding) discard;

// outgoingLight = mix(outgoingLight, fogColor, 1. - vT);
// outgoingLight = vec3(vNoise);