varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;

uniform float timeMSec;
uniform float playT;

void main() {
  float brightness = 1.0 - min(abs(vDist - playT)/0.05, 1.0);

  vec3 finalColor = brightness * vec3(1.0,1.0,1.0) + vec3(0.1,0.1,0.1);
  gl_FragColor = vec4(finalColor, 1.0);
}