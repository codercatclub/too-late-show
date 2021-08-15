varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;
varying float vReflectionFactor;


uniform float timeMSec;
uniform float cameraMove;
uniform vec3 fresnelColor;

#include <fog_pars_fragment>

void main() {
  vec3 finalColor = fresnelColor;
  gl_FragColor = vec4(vReflectionFactor*finalColor, vReflectionFactor);
  #include <fog_fragment>

}