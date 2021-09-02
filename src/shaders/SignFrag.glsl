varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;
varying float vReflectionFactor;

uniform float timeMSec;
uniform float turnOnT;
uniform vec3 fresnelColor;

#include <fog_pars_fragment>

void main() {
  vec3 finalColor = (turnOnT * vReflectionFactor + 0.2) * fresnelColor;
  gl_FragColor = vec4(finalColor, 1.0);
  #include <fog_fragment>
}