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
  gl_FragColor = (smoothstep(0.8,1.0,vReflectionFactor)) * vec4(1.0,1.0,1.0, 1.0);

  //gl_FragColor = dot(vNormal, vec3(1.0, 0.0, 1.0)) * vec4(1.0,1.0,1.0, 1.0);
  //gl_FragColor.rb += 0.5 * vNormal.rb;
  //gl_FragColor *= 0.3;
  #include <fog_fragment>
}