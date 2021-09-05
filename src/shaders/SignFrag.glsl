varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;
varying float vReflectionFactor;

uniform float timeMSec;
uniform float turnOnT;
uniform vec3 fresnelColor;

varying float vId;

#include <fog_pars_fragment>
@import ./NoiseFx; 

void main() {
  float flicker = smoothstep(0.98, 0.99, 0.5 + 0.5 * jagged(100.0 * vId + 6.0 * timeMSec));
  flicker *= step(0.0, vId);
  vec3 finalColor = (turnOnT * vReflectionFactor + 0.2 - 0.4 * flicker) * fresnelColor;
  gl_FragColor = vec4(finalColor, 1.0);
  #include <fog_fragment>
}