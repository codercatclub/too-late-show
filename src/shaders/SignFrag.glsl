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
  vec3 finalColor = mix(vec3(0.0, 0.0, 0.0), vec3(pow(turnOnT,10.0), 0.0, 0.0), smoothstep(0.2,0.5,vReflectionFactor));
  gl_FragColor = vec4(finalColor, 1.0);
  #include <fog_fragment>
}